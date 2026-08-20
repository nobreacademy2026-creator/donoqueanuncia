import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  FileWarning,
  FlaskConical,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Route,
  Settings2,
  ShoppingCart,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { FunnelDraft } from "@/lib/funnel-content";
import { getMetaIntegrationStatus } from "@/lib/meta-conversions.functions";
import { testTrackingEvent, type StandardEventName } from "@/lib/tracking";

type TrackingEvent = Tables<"analytics_events">;
type Section =
  "overview" | "events" | "leads" | "conversions" | "origin" | "test" | "logs" | "pixel" | "settings";
type Period = "today" | "yesterday" | "7d" | "30d" | "month" | "custom";
type IntegrationStatus = Awaited<ReturnType<typeof getMetaIntegrationStatus>>;

const SECTIONS: Array<{ id: Section; label: string }> = [
  { id: "overview", label: "Visão Geral" },
  { id: "events", label: "Eventos" },
  { id: "leads", label: "Leads" },
  { id: "conversions", label: "Conversões" },
  { id: "origin", label: "Origem" },
  { id: "test", label: "Teste de Eventos" },
  { id: "logs", label: "Logs" },
  { id: "pixel", label: "Seu Pixel" },
  { id: "settings", label: "Configurações" },
];

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "today", label: "Hoje" },
  { id: "yesterday", label: "Ontem" },
  { id: "7d", label: "Últimos 7 dias" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "month", label: "Este mês" },
  { id: "custom", label: "Personalizado" },
];

const TEST_EVENTS: StandardEventName[] = [
  "PageView",
  "Lead",
  "Contact",
  "InitiateCheckout",
  "Purchase",
];

const STANDARD_EVENT_NAMES = new Set<string>([
  "PageView",
  "ViewContent",
  "Lead",
  "Contact",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
]);

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function periodRange(period: Period, customFrom: string, customTo: string) {
  const now = new Date();
  let from = startOfDay(now);
  let to = now;
  if (period === "yesterday") {
    from.setDate(from.getDate() - 1);
    to = new Date(from);
    to.setHours(23, 59, 59, 999);
  } else if (period === "7d") {
    from.setDate(from.getDate() - 6);
  } else if (period === "30d") {
    from.setDate(from.getDate() - 29);
  } else if (period === "month") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "custom" && customFrom) {
    from = startOfDay(new Date(`${customFrom}T00:00:00`));
    if (customTo) {
      to = new Date(`${customTo}T23:59:59.999`);
    }
  }
  return { from, to };
}

function payloadOf(event: TrackingEvent) {
  return event.payload && typeof event.payload === "object" && !Array.isArray(event.payload)
    ? (event.payload as Record<string, unknown>)
    : {};
}

function canonicalName(event: TrackingEvent) {
  const map: Record<string, string> = {
    PageView: "Visita",
    ViewContent: "Visualização",
    Lead: "Novo Lead",
    Contact: "Contato",
    InitiateCheckout: "Checkout",
    Purchase: "Venda",
    purchase: "Venda",
    "Compra Aprovada": "Venda",
    lead_capturado: "Lead",
    checkout_iniciado: "Checkout",
    pagina_vendas_visualizada: "Visualização",
    quiz_iniciado: "Início",
    AddToCart: "Carrinho",
    Search: "Pesquisa",
    Donate: "Doação",
    Subscribe: "Assinatura",
    StartTrial: "Teste Grátis",
    SubmitApplication: "Aplicação",
    // Status específicos de Webhooks (Cacto/Hotmart/Kiwify)
    abandoned_checkout: "Abandono de Checkout",
    checkout_abandoned: "Abandono de Checkout",
    waiting_payment: "Aguardando Pagamento",
    boleto_printed: "Boleto Gerado",
    pix_generated: "Pix Gerado",
    picpay_generated: "PicPay Gerado",
    approved: "Compra Aprovada",
    completed: "Compra Aprovada",
    paid: "Compra Aprovada",
    refused: "Compra Recusada",
    canceled: "Cancelada",
    refunded: "Reembolso",
    chargeback: "Chargeback",
    subscription_canceled: "Assinatura Cancelada",
  };

  // Se o nome do evento for um padrão (como Purchase), mas tivermos um status no payload
  const status = fallback(event, "status_amigavel") || fallback(event, "raw_status");
  if (status) {
    const key = String(status).toLowerCase();
    if (map[key]) return map[key];
  }

  return map[event.event_name] ?? event.event_name;
}

function fallback(event: TrackingEvent, key: string) {
  const value = payloadOf(event)[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

function eventValue(event: TrackingEvent) {
  if (event.value !== null) return event.value;
  const value = Number(fallback(event, "value"));
  return Number.isFinite(value) ? value : 0;
}

function eventSource(event: TrackingEvent) {
  const source = event.source ?? event.utm_source ?? fallback(event, "origem");
  if (!source || source === "direct") return "Acesso Direto";
  if (source === "webhook_externo") return "Plataforma Externa";
  if (source === "ig") return "Instagram";
  if (source === "fb") return "Facebook";
  return source;
}

function eventCampaign(event: TrackingEvent) {
  const campaign = event.campaign ?? event.utm_campaign;
  if (!campaign) return "Sem campanha";
  return campaign;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR") : "—";
}

function formatMoney(value: number, currency = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function masked(value: string | null) {
  if (!value) return "—";
  return value.length <= 8 ? "••••" : `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

function MetaStatusBadge({ status }: { status: string | null }) {
  const style =
    status === "sent"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : status === "pending"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : status === "error"
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-white/[0.04] text-zinc-500 border-white/10";
  const label =
    status === "sent"
      ? "Enviado"
      : status === "pending"
        ? "Pendente"
        : status === "error"
          ? "Erro"
          : "Não enviado";
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${style}`}>
      {label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
}) {
  return (
    <div className="metric-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <strong className="mt-2 block text-2xl font-semibold tracking-tight text-white">
            {value}
          </strong>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-400">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export function TrackingDashboard({ tracking }: { tracking?: FunnelDraft["tracking"] }) {
  const [section, setSection] = useState<Section>("overview");
  const [period, setPeriod] = useState<Period>("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TrackingEvent | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null);
  const [testEvent, setTestEvent] = useState<StandardEventName>("PageView");
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<
    Array<{
      event: string;
      time: string;
      eventId: string;
      pixel: string;
      api: string;
      error?: string;
    }>
  >([]);

  const range = useMemo(
    () => periodRange(period, customFrom, customTo),
    [period, customFrom, customTo],
  );
  const rangeFrom = range.from.toISOString();
  const rangeTo = range.to.toISOString();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", rangeFrom)
      .lte("created_at", rangeTo)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (queryError) {
      setError(queryError.message);
      setEvents([]);
    } else {
      setEvents(data ?? []);
    }
    setLoading(false);
  }, [rangeFrom, rangeTo]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    void getMetaIntegrationStatus()
      .then(setIntegration)
      .catch(() => setIntegration(null));
  }, []);

  const productionEvents = useMemo(() => events.filter((event) => !event.is_test), [events]);
  const metaEvents = useMemo(
    () => productionEvents.filter((event) => STANDARD_EVENT_NAMES.has(event.event_name)),
    [productionEvents],
  );
  const metrics = useMemo(() => {
    const visitors = new Set(metaEvents.map((event) => event.session_id).filter(Boolean)).size;
    const views = metaEvents.filter(
      (event) => event.event_name === "PageView" || event.event_name === "ViewContent",
    ).length;
    const leads = metaEvents.filter((event) => event.event_name === "Lead").length;
    const contacts = metaEvents.filter((event) => event.event_name === "Contact").length;
    const checkouts = metaEvents.filter((event) => event.event_name === "InitiateCheckout").length;
    const purchases = metaEvents.filter(
      (event) => 
        event.event_name.toLowerCase() === "purchase" || 
        canonicalName(event) === "Venda" ||
        canonicalName(event) === "Compra Aprovada"
    );
    const revenue = purchases.reduce((sum, event) => sum + eventValue(event), 0);
    return {
      visitors,
      views,
      leads,
      contacts,
      checkouts,
      purchases: purchases.length,
      conversion: visitors ? (leads / visitors) * 100 : 0,
      revenue,
    };
  }, [metaEvents]);

  const sources = useMemo(
    () => Array.from(new Set(metaEvents.map(eventSource))).sort(),
    [metaEvents],
  );
  const leads = metaEvents.filter(
    (event) =>
      canonicalName(event) === "Lead" &&
      (sourceFilter === "all" || eventSource(event) === sourceFilter),
  );
  const conversions = metaEvents.filter((event) =>
    ["InitiateCheckout", "Purchase"].includes(canonicalName(event)),
  );
  const logs = events.filter(
    (event) =>
      event.meta_api_status === "error" || event.meta_pixel_status === "error" || event.meta_error,
  );

  const origins = useMemo(() => {
    const grouped = new Map<
      string,
      {
        campaign: string;
        adSet: string;
        ad: string;
        leads: number;
        purchases: number;
        revenue: number;
      }
    >();
    for (const event of metaEvents) {
      const campaign = eventCampaign(event);
      const adSet = event.ad_set ?? "Sem conjunto";
      const ad = event.ad ?? "Sem anúncio";
      const key = `${campaign}\u0000${adSet}\u0000${ad}`;
      const item = grouped.get(key) ?? { campaign, adSet, ad, leads: 0, purchases: 0, revenue: 0 };
      if (canonicalName(event) === "Lead") item.leads += 1;
      if (canonicalName(event) === "Purchase") {
        item.purchases += 1;
        item.revenue += eventValue(event);
      }
      grouped.set(key, item);
    }
    return Array.from(grouped.values())
      .filter((item) => item.leads || item.purchases)
      .sort((a, b) => b.revenue - a.revenue || b.leads - a.leads);
  }, [metaEvents]);

  const runTest = async () => {
    setTesting(true);
    try {
      const result = await testTrackingEvent(
        testEvent,
        testEvent === "Purchase" ? { value: 1, currency: "BRL", test: true } : { test: true },
      );
      if (!result) throw new Error("Teste indisponível.");
      setTestResults((current) => [
        {
          event: testEvent,
          time: new Date().toLocaleString("pt-BR"),
          eventId: result.eventId,
          pixel: result.pixelStatus,
          api: result.apiStatus,
          ...(result.error ? { error: result.error } : {}),
        },
        ...current,
      ]);
      toast.success("Teste concluído sem criar compra real.");
      await loadEvents();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Falha ao testar evento.");
    } finally {
      setTesting(false);
    }
  };

  const renderTable = (rows: TrackingEvent[], kind: "events" | "leads" | "conversions") => (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Horário</th>
            <th>{kind === "leads" ? "Nome" : "Evento"}</th>
            <th>Canal</th>
            <th>Campanha</th>
            <th>{kind === "conversions" ? "Valor" : "Página"}</th>
            <th>Status Meta</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((event) => (
            <tr key={event.id}>
              <td className="whitespace-nowrap text-zinc-400">{formatDate(event.created_at)}</td>
              <td className="font-medium text-zinc-200">
                {kind === "leads" ? (event.client_name ?? "Não informado") : canonicalName(event)}
              </td>
              <td className="text-zinc-400">{eventSource(event)}</td>
              <td className="text-zinc-400">{eventCampaign(event)}</td>
              <td className="text-zinc-400">
                {kind === "conversions"
                  ? formatMoney(eventValue(event), event.currency ?? "BRL")
                  : (event.page_url ?? "—")}
              </td>
              <td>
                <MetaStatusBadge status={event.meta_api_status} />
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="admin-icon-button"
                  aria-label="Ver detalhes técnicos"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-zinc-500">
                Nenhum registro no período.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="admin-panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="admin-eyebrow">Rastreamento e conversões</p>
            <h2 className="text-xl font-semibold text-white">Jornada, atribuição e Meta</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Dados reais recebidos pela plataforma, sem atribuição presumida.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="admin-control"
            >
              {PERIODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void loadEvents()}
              className="admin-button-secondary"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </button>
          </div>
        </div>
        {period === "custom" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="admin-date-field">
              De
              <input
                type="date"
                value={customFrom}
                onChange={(event) => setCustomFrom(event.target.value)}
              />
            </label>
            <label className="admin-date-field">
              Até
              <input
                type="date"
                value={customTo}
                onChange={(event) => setCustomTo(event.target.value)}
              />
            </label>
          </div>
        ) : null}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                section === item.id
                  ? "bg-red-600 text-white"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="admin-panel flex items-start gap-3 border-red-500/20 p-5 text-red-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <strong className="block">Não foi possível consultar o rastreamento.</strong>
            <span className="text-sm text-red-300/70">{error}</span>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="admin-panel grid min-h-64 place-items-center">
          <Loader2 className="h-7 w-7 animate-spin text-red-400" />
        </div>
      ) : null}

      {!loading && section === "overview" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Visitantes" value={metrics.visitors} icon={Users} />
            <MetricCard label="Visualizações" value={metrics.views} icon={Eye} />
            <MetricCard label="Leads" value={metrics.leads} icon={UserRoundCheck} />
            <MetricCard label="Contatos" value={metrics.contacts} icon={MousePointerClick} />
            <MetricCard label="Checkouts iniciados" value={metrics.checkouts} icon={ShoppingCart} />
            <MetricCard label="Compras" value={metrics.purchases} icon={CheckCircle2} />
            <MetricCard
              label="Taxa de conversão"
              value={`${metrics.conversion.toFixed(1)}%`}
              icon={Activity}
            />
            <MetricCard
              label="Valor total de vendas"
              value={formatMoney(metrics.revenue)}
              icon={CircleDollarSign}
            />
          </div>
          <section className="admin-panel p-5">
            <div className="admin-section-heading mb-4">
              <p className="admin-eyebrow">Atividade recente</p>
              <h2>Últimos eventos</h2>
            </div>
            {renderTable(productionEvents.slice(0, 10), "events")}
          </section>
        </>
      ) : null}

      {!loading && section === "events" ? (
        <section className="admin-panel p-5">
          <div className="admin-section-heading mb-4">
            <p className="admin-eyebrow">Eventos</p>
            <h2>Eventos recebidos e disparados</h2>
          </div>
          {renderTable(events, "events")}
        </section>
      ) : null}

      {!loading && section === "leads" ? (
        <section className="admin-panel p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="admin-section-heading">
              <p className="admin-eyebrow">Leads</p>
              <h2>Leads identificados</h2>
            </div>
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="admin-control"
            >
              <option value="all">Todas as origens</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
          {renderTable(leads, "leads")}
        </section>
      ) : null}

      {!loading && section === "conversions" ? (
        <section className="admin-panel p-5">
          <div className="admin-section-heading mb-4">
            <p className="admin-eyebrow">Conversões</p>
            <h2>Checkouts e compras</h2>
          </div>
          {renderTable(conversions, "conversions")}
        </section>
      ) : null}

      {!loading && section === "origin" ? (
        <section className="admin-panel p-5">
          <div className="admin-section-heading mb-4">
            <p className="admin-eyebrow">Origem das conversões</p>
            <h2>Campanha → conjunto → anúncio</h2>
            <p>Dados ausentes permanecem como “Origem não identificada”.</p>
          </div>
          <div className="space-y-3">
            {origins.map((item) => (
              <div
                key={`${item.campaign}-${item.adSet}-${item.ad}`}
                className="rounded-2xl border border-white/[0.07] bg-black/20 p-4"
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-white">{item.campaign}</span>
                    <ChevronRight className="h-4 w-4 text-zinc-700" />
                    <span className="text-zinc-400">{item.adSet}</span>
                    <ChevronRight className="h-4 w-4 text-zinc-700" />
                    <span className="text-zinc-400">{item.ad}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-400">
                    <span>{item.leads} leads</span>
                    <span>{item.purchases} compras</span>
                    <strong className="text-emerald-400">{formatMoney(item.revenue)}</strong>
                  </div>
                </div>
              </div>
            ))}
            {origins.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">
                Ainda não há conversões atribuíveis neste período.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {!loading && section === "test" ? (
        <section className="admin-panel p-5 sm:p-6">
          <div className="admin-section-heading">
            <p className="admin-eyebrow">Ambiente seguro</p>
            <h2>Teste de Eventos</h2>
            <p>Testes não disparam Pixel no navegador e não criam registros financeiros reais.</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <select
              value={testEvent}
              onChange={(event) => setTestEvent(event.target.value as StandardEventName)}
              className="admin-control flex-1"
            >
              {TEST_EVENTS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void runTest()}
              disabled={testing}
              className="admin-button-primary"
            >
              {testing ? <Loader2 className="animate-spin" /> : <FlaskConical />} Testar evento
            </button>
          </div>
          {!integration?.testModeConfigured ? (
            <div className="mt-4 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0" /> Configure META_TEST_EVENT_CODE no
              servidor para enviar testes à Meta.
            </div>
          ) : null}
          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/[0.07]">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Horário</th>
                  <th>event_id</th>
                  <th>Pixel</th>
                  <th>API</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result) => (
                  <tr key={result.eventId}>
                    <td>{result.event}</td>
                    <td>{result.time}</td>
                    <td className="font-mono text-xs">{result.eventId}</td>
                    <td>
                      <MetaStatusBadge status={result.pixel} />
                    </td>
                    <td>
                      <MetaStatusBadge status={result.api} />
                    </td>
                    <td className="text-zinc-400">{result.error ?? "Teste processado"}</td>
                  </tr>
                ))}
                {testResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500">
                      Nenhum teste executado nesta sessão.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && section === "logs" ? (
        <section className="admin-panel p-5">
          <div className="admin-section-heading mb-4">
            <p className="admin-eyebrow">Logs</p>
            <h2>Falhas de rastreamento</h2>
          </div>
          <div className="space-y-3">
            {logs.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedEvent(event)}
                className="flex w-full items-start gap-4 rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4 text-left hover:border-red-500/20"
              >
                <FileWarning className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <span className="min-w-0">
                  <strong className="block text-sm text-white">
                    {canonicalName(event)} · Conversions API
                  </strong>
                  <small className="mt-1 block text-xs text-zinc-500">
                    {formatDate(event.created_at)}
                  </small>
                  <span className="mt-2 block truncate text-xs text-red-300/80">
                    {event.meta_error ?? "Falha sem detalhes adicionais."}
                  </span>
                </span>
              </button>
            ))}
            {logs.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">
                Nenhum erro de rastreamento no período.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {!loading && section === "pixel" ? (
        <section className="admin-panel p-5 sm:p-6">
          <div className="admin-section-heading">
            <p className="admin-eyebrow">Integração Externa</p>
            <h2>Seu Webhook da Plataforma</h2>
            <p>Use este link nas suas plataformas externas (Hotmart, Kiwify, Cacto) para receber notificações de venda.</p>
          </div>
          
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                URL do Webhook
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/api/public/webhook`}
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono text-xs text-zinc-300"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/public/webhook`);
                    toast.success("URL copiada!");
                  }}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Instruções de Configuração</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { title: "1. Copie a URL", desc: "Copie o link acima e acesse a sua plataforma de vendas." },
                  { title: "2. Crie o Webhook", desc: "Vá em Configurações > Webhooks e adicione uma nova URL." },
                  { title: "3. Selecione Eventos", desc: "Marque 'Compra Aprovada' ou 'Venda Realizada' para notificar." }
                ].map((step, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <strong className="mb-1 block text-xs text-primary">{step.title}</strong>
                    <p className="text-[11px] leading-relaxed text-zinc-500">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex gap-3">
                <Activity className="h-5 w-5 shrink-0 text-blue-400" />
                <div>
                  <h4 className="text-xs font-bold text-blue-300 uppercase">Como funciona?</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-blue-200/70">
                    Quando uma venda for feita na plataforma externa, ela enviará os dados para este link. 
                    Nossa plataforma registrará automaticamente como um evento de "Purchase" no seu Analytics, 
                    permitindo que você veja o faturamento real aqui no painel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && section === "settings" ? (
        <section className="admin-panel p-5 sm:p-6">
          <div className="admin-section-heading">
            <p className="admin-eyebrow">Configurações seguras</p>
            <h2>Status das integrações</h2>
            <p>Nenhuma credencial ou token é disponibilizado ao navegador.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              [
                "Pixel conectado",
                Boolean(tracking?.metaPixelId || integration?.pixelConfigured),
                tracking?.metaPixelId ? masked(tracking.metaPixelId) : integration?.maskedPixelId,
              ],
              [
                "Conversions API conectada",
                Boolean(integration?.capiConfigured),
                integration?.apiVersion,
              ],
              [
                "Último evento recebido",
                Boolean(events[0]),
                events[0] ? formatDate(events[0].created_at) : "Nenhum",
              ],
              [
                "Último evento enviado",
                Boolean(events.find((event) => event.meta_api_status === "sent")),
                formatDate(
                  events.find((event) => event.meta_api_status === "sent")?.created_at ?? null,
                ),
              ],
            ].map(([label, connected, detail]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-white/[0.07] bg-black/20 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-300">{String(label)}</span>
                  {connected ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Clock3 className="h-5 w-5 text-zinc-600" />
                  )}
                </div>
                <p className="mt-2 font-mono text-xs text-zinc-500">
                  {String(detail ?? "Não configurado")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs text-zinc-500">
            <Settings2 className="h-5 w-5 shrink-0" /> IDs públicos continuam no módulo Pixels e
            Tracking. Tokens permanecem exclusivamente nas variáveis do servidor.
          </div>
        </section>
      ) : null}

      {selectedEvent ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#15161a] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="admin-eyebrow">Diagnóstico técnico</p>
                <h3 className="text-lg font-semibold text-white">{canonicalName(selectedEvent)}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="admin-icon-button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Data", formatDate(selectedEvent.created_at)],
                ["event_id", selectedEvent.event_id ?? "Legado / indisponível"],
                ["Página", selectedEvent.page_url ?? "—"],
                ["Origem", eventSource(selectedEvent)],
                ["Campanha", eventCampaign(selectedEvent)],
                ["Conjunto", selectedEvent.ad_set ?? "Sem conjunto"],
                ["Anúncio", selectedEvent.ad ?? "Sem anúncio"],
                ["UTM Source", selectedEvent.utm_source ?? "—"],
                ["UTM Medium", selectedEvent.utm_medium ?? "—"],
                ["UTM Content", selectedEvent.utm_content ?? "—"],
                ["UTM Term", selectedEvent.utm_term ?? "—"],
                ["fbclid", masked(selectedEvent.fbclid)],
                ["fbp", masked(selectedEvent.fbp)],
                ["fbc", masked(selectedEvent.fbc)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-black/20 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    {label}
                  </dt>
                  <dd className="mt-1 break-all text-xs text-zinc-300">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.07] p-3">
                <span className="text-xs text-zinc-500">Meta Pixel</span>
                <div className="mt-2">
                  <MetaStatusBadge status={selectedEvent.meta_pixel_status} />
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.07] p-3">
                <span className="text-xs text-zinc-500">Conversions API</span>
                <div className="mt-2">
                  <MetaStatusBadge status={selectedEvent.meta_api_status} />
                </div>
              </div>
            </div>
            {selectedEvent.meta_error ? (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4 text-xs text-red-300">
                <strong className="block">Erro retornado</strong>
                <span className="mt-1 block">{selectedEvent.meta_error}</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

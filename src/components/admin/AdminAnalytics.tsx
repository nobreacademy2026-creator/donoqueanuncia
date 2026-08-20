import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  FileText,
  LayoutTemplate,
  MousePointerClick,
  RefreshCw,
  Search,
  ShoppingBag,
  Target,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { loadAdminAnalytics, resetAdminAnalytics } from "@/lib/admin-data.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminTab } from "./AdminShell";

type EventPayload = { stage?: string; source?: string; pergunta?: string } & Record<
  string,
  unknown
>;
type AnalyticsEvent = {
  id: string;
  event_name: string;
  payload: EventPayload | null;
  session_id: string | null;
  created_at: string | null;
  is_test: boolean;
};
type Period = "1" | "7" | "30" | "custom";

const FUNNEL_STEPS: Array<{ name: string; event: string; question?: string; stage?: string }> = [
  { name: "Início do quiz", event: "quiz_iniciado" },
  { name: "Pergunta 1", event: "quiz_resposta", question: "dor" },
  { name: "Pergunta 2", event: "quiz_resposta", question: "motivacao" },
  { name: "Quiz finalizado", event: "quiz_concluido" },
  { name: "Objeção", event: "etapa_visualizada", stage: "objection" },
  { name: "Benefícios", event: "etapa_visualizada", stage: "solution" },
  { name: "Depoimento", event: "etapa_visualizada", stage: "testimonial" },
  { name: "Oferta visualizada", event: "pagina_vendas_visualizada" },
  { name: "Clique no vídeo", event: "clique_video" },
  { name: "Checkout", event: "checkout_iniciado" },
];

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const value = error as { message?: string; details?: string; hint?: string; code?: string };
    return [value.message, value.details, value.hint, value.code && `Código: ${value.code}`]
      .filter(Boolean)
      .join(" · ");
  }
  return "O Supabase não retornou detalhes adicionais.";
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function countUniqueEvents(
  events: AnalyticsEvent[],
  eventName: string,
  predicate?: (payload: EventPayload | null) => boolean,
) {
  return new Set(
    events
      .filter((event) => event.event_name === eventName && (!predicate || predicate(event.payload)))
      .map((event) => event.session_id || event.id),
  ).size;
}

export function AdminAnalytics({
  mode,
  onNavigate,
}: {
  mode: "overview" | "analytics";
  onNavigate: (tab: AdminTab) => void;
}) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [period, setPeriod] = useState<Period>("7");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [search, setSearch] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    try {
      await resetAdminAnalytics();
      setResetOpen(false);
      setRefreshKey((value) => value + 1);
      toast.success("Métricas zeradas. A contagem recomeça a partir de agora.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setResetting(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError("");
      let data: unknown;
      let error: unknown;
      try {
        data = await loadAdminAnalytics();
      } catch (loadFailure) {
        error = loadFailure;
      }
      if (!active) return;
      if (error) {
        const detail = errorMessage(error);
        console.error("[Admin Analytics] Falha na consulta analytics_events", { error, detail });
        if (detail.includes("Sessão administrativa inválida")) {
          setLoadError("Sua sessão expirou. Entre novamente para ver as métricas.");
          window.setTimeout(() => {
            window.location.assign("/auth");
          }, 800);
        } else {
          setLoadError(detail);
        }
        setLoading(false);
        return;
      }
      setEvents((data ?? []) as AnalyticsEvent[]);
      setUpdatedAt(new Date());
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    const channel = supabase
      .channel("premium-admin-analytics")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "analytics_events" },
        () => setRefreshKey((value) => value + 1),
      )
      .subscribe((status, error) => {
        if (error) console.error("[Admin Analytics] Realtime indisponível", { status, error });
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const range = useMemo(() => {
    const end = period === "custom" && customEnd ? new Date(`${customEnd}T23:59:59`) : new Date();
    const start =
      period === "custom" && customStart
        ? new Date(`${customStart}T00:00:00`)
        : startOfDay(
            new Date(end.getTime() - (Number(period === "custom" ? 7 : period) - 1) * 86_400_000),
          );
    return { start, end };
  }, [period, customStart, customEnd]);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        if (event.is_test) return false;
        const createdAt = event.created_at ? new Date(event.created_at) : null;
        return createdAt && createdAt >= range.start && createdAt <= range.end;
      }),
    [events, range],
  );

  const previousEvents = useMemo(() => {
    const duration = range.end.getTime() - range.start.getTime();
    const previousEnd = new Date(range.start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);
    return events.filter((event) => {
      const createdAt = event.created_at ? new Date(event.created_at) : null;
      return createdAt && createdAt >= previousStart && createdAt <= previousEnd;
    });
  }, [events, range]);

  const stats = useMemo(
    () => ({
      access: countUniqueEvents(filteredEvents, "quiz_iniciado"),
      completion: countUniqueEvents(filteredEvents, "quiz_concluido"),
      video: countUniqueEvents(filteredEvents, "clique_video"),
      checkout: countUniqueEvents(filteredEvents, "checkout_iniciado"),
    }),
    [filteredEvents],
  );

  const previousStats = useMemo(
    () => ({
      access: countUniqueEvents(previousEvents, "quiz_iniciado"),
      completion: countUniqueEvents(previousEvents, "quiz_concluido"),
      video: countUniqueEvents(previousEvents, "clique_video"),
      checkout: countUniqueEvents(previousEvents, "checkout_iniciado"),
    }),
    [previousEvents],
  );

  const chartData = useMemo(() => {
    const days = Math.max(
      1,
      Math.ceil((range.end.getTime() - range.start.getTime()) / 86_400_000) + 1,
    );
    return Array.from({ length: Math.min(days, 31) }, (_, index) => {
      const day = new Date(range.start.getTime() + index * 86_400_000);
      const key = localDateKey(day);
      const dayEvents = filteredEvents.filter(
        (event) => event.created_at && localDateKey(new Date(event.created_at)) === key,
      );
      return {
        date: day.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", ""),
        acessos: countUniqueEvents(dayEvents, "quiz_iniciado"),
        finalizacoes: countUniqueEvents(dayEvents, "quiz_concluido"),
        checkouts: countUniqueEvents(dayEvents, "checkout_iniciado"),
      };
    });
  }, [filteredEvents, range]);

  const funnel = useMemo(
    () =>
      FUNNEL_STEPS.map((step, index) => {
        const count = countUniqueEvents(
          filteredEvents,
          step.event,
          step.question
            ? (payload) => payload?.pergunta === step.question
            : step.stage
              ? (payload) => payload?.["etapa"] === step.stage
              : undefined,
        );
        const previous =
          index === 0
            ? count
            : (() => {
                const prior = FUNNEL_STEPS[index - 1]!;
                return countUniqueEvents(
                  filteredEvents,
                  prior.event,
                  prior.question
                    ? (payload) => payload?.pergunta === prior.question
                    : prior.stage
                      ? (payload) => payload?.["etapa"] === prior.stage
                      : undefined,
                );
              })();
        return {
          ...step,
          count,
          progress: percent(count, stats.access),
          drop: index === 0 ? 0 : Math.max(0, 100 - percent(count, previous)),
        };
      }),
    [filteredEvents, stats.access],
  );

  const visibleEvents = useMemo(
    () =>
      filteredEvents.filter((event) =>
        JSON.stringify(event).toLowerCase().includes(search.toLowerCase()),
      ),
    [filteredEvents, search],
  );

  const exportCsv = () => {
    if (!visibleEvents.length) {
      toast.info("Não há dados no período selecionado.");
      return;
    }
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Evento", "Sessão", "Detalhes", "Data"],
      ...visibleEvents.map((event) => [
        event.event_name,
        event.session_id,
        JSON.stringify(event.payload),
        event.created_at,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + rows.map((row) => row.map(quote).join(";")).join("\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `dono-que-anuncia-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const metrics = [
    {
      label: "Acessos totais",
      value: stats.access,
      icon: Users,
      tone: "blue",
      description: "Inícios reais do quiz no período",
      previous: previousStats.access,
    },
    {
      label: "Funis finalizados",
      value: stats.completion,
      icon: Target,
      tone: "green",
      description: "Usuários que concluíram o diagnóstico",
      previous: previousStats.completion,
    },
    {
      label: "Cliques no vídeo",
      value: stats.video,
      icon: Video,
      tone: "purple",
      description: "Interações registradas com o vídeo",
      previous: previousStats.video,
    },
    {
      label: "Checkouts iniciados",
      value: stats.checkout,
      icon: ShoppingBag,
      tone: "red",
      description: "Cliques reais nos botões de compra",
      previous: previousStats.checkout,
    },
  ];

  if (loadError) {
    const permission = /permission|403|42501|rls/i.test(loadError);
    return (
      <SystemState
        icon={AlertTriangle}
        title={permission ? "Permissão de leitura negada" : "Não foi possível carregar as métricas"}
        description={
          permission
            ? "Sua sessão não possui acesso à tabela de eventos. Verifique a função de administrador e as políticas RLS."
            : "A conexão com o Supabase falhou. Você pode tentar novamente sem sair desta página."
        }
        action={() => setRefreshKey((value) => value + 1)}
        details={loadError}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails((value) => !value)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-rise-in">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
            <Activity className="h-4 w-4" /> Dados conectados em tempo real
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {mode === "overview" ? "Sua operação em um só lugar" : "Analytics e Métricas"}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-zinc-500">
            {mode === "overview"
              ? "Acompanhe os indicadores essenciais e identifique rapidamente onde agir."
              : "Acompanhe o desempenho e a conversão do seu funil em tempo real."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            className="admin-control"
            aria-label="Selecionar período"
          >
            <option value="1">Hoje</option>
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="custom">Personalizado</option>
          </select>
          <button className="admin-button-secondary" onClick={exportCsv}>
            <Download /> Exportar relatório
          </button>
          <button
            className="admin-button-secondary text-red-400"
            onClick={() => setResetOpen(true)}
            disabled={loading || resetting}
          >
            <Trash2 /> Zerar métricas
          </button>
          <button
            className="admin-button-primary"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} /> Atualizar dados
          </button>
        </div>
      </section>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zerar todas as métricas?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os eventos registrados serão apagados permanentemente e a contagem recomeça a
              partir de agora. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleReset();
              }}
              disabled={resetting}
            >
              {resetting ? "Zerando..." : "Sim, zerar tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {period === "custom" && (
        <div className="admin-panel flex flex-wrap gap-3 p-4">
          <label className="admin-date-field">
            Data inicial
            <input
              type="date"
              value={customStart}
              onChange={(event) => setCustomStart(event.target.value)}
            />
          </label>
          <label className="admin-date-field">
            Data final
            <input
              type="date"
              value={customEnd}
              onChange={(event) => setCustomEnd(event.target.value)}
            />
          </label>
        </div>
      )}

      {updatedAt && (
        <p className="-mt-3 text-right text-[11px] text-zinc-600">
          Atualizado às{" "}
          {updatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
            loading={loading}
            chart={chartData.map((item) => item.acessos)}
          />
        ))}
      </div>

      {!loading && filteredEvents.length === 0 ? (
        <SystemState
          icon={BarChart3}
          title="Nenhum dado disponível"
          description="Ainda não existem eventos registrados para o período selecionado. Os indicadores aparecerão assim que o funil receber acessos."
        />
      ) : (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,.8fr)]">
          <section className="admin-panel min-w-0 p-5 sm:p-6">
            <PanelHeading
              title="Desempenho do funil"
              description="Evolução diária dos principais eventos"
            />
            <div className="mt-6 h-[300px] w-full" aria-label="Gráfico de desempenho do funil">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,.055)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#71717a"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />
                    <YAxis
                      stroke="#71717a"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#15161a",
                        border: "1px solid rgba(255,255,255,.08)",
                        borderRadius: 12,
                        color: "#fff",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 18 }} />
                    <Line
                      type="monotone"
                      dataKey="acessos"
                      name="Acessos"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="finalizacoes"
                      name="Finalizações"
                      stroke="#a78bfa"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="checkouts"
                      name="Checkouts"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="admin-panel p-5 sm:p-6">
            <PanelHeading
              title="Taxas de conversão"
              description="Eficiência acumulada do período"
            />
            <div className="mt-6 space-y-5">
              <ConversionBar
                label="Conversão geral"
                value={percent(stats.checkout, stats.access)}
                tone="red"
              />
              <ConversionBar
                label="Conclusão do quiz"
                value={percent(stats.completion, stats.access)}
                tone="purple"
              />
              <ConversionBar
                label="Clique no checkout"
                value={percent(stats.checkout, stats.completion)}
                tone="green"
              />
              <ConversionBar
                label="Interação com vídeo"
                value={percent(stats.video, stats.completion)}
                tone="blue"
              />
            </div>
          </section>
        </div>
      )}

      <section className="admin-panel p-5 sm:p-6">
        <PanelHeading
          title="Retenção do vídeo"
          description="Acompanhe quanto tempo as pessoas assistem ao vídeo de vendas"
        />
        <div className="mt-6 space-y-4">
          {[10, 30, 60, 120, 300, 600].map((sec) => {
            const count = countUniqueEvents(
              filteredEvents,
              "video_retencao",
              (payload) => (payload?.segundos as number) >= sec,
            );
            const label =
              sec < 60 ? `${sec} segundos` : `${Math.floor(sec / 60)} minuto${sec >= 120 ? "s" : ""}`;
            return (
              <ConversionBar
                key={sec}
                label={`Assistiram pelo menos ${label}`}
                value={percent(count, stats.video)}
                tone="blue"
              />
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <section className="admin-panel p-5 sm:p-6">
          <PanelHeading
            title="Funil de conversão"
            description="Avanço real entre as etapas monitoradas"
          />
          <div className="mt-6 space-y-3">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-xl bg-white/[0.035]" />
                ))
              : funnel.map((step, index) => (
                  <div
                    key={step.name}
                    className={`funnel-row ${step.drop >= 40 ? "is-critical" : ""}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="funnel-index">{String(index + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="truncate text-sm font-medium text-zinc-200">
                            {step.name}
                          </span>
                          <strong className="text-sm tabular-nums text-white">{step.count}</strong>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500 transition-[width] duration-700"
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="hidden w-28 text-right sm:block">
                      <strong className="block text-xs text-zinc-300">
                        {step.progress}% avanço
                      </strong>
                      {index > 0 && (
                        <small className={step.drop >= 40 ? "text-red-400" : "text-zinc-600"}>
                          {step.drop}% abandono
                        </small>
                      )}
                    </div>
                  </div>
                ))}
          </div>
        </section>

        <section className="admin-panel p-5 sm:p-6">
          <PanelHeading title="Ações rápidas" description="Atalhos para tarefas frequentes" />
          <div className="mt-5 grid gap-2">
            <QuickAction
              icon={LayoutTemplate}
              label="Editar conteúdo do funil"
              onClick={() => onNavigate("content")}
            />
            <QuickAction
              icon={ShoppingBag}
              label="Editar página de vendas"
              onClick={() => onNavigate("sales")}
            />
            <QuickAction
              icon={Code2}
              label="Configurar pixels"
              onClick={() => onNavigate("tracking")}
            />
            <QuickAction icon={Download} label="Exportar contatos" onClick={exportCsv} />
            <QuickAction
              icon={FileText}
              label="Exportar relatório"
              onClick={() => window.print()}
            />
            <QuickAction
              icon={ExternalLink}
              label="Visualizar página publicada"
              onClick={() => window.open("/", "_blank")}
            />
          </div>
        </section>
      </div>

      {mode === "analytics" && (
        <section className="admin-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <PanelHeading
              title="Eventos recentes"
              description={`${visibleEvents.length} registros no período`}
            />
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar evento..."
                className="admin-control w-full pl-9 sm:w-64"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Sessão</th>
                  <th>Detalhes</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {visibleEvents.slice(0, 100).map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className="admin-badge">{event.event_name}</span>
                    </td>
                    <td className="font-mono text-xs text-zinc-500">{event.session_id ?? "—"}</td>
                    <td className="max-w-md truncate text-zinc-500">
                      {JSON.stringify(event.payload ?? {})}
                    </td>
                    <td className="whitespace-nowrap text-zinc-500">
                      {event.created_at ? new Date(event.created_at).toLocaleString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  description,
  loading,
  previous,
}: {
  label: string;
  value: number;
  icon: ElementType;
  tone: string;
  description: string;
  loading: boolean;
  chart: number[];
  previous: number;
}) {
  const delta =
    previous > 0 ? Math.round(((value - previous) / previous) * 100) : value > 0 ? 100 : 0;
  return (
    <article className="metric-card group" title={description}>
      <div className="flex items-start justify-between">
        <span className={`metric-icon tone-${tone}`}>
          <Icon />
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium ${delta >= 0 ? "text-emerald-500" : "text-red-400"}`}
        >
          {delta >= 0 ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(delta)}%
        </span>
      </div>
      <div className="mt-5">
        {loading ? (
          <div className="h-9 w-20 animate-pulse rounded-lg bg-white/[0.06]" />
        ) : (
          <strong className="text-3xl font-semibold tracking-tight text-white tabular-nums">
            {value.toLocaleString("pt-BR")}
          </strong>
        )}
        <p className="mt-1 text-sm text-zinc-500">{label}</p>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-3">
        <small className="text-[11px] text-zinc-600">versus período anterior</small>
        <Activity className="h-3.5 w-3.5 text-zinc-700 transition group-hover:text-red-500" />
      </div>
    </article>
  );
}

function PanelHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
    </div>
  );
}
function ConversionBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <strong className="text-sm text-white tabular-nums">{value}%</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.055]">
        <div
          className={`h-full rounded-full conversion-${tone}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="admin-action-tile">
      <Icon />
      <span>
        <strong>{label}</strong>
        <small>Acessar recurso</small>
      </span>
      <ArrowRight />
    </button>
  );
}
function ChartSkeleton() {
  return (
    <div className="flex h-full items-end gap-3 px-4 pb-5">
      {[32, 58, 44, 74, 55, 83, 67, 91, 72].map((height, index) => (
        <span
          key={index}
          className="flex-1 animate-pulse rounded-t-md bg-white/[0.045]"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function SystemState({
  icon: Icon,
  title,
  description,
  action,
  details,
  showDetails,
  onToggleDetails,
}: {
  icon: ElementType;
  title: string;
  description: string;
  action?: () => void;
  details?: string;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}) {
  return (
    <section className="admin-panel flex min-h-[360px] items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red-500/10 text-red-400">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {action && (
            <button onClick={action} className="admin-button-primary">
              <RefreshCw /> Tentar novamente
            </button>
          )}
          {details && (
            <button onClick={onToggleDetails} className="admin-button-secondary">
              {showDetails ? "Ocultar detalhes" : "Ver detalhes técnicos"}
            </button>
          )}
        </div>
        {showDetails && details && (
          <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-black/30 p-3 text-left text-xs whitespace-pre-wrap text-zinc-500">
            {details}
          </pre>
        )}
      </div>
    </section>
  );
}

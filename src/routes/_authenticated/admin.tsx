import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Settings,
  BarChart3,
  Users,
  MousePointer2,
  Layout,
  Save,
  Code,
  Image as ImageIcon,
  Music,
  Video,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  X,
  ExternalLink,
  Target,
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  RefreshCw,
  Eye,
  Download,
  FileText,
  Activity,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  readDraft,
  writeDraft,
  publishDraft,
  loadPublished,
  type FunnelDraft,
  EMPTY_DRAFT,
} from "@/lib/funnel-content";
import { AdminShell, type AdminTab } from "@/components/admin/AdminShell";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { uploadAdminMedia } from "@/lib/admin-media-upload";
import logoAsset from "@/assets/logo-dono-que-anuncia.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };
    const parts = [candidate.message, candidate.details, candidate.hint].filter(
      (part): part is string => typeof part === "string" && part.trim().length > 0,
    );
    if (parts.length > 0) return parts.join(" - ");
    if (typeof candidate.code === "string") return `Codigo ${candidate.code}`;
  }
  return "erro desconhecido";
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [draft, setDraft] = useState<FunnelDraft>(EMPTY_DRAFT);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      // Prioridade 1: Rascunho no servidor (sincronização entre dispositivos)
      // Prioridade 2: Publicado (fallback se não houver rascunho)
      // Prioridade 3: Local (contingência offline)
      const [published, serverDraft, local] = await Promise.all([
        loadPublished(),
        (async () => {
          try {
            const { loadDraftFromServer } = await import("@/lib/funnel-content");
            return await loadDraftFromServer();
          } catch {
            return null;
          }
        })(),
        readDraft(),
      ]);

      const base = serverDraft || published;
      const merged: FunnelDraft = {
        steps: { ...(base?.steps || {}), ...(local.steps || {}) },
        sales: { ...(base?.sales || {}), ...(local.sales || {}) },
        tracking: { ...(base?.tracking || {}), ...(local.tracking || {}) },
      };
      setDraft(merged);
      writeDraft(merged);
    }
    void init().catch((error) => console.error("[Admin] Falha ao carregar conteúdo", error));
  }, []);

  // Autosave logic
  useEffect(() => {
    if (draft === EMPTY_DRAFT) return;

    const timer = setTimeout(async () => {
      setIsAutosaving(true);
      try {
        writeDraft(draft);

        // Salvamento automático no servidor (backup na nuvem)
        const { saveDraftToServer } = await import("@/lib/funnel-content");
        await saveDraftToServer(draft);

        console.log("[Admin] Rascunho sincronizado com o servidor.");
      } catch (err) {
        console.warn("[Admin] Falha ao sincronizar rascunho no servidor", err);
      } finally {
        // Simulated delay for visual feedback
        setTimeout(() => setIsAutosaving(false), 1000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [draft]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const openTab = (tab: AdminTab) => setActiveTab(tab);

  return (
    <AdminShell activeTab={activeTab} onTabChange={openTab} onLogout={logout}>
      {(activeTab === "overview" || activeTab === "analytics") && (
        <AdminAnalytics mode={activeTab} onNavigate={openTab} />
      )}
      {activeTab === "content" && (
        <div className="admin-panel p-5 sm:p-7">
          <ContentSection theme="dark" draft={draft} setDraft={setDraft} />
        </div>
      )}
      {activeTab === "sales" && (
        <div className="admin-panel p-5 sm:p-7">
          <ConfigSection theme="dark" draft={draft} setDraft={setDraft} />
        </div>
      )}
      {activeTab === "tracking" && (
        <div className="admin-panel p-5 sm:p-7">
          <TrackingSection theme="dark" draft={draft} setDraft={setDraft} />
        </div>
      )}
      {activeTab === "settings" && (
        <div className="admin-panel p-6 sm:p-8">
          <div className="admin-section-heading">
            <div>
              <p className="admin-eyebrow">Preferências</p>
              <h2>Configurações</h2>
              <p>Gerencie os atalhos e o ambiente administrativo.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button className="admin-action-tile" onClick={() => setActiveTab("sales")}>
              <ExternalLink className="text-primary" />
              <span>
                <strong>Configurar Link de Checkout</strong>
                <small>Defina o link de destino dos botões de compra</small>
              </span>
              <ChevronRight />
            </button>
            <button className="admin-action-tile" onClick={() => window.open("/", "_blank")}>
              <ExternalLink />
              <span>
                <strong>Visualizar página publicada</strong>
                <small>Abra o funil em uma nova aba</small>
              </span>
              <ChevronRight />
            </button>
            <button className="admin-action-tile" onClick={logout}>
              <LogOut />
              <span>
                <strong>Encerrar sessão</strong>
                <small>Sair com segurança do painel</small>
              </span>
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
      {(activeTab === "content" || activeTab === "sales") && (
        <section className="mt-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-red-500" />
            <div>
              <h2 className="text-base font-semibold text-white">Prévia em tempo real</h2>
              <p className="text-sm text-zinc-500">Confira as alterações antes de publicar.</p>
            </div>
          </div>
          <LivePreview theme="dark" />
        </section>
      )}
    </AdminShell>
  );
}

function LegacyAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "config" | "tracking" | "content">(
    "analytics",
  );
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [draft, setDraft] = useState<FunnelDraft>(EMPTY_DRAFT);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        const published = await loadPublished();
        const local = readDraft();

        const merged: FunnelDraft = {
          steps: { ...(published?.steps || {}), ...(local?.steps || {}) },
          sales: { ...(published?.sales || {}), ...(local?.sales || {}) },
          tracking: { ...(published?.tracking || {}), ...(local?.tracking || {}) },
        };

        setDraft(merged);
        writeDraft(merged);
      } catch (err) {
        console.error("[Admin] Erro na inicialização:", err);
      }
    }
    init();
  }, []);

  // Autosave logic for Legacy dashboard
  useEffect(() => {
    if (draft === EMPTY_DRAFT) return;

    const timer = setTimeout(async () => {
      setIsAutosaving(true);
      try {
        writeDraft(draft);
      } finally {
        setTimeout(() => setIsAutosaving(false), 1000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [draft]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"}`}
    >
      {/* Sidebar Fixa */}
      <aside
        className={`hidden w-[280px] shrink-0 border-r transition-all duration-300 lg:flex lg:flex-col ${
          theme === "dark" ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white shadow-sm"
        }`}
      >
        <div className="p-8">
          <div className="flex flex-col gap-2">
            <h1
              className={`text-2xl font-black tracking-tighter uppercase leading-none ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
            >
              Dono que <span className="text-primary">Anuncia</span>
            </h1>
            <p
              className={`text-[10px] font-bold uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
            >
              Painel de Controle
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavButton
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            icon={BarChart3}
            label="Analytics & Métricas"
            theme={theme}
          />
          <NavButton
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
            icon={Layout}
            label="Conteúdo do Funil"
            theme={theme}
          />
          <NavButton
            active={activeTab === "config"}
            onClick={() => setActiveTab("config")}
            icon={Settings}
            label="Página de Vendas"
            theme={theme}
          />
          <NavButton
            active={activeTab === "tracking"}
            onClick={() => setActiveTab("tracking")}
            icon={Code}
            label="Pixels & Tracking"
            theme={theme}
          />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={toggleTheme}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              theme === "dark"
                ? "text-zinc-400 hover:bg-white/5 hover:text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-5 w-5" /> Modo Claro
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" /> Modo Escuro
              </>
            )}
          </button>

          <button
            onClick={() => window.open("/", "_blank")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              theme === "dark"
                ? "text-zinc-400 hover:bg-white/5 hover:text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <ExternalLink className="h-5 w-5" />
            Ver Site
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Sair do Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 sm:px-10 sticky top-0 bg-inherit/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {activeTab === "analytics" && "Analytics & Métricas"}
              {activeTab === "content" && "Conteúdo do Funil"}
              {activeTab === "config" && "Página de Vendas"}
              {activeTab === "tracking" && "Pixels & Tracking"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {isAutosaving && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Salvando...
              </div>
            )}
            <div
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${
                theme === "dark" ? "bg-white/5 text-zinc-400" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Sistema Online
            </div>
          </div>
        </header>

        <div className="max-w-[1400px] p-4 sm:p-10">
          <div
            className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
              theme === "dark"
                ? "border-white/10 bg-zinc-900/30"
                : "border-zinc-200 bg-white shadow-sm"
            }`}
          >
            <div className="p-8 sm:p-10">
              {activeTab === "analytics" && <AnalyticsSection theme={theme} />}
              {activeTab === "config" && (
                <ConfigSection theme={theme} draft={draft} setDraft={setDraft} />
              )}
              {activeTab === "tracking" && (
                <TrackingSection theme={theme} draft={draft} setDraft={setDraft} />
              )}
              {activeTab === "content" && (
                <ContentSection theme={theme} draft={draft} setDraft={setDraft} />
              )}
            </div>
          </div>

          {(activeTab === "content" || activeTab === "config") && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Preview em Tempo Real
                </h3>
              </div>
              <LivePreview theme={theme} />
            </div>
          )}
        </div>
      </main>
      <nav
        className={`fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t px-1 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-2 backdrop-blur-xl lg:hidden ${
          theme === "dark" ? "border-white/10 bg-zinc-950/95" : "border-zinc-200 bg-white/95"
        }`}
      >
        {[
          { id: "analytics" as const, label: "Métricas", icon: BarChart3 },
          { id: "content" as const, label: "Conteúdo", icon: Layout },
          { id: "config" as const, label: "Vendas", icon: Settings },
          { id: "tracking" as const, label: "Tracking", icon: Code },
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-black uppercase tracking-tight transition-colors ${
                active ? "bg-primary/15 text-primary" : "text-zinc-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label, theme }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
        active
          ? "bg-primary text-white shadow-[0_8px_20px_-6px_rgba(var(--primary-rgb),0.5)] scale-[1.02]"
          : theme === "dark"
            ? "text-zinc-400 hover:bg-white/5 hover:text-white"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      <Icon className={`h-5 w-5 transition-transform duration-300 ${active ? "scale-110" : ""}`} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function AnalyticsSection({ theme }: { theme: "dark" | "light" }) {
  const [stats, setStats] = useState({ access: 0, completion: 0, checkout: 0, videoViews: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState("");

  const [funnelData, setFunnelData] = useState<
    Array<{ step: string; count: number; drop: number }>
  >([]);

  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setLoadError("");
        // Buscar eventos reais do banco de dados
        const { data: events, error } = await supabase
          .from("analytics_events")
          .select("id,event_name,payload,session_id,created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (events && events.length > 0) {
          // Processar estatísticas
          const accessCount = events.filter((e) => e.event_name === "quiz_iniciado").length;
          const completionCount = events.filter((e) => e.event_name === "quiz_concluido").length;
          const checkoutCount = events.filter((e) => e.event_name === "checkout_iniciado").length;
          const videoCount = events.filter((e) => e.event_name === "clique_video").length;

          setStats({
            access: accessCount,
            completion: completionCount,
            checkout: checkoutCount,
            videoViews: videoCount,
          });

          // Processar leads
          const formattedLeads = events.map((e) => ({
            id: e.id,
            event: e.event_name,
            details: JSON.stringify(e.payload),
            date: new Date(e.created_at || "").toLocaleString("pt-BR"),
            stage: (e.payload as any)?.stage || "N/A",
            source: (e.payload as any)?.source || "Direto",
          }));
          setLeads(formattedLeads);

          const steps = [
            { name: "Início Quiz", event: "quiz_iniciado" },
            {
              name: "Pergunta 1 (Dor)",
              event: "quiz_resposta",
              filter: (p: any) => p.pergunta === "dor",
            },
            {
              name: "Pergunta 2 (Motivacao)",
              event: "quiz_resposta",
              filter: (p: any) => p.pergunta === "motivacao",
            },
            { name: "Quiz Concluído", event: "quiz_concluido" },
            { name: "Página de Vendas", event: "pagina_vendas_visualizada" },
            { name: "Clique no Vídeo", event: "clique_video" },
            { name: "Checkout", event: "checkout_iniciado" },
          ];

          const newFunnel = steps.map((s, i) => {
            const currentFilter = s.filter;
            const count = events.filter(
              (e) =>
                e.event_name === s.event &&
                (!currentFilter || (e.payload && currentFilter(e.payload))),
            ).length;

            let drop = 0;
            if (i > 0) {
              const prevStep = steps[i - 1];
              if (prevStep) {
                const prevFilter = prevStep.filter;
                const prevCount = events.filter(
                  (e) =>
                    e.event_name === prevStep.event &&
                    (!prevFilter || (e.payload && prevFilter(e.payload))),
                ).length;
                drop = prevCount > 0 ? Math.round((1 - count / prevCount) * 100) : 0;
              }
            }

            return { step: s.name, count, drop };
          });
          setFunnelData(newFunnel);
        } else {
          setStats({ access: 0, completion: 0, checkout: 0, videoViews: 0 });
          setLeads([]);
          setFunnelData([]);
        }
      } catch (err) {
        console.error("Erro ao buscar dados reais:", err);
        const message = getErrorMessage(err);

        // Se o erro for de permissão ou tabela inexistente, tentamos ser mais específicos
        if (message.includes("permission denied") || message.includes("403")) {
          setLoadError(
            `Acesso negado às tabelas do banco de dados. Verifique as permissões RLS e os GRANTS.`,
          );
        } else {
          setLoadError(`Erro ao carregar dados: ${message}`);
        }

        toast.error("Falha ao atualizar as métricas.");
      } finally {
        setIsLoading(false);
        setLastUpdated(new Date());
      }
    }

    fetchData();
  }, [refreshKey]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-analytics-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "analytics_events" },
        () => setRefreshKey((value) => value + 1),
      )
      .subscribe((status, error) => {
        if (error) {
          console.error("[Analytics] Falha na atualização em tempo real", {
            status,
            message: error.message,
          });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage =
      filterStage === "all" || lead.stage.toLowerCase() === filterStage.toLowerCase();
    const matchesSource =
      filterSource === "all" || lead.source.toLowerCase() === filterSource.toLowerCase();
    return matchesSearch && matchesStage && matchesSource;
  });

  const downloadCsv = () => {
    if (!filteredLeads.length) {
      toast.info("Não há dados para exportar com os filtros atuais.");
      return;
    }
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Evento", "Etapa", "Origem", "Detalhes", "Data"],
      ...filteredLeads.map((lead) => [
        lead.event,
        lead.stage,
        lead.source,
        lead.details,
        lead.date,
      ]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(escape).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dono-que-anuncia-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredLeads.length} registros exportados.`);
  };

  return (
    <div className="space-y-8 animate-rise-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
            <Activity className="h-4 w-4" /> Dados em tempo real
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {lastUpdated
              ? `Atualizado às ${lastUpdated.toLocaleTimeString("pt-BR")}`
              : "Sincronizando com o Supabase..."}
          </p>
        </div>
        <button
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black uppercase text-primary hover:bg-primary/15 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Atualizar dados
        </button>
      </div>
      {loadError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
          {loadError}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-4">
        <StatCard
          label="Acessos Totais"
          value={stats.access}
          icon={Users}
          color={theme === "dark" ? "text-blue-400" : "text-blue-600"}
          theme={theme}
        />
        <StatCard
          label="Finalizados"
          value={stats.completion}
          icon={Target}
          color={theme === "dark" ? "text-green-400" : "text-green-600"}
          theme={theme}
        />
        <StatCard
          label="Cliques Vídeo"
          value={stats.videoViews}
          icon={Video}
          color={theme === "dark" ? "text-purple-400" : "text-purple-600"}
          theme={theme}
        />
        <StatCard
          label="Checkouts"
          value={stats.checkout}
          icon={BarChart3}
          color={theme === "dark" ? "text-red-400" : "text-red-600"}
          theme={theme}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div
          className={`surface-card rounded-[2rem] border transition-all p-8 ${
            theme === "dark"
              ? "border-white/10 bg-zinc-900/80"
              : "border-zinc-200 bg-white shadow-sm"
          }`}
        >
          <h3
            className={`text-lg font-black mb-6 flex items-center gap-2 uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
          >
            <Target className="h-5 w-5 text-primary" />
            Funil de Conversão
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">Carregando dados...</div>
            ) : (
              funnelData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span
                      className={`font-bold uppercase tracking-widest text-[10px] ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      {item.step}
                    </span>
                    <span
                      className={`font-black ${theme === "dark" ? "text-zinc-100" : "text-zinc-900"}`}
                    >
                      {item.count}{" "}
                      <span className="text-zinc-500 font-medium">
                        ({stats.access > 0 ? Math.round((item.count / stats.access) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div
                    className={`h-2.5 w-full rounded-full overflow-hidden ${theme === "dark" ? "bg-white/5" : "bg-zinc-100"}`}
                  >
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${stats.access > 0 ? (item.count / stats.access) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  {idx < funnelData.length - 1 && item.drop > 0 && (
                    <div className="text-[10px] text-red-500 font-bold ml-2">
                      ↓ -{item.drop}% abandono
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3
            className={`text-lg font-black mb-4 uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
          >
            Ações do Admin
          </h3>
          <div className="grid gap-3">
            <button
              onClick={downloadCsv}
              className={`flex items-center justify-between rounded-2xl p-4 text-sm font-bold border transition-all ${
                theme === "dark"
                  ? "bg-zinc-900/50 text-zinc-300 border-white/5 hover:bg-white/5 hover:text-white"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
              }`}
            >
              <span className="flex items-center gap-3">
                <Download className="h-4 w-4" /> Exportar CSV
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </button>
            <button
              onClick={() => window.print()}
              className={`flex items-center justify-between rounded-2xl p-4 text-sm font-bold border transition-all ${
                theme === "dark"
                  ? "bg-zinc-900/50 text-zinc-300 border-white/5 hover:bg-white/5 hover:text-white"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className="h-4 w-4" /> Imprimir Relatório
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3
            className={`text-lg font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
          >
            Leads e Eventos
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar lead ou origem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full rounded-xl border pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-64 transition-all ${
                  theme === "dark"
                    ? "border-white/10 bg-black/20 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-900"
                }`}
              />
            </div>

            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                theme === "dark" ? "border-white/10 bg-black/20" : "border-zinc-200 bg-zinc-50"
              }`}
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className={`bg-transparent text-xs focus:outline-none font-bold ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
              >
                <option value="all" className={theme === "dark" ? "bg-zinc-900" : "bg-white"}>
                  Todas Etapas
                </option>
                <option value="intro" className={theme === "dark" ? "bg-zinc-900" : "bg-white"}>
                  Intro
                </option>
                <option value="quiz" className={theme === "dark" ? "bg-zinc-900" : "bg-white"}>
                  Quiz
                </option>
                <option value="vendas" className={theme === "dark" ? "bg-zinc-900" : "bg-white"}>
                  Página de Vendas
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                <option value="all" className="bg-zinc-900">
                  Todas Origens
                </option>
                <option value="facebook ads" className="bg-zinc-900">
                  Facebook Ads
                </option>
                <option value="instagram" className="bg-zinc-900">
                  Instagram
                </option>
                <option value="google search" className="bg-zinc-900">
                  Google Search
                </option>
                <option value="direto" className="bg-zinc-900">
                  Direto
                </option>
              </select>
            </div>
          </div>
        </div>

        <div
          className={`overflow-x-auto rounded-2xl border transition-all ${
            theme === "dark"
              ? "border-white/10 bg-zinc-900/50"
              : "border-zinc-200 bg-white shadow-sm"
          }`}
        >
          <table className="w-full text-left text-sm">
            <thead
              className={`${theme === "dark" ? "bg-white/5 text-zinc-400" : "bg-zinc-50 text-zinc-500"} font-bold uppercase text-[10px] tracking-widest`}
            >
              <tr>
                <th className="px-4 py-4">Evento</th>
                <th className="px-4 py-4">Etapa</th>
                <th className="px-4 py-4">Origem</th>
                <th className="px-4 py-4">Detalhes</th>
                <th className="px-4 py-4 text-right">Data</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${theme === "dark" ? "divide-white/5" : "divide-zinc-100"}`}
            >
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-4 py-4">
                    <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                      {lead.event}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        theme === "dark" ? "bg-white/10 text-zinc-300" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {lead.stage}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-4 text-xs font-medium ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    {lead.source}
                  </td>
                  <td
                    className={`px-4 py-4 text-xs max-w-xs truncate ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    {lead.details}
                  </td>
                  <td
                    className={`px-4 py-4 text-xs text-right tabular-nums ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    {lead.date}
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-zinc-500 font-medium">
                    Nenhum lead encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EventRow({ event, details, date }: any) {
  return (
    <tr>
      <td className="px-4 py-3 font-mono text-xs text-primary">{event}</td>
      <td className="px-4 py-3 text-muted-foreground">{details}</td>
      <td className="px-4 py-3 text-xs">{date}</td>
    </tr>
  );
}

function StatCard({ label, value, icon: Icon, color, theme }: any) {
  return (
    <div
      className={`rounded-2xl border transition-all ${
        theme === "dark" ? "border-white/10 bg-zinc-900/80" : "border-zinc-200 bg-white shadow-sm"
      } p-6`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-sm font-medium uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
        >
          {label}
        </p>
        <Icon className={`h-5 w-5 ${color} ${theme === "dark" ? "opacity-80" : "opacity-100"}`} />
      </div>
      <p
        className={`mt-2 text-3xl font-black ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

export function ConfigSection({
  theme,
  draft,
  setDraft,
}: {
  theme: "dark" | "light";
  draft: FunnelDraft;
  setDraft: (d: FunnelDraft) => void;
}) {
  const initial = readDraft();
  const [checkoutUrl, setCheckoutUrl] = useState(
    initial.sales.checkoutUrl ?? "https://pay.kiwify.com.br/...",
  );
  const [promoPrice, setPromoPrice] = useState(initial.sales.promoPrice ?? "R$ 197,00");
  const [fullPrice, setFullPrice] = useState(initial.sales.fullPrice ?? "R$ 497,00");
  const [vslUrl, setVslUrl] = useState(initial.sales.vslUrl ?? "");

  const publish = (patch: Partial<FunnelDraft["sales"]>) => {
    // Aqui não temos acesso ao 'draft' do AdminDashboard diretamente a menos que passemos como prop
    // Mas ConfigSection já recebe setDraft. Vamos garantir que ele use o rascunho mais recente.
    const current = readDraft();
    const updated = { ...current, sales: { ...current.sales, ...patch } };
    setDraft(updated);
    writeDraft(updated);
  };

  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleVideoUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Selecione um arquivo de vídeo válido.");
      return;
    }
    if (file.size > 500_000_000) {
      toast.error("O vídeo deve ter no máximo 500 MB.");
      return;
    }

    setUploadingVideo(true);
    try {
      const url = await uploadAdminMedia(file);
      setVslUrl(url);
      publish({ vslUrl: url, videoThumb: url });
      toast.success("Vídeo enviado. Clique em Publicar Alterações para disponibilizá-lo.");
    } catch (error) {
      console.error("[Admin] Falha no upload do vídeo", error);
      toast.error(`Não foi possível enviar o vídeo: ${getErrorMessage(error)}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  useEffect(() => {
    // ConfigSection agora recebe o draft atualizado do AdminDashboard via props se quisermos sincronizar
    // Mas por simplicidade de inputs, mantemos o carregamento inicial.
    // O setDraft pai garantirá que a publicação use o estado mais recente.
    loadPublished().then((published) => {
      if (!published) return;
      const local = readDraft();
      const merged: FunnelDraft = {
        steps: { ...published.steps, ...local.steps },
        sales: { ...published.sales, ...local.sales },
      };

      setCheckoutUrl(merged.sales.checkoutUrl ?? "https://pay.kiwify.com.br/...");
      setPromoPrice(merged.sales.promoPrice ?? "R$ 197,00");
      setFullPrice(merged.sales.fullPrice ?? "R$ 497,00");
      setVslUrl(merged.sales.vslUrl ?? "");
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Usar o rascunho mais recente (draft) em vez de ler do localStorage
      const updatedDraft = {
        ...draft,
        sales: {
          ...draft.sales,
          checkoutUrl,
          promoPrice,
          fullPrice,
          vslUrl,
          videoThumb: vslUrl,
        },
      };

      setDraft(updatedDraft); // Atualiza o estado global
      writeDraft(updatedDraft); // Persiste no localStorage

      await publishDraft(updatedDraft);
      toast.success("Dados da Página de Vendas publicados com sucesso!");
    } catch (err: any) {
      console.error("Erro ao publicar:", err);
      toast.error("Erro ao publicar: " + (err?.message ?? "tente novamente"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3
          className={`text-xl font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
        >
          Página de Vendas & Oferta
        </h3>
        <p
          className={`text-sm font-medium ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
        >
          Sincronize preços, vídeos e links da oferta final.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
          >
            Link do Checkout (Botões)
          </label>
          <input
            type="text"
            value={checkoutUrl}
            onChange={(e) => {
              setCheckoutUrl(e.target.value);
              publish({ checkoutUrl: e.target.value });
            }}
            className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              theme === "dark"
                ? "border-white/10 bg-black/40 text-white"
                : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
            }`}
          />
        </div>

        <div className="space-y-2">
          <label
            className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
          >
            Vídeo VSL (URL Youtube/Vimeo)
          </label>
          <input
            type="text"
            placeholder="https://..."
            value={vslUrl}
            onChange={(e) => {
              setVslUrl(e.target.value);
              publish({ vslUrl: e.target.value, videoThumb: e.target.value });
            }}
            className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              theme === "dark"
                ? "border-white/10 bg-black/40 text-white"
                : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
            }`}
          />
          <label className="admin-button-secondary mt-2 cursor-pointer">
            <Video className="h-4 w-4" />
            {uploadingVideo ? "Enviando vídeo..." : "Upload de vídeo"}
            <input
              type="file"
              accept="video/*,image/*"
              className="hidden"
              disabled={uploadingVideo}
              onChange={(event) => {
                void handleVideoUpload(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <div className="space-y-2">
          <label
            className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
          >
            Preço Original (R$)
          </label>
          <input
            type="text"
            value={fullPrice}
            onChange={(e) => {
              setFullPrice(e.target.value);
              publish({ fullPrice: e.target.value });
            }}
            className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              theme === "dark"
                ? "border-white/10 bg-black/40 text-white"
                : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
            }`}
          />
        </div>

        <div className="space-y-2">
          <label
            className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
          >
            Preço Oferta (R$)
          </label>
          <input
            type="text"
            value={promoPrice}
            onChange={(e) => {
              setPromoPrice(e.target.value);
              publish({ promoPrice: e.target.value });
            }}
            className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              theme === "dark"
                ? "border-white/10 bg-black/40 text-white"
                : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
            }`}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white hover:opacity-90 shadow-lg shadow-primary/20 uppercase tracking-widest text-sm disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Publicando..." : "Publicar Alterações"}
      </button>
    </div>
  );
}

export function TrackingSection({
  theme,
  draft,
  setDraft,
}: {
  theme: "dark" | "light";
  draft: FunnelDraft;
  setDraft: (d: FunnelDraft) => void;
}) {
  const [metaPixelId, setMetaPixelId] = useState(draft.tracking?.metaPixelId ?? "");
  const [ga4Id, setGa4Id] = useState(draft.tracking?.ga4Id ?? "");
  const [gtmId, setGtmId] = useState(draft.tracking?.gtmId ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMetaPixelId(draft.tracking?.metaPixelId ?? "");
    setGa4Id(draft.tracking?.ga4Id ?? "");
    setGtmId(draft.tracking?.gtmId ?? "");
  }, [draft.tracking]);

  const saveTracking = async () => {
    const meta = metaPixelId.trim();
    const ga = ga4Id.trim().toUpperCase();
    const gtm = gtmId.trim().toUpperCase();

    if (meta && !/^\d{5,25}$/.test(meta)) {
      toast.error("O ID do Meta Pixel deve conter apenas números.");
      return;
    }
    if (ga && !/^G-[A-Z0-9]+$/.test(ga)) {
      toast.error("Use um ID GA4 válido, como G-ABC123.");
      return;
    }
    if (gtm && !/^GTM-[A-Z0-9]+$/.test(gtm)) {
      toast.error("Use um ID válido, como GTM-ABC123.");
      return;
    }

    setSaving(true);
    const next: FunnelDraft = { ...draft, tracking: { metaPixelId: meta, ga4Id: ga, gtmId: gtm } };
    try {
      setDraft(next);
      writeDraft(next);
      await publishDraft(next);
      toast.success("Configuração de tracking publicada.");
    } catch (error: any) {
      toast.error(`Erro ao publicar tracking: ${error?.message ?? "tente novamente"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3
        className={`text-xl font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
      >
        Pixels e Rastreamento
      </h3>

      <div className="space-y-2">
        <label
          className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
        >
          ID Meta Pixel
        </label>
        <input
          type="text"
          placeholder="Ex: 1234567890"
          value={metaPixelId}
          onChange={(event) => setMetaPixelId(event.target.value)}
          className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
            theme === "dark"
              ? "border-white/10 bg-black/40 text-white"
              : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
          }`}
        />
      </div>

      <div className="space-y-2">
        <label
          className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
        >
          ID Google Analytics (G-XXX)
        </label>
        <input
          type="text"
          placeholder="Ex: G-ABC123DEF"
          value={ga4Id}
          onChange={(event) => setGa4Id(event.target.value)}
          className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
            theme === "dark"
              ? "border-white/10 bg-black/40 text-white"
              : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
          }`}
        />
      </div>

      <div className="space-y-2">
        <label
          className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
        >
          Google Tag Manager
        </label>
        <input
          type="text"
          value={gtmId}
          onChange={(event) => setGtmId(event.target.value)}
          className={`w-full rounded-2xl border px-4 py-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
            theme === "dark"
              ? "border-white/10 bg-black/40 text-white"
              : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
          }`}
          placeholder="Ex: GTM-ABC123"
        />
      </div>

      <p className="text-xs text-zinc-500">
        Por segurança, o painel aceita IDs verificados em vez de scripts arbitrários.
      </p>
      <button
        onClick={saveTracking}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white hover:opacity-90 shadow-lg shadow-primary/20 uppercase tracking-widest text-sm disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Publicando..." : "Publicar Tracking"}
      </button>
    </div>
  );
}

export function ContentSection({
  theme,
  draft,
  setDraft,
}: {
  theme: "dark" | "light";
  draft: FunnelDraft;
  setDraft: (d: FunnelDraft) => void;
}) {
  const [questions, setQuestions] = useState([
    {
      id: "intro",
      title: "Abertura do diagnóstico",
      type: "imagem + texto",
      section: "Entrada e perguntas",
      description: "Primeira tela do funil: logo, chamada principal e botão para começar.",
    },
    {
      id: "dor",
      title: "Pergunta 1 — Dor do cliente",
      type: "imagem + respostas",
      section: "Entrada e perguntas",
      description: "Primeira pergunta exibida depois que o visitante inicia o diagnóstico.",
    },
    {
      id: "motivacao",
      title: "Pergunta 2 — Motivação",
      type: "imagem + respostas",
      section: "Entrada e perguntas",
      description: "Segunda pergunta do diagnóstico, com as opções de motivação.",
    },
    {
      id: "objecao",
      title: "Etapa 3 — Quebra de objeção",
      type: "imagem + texto",
      section: "Resultado e testemunhos",
      description: "Primeira tela apresentada após a análise das respostas.",
    },
    {
      id: "beneficios",
      title: "Etapa 4 — Benefícios do método",
      type: "imagem + texto",
      section: "Resultado e testemunhos",
      description: "Tela de explicação e checklist exibida antes dos testemunhos.",
    },
    {
      id: "audio",
      title: "Etapa 5 — Testemunho com áudio",
      type: "imagem + áudio + texto",
      section: "Resultado e testemunhos",
      description: "Testemunho com o player de áudio em cima e a imagem logo abaixo.",
    },
    {
      id: "niche",
      title: "Etapa 6 — Testemunho do Instagram",
      type: "imagem + texto",
      section: "Resultado e testemunhos",
      description: "Último testemunho do funil antes de entrar na página de vendas.",
    },
    {
      id: "sales_vsl",
      title: "Etapa 7 — Chamada do vídeo",
      type: "texto",
      section: "Página de vendas",
      description: "Título exibido imediatamente acima do vídeo principal de vendas.",
    },
    {
      id: "sales_vsl_video",
      title: "Etapa 8 — Vídeo de vendas",
      type: "vídeo ou capa",
      section: "Página de vendas",
      description: "Arquivo de vídeo ou imagem de capa do vídeo principal.",
    },
    {
      id: "sales_offer",
      title: "Etapa 9 — Oferta e checkout",
      type: "preços + link",
      section: "Página de vendas",
      description: "Preço promocional, preço cheio e endereço do checkout.",
    },
    {
      id: "sales_testimonial",
      title: "Etapa 10 — Testemunho da página de vendas",
      type: "imagem do WhatsApp + áudio",
      section: "Página de vendas",
      description: "Áudio e print do WhatsApp exibidos dentro da página de vendas.",
    },
  ]);

  const [saving, setSaving] = useState(false);

  // Removido useEffect interno redundante. O AdminDashboard já gerencia a inicialização do draft.

  const handleSaveContent = async () => {
    setSaving(true);
    try {
      // Garantir que publicamos o estado 'draft' que está no componente,
      // pois ele é a fonte da verdade mais recente durante a edição
      writeDraft(draft); // Sincroniza o localStorage

      // Forçar atualização do draft no AdminDashboard antes de publicar
      // para garantir que estamos enviando o estado exato da UI
      await publishDraft(draft);

      toast.success("Conteúdo do quiz publicado com sucesso!");

      // Pequeno delay e recarregar prévia se possível
      setTimeout(() => {
        const frame = document.querySelector("iframe[data-funnel-preview]") as HTMLIFrameElement;
        if (frame) {
          const url = new URL(frame.src);
          url.searchParams.set("t", Date.now().toString());
          frame.src = url.toString();
        }
      }, 500);
    } catch (err: any) {
      console.error("Erro ao publicar:", err);
      toast.error("Erro ao publicar: " + (err?.message ?? "tente novamente"));
    } finally {
      setSaving(false);
    }
  };

  const QUIZ_OPTIONS: Record<string, string[]> = {
    dor: ["Não saber por onde começar.", "Gastar e não ver resultado."],
    motivacao: [
      "Porque preciso de mais clientes todos os dias.",
      "Porque minhas vendas estão paradas.",
      "Porque quero fazer meu negócio crescer de verdade.",
    ],
    audio: ["Nome do Aluno (ex: @alan_dalila)", "Descrição curta", "Seguidores", "Seguindo"],
    sales_testimonial: ["Nome do Aluno", "Segmento / descrição"],
    sales_offer: ["Preço Oferta (Ex: R$ 197,00)", "Preço Cheio (Ex: R$ 399,00)", "Link Checkout"],
  };

  const updateOption = (id: string, index: number, value: string) => {
    const step = draft.steps?.[id] || {};
    const options = [...(step.options ?? QUIZ_OPTIONS[id] ?? [])];
    options[index] = value;
    const next: FunnelDraft = {
      ...draft,
      steps: { ...(draft.steps || {}), [id]: { ...step, options } },
    };

    // Sincronizar campos específicos de oferta se for o passo sales_offer
    if (id === "sales_offer") {
      next.sales = {
        ...next.sales,
        ...(index === 0 ? { promoPrice: value } : {}),
        ...(index === 1 ? { fullPrice: value } : {}),
        ...(index === 2 ? { checkoutUrl: value } : {}),
      };
    }

    setDraft(next);
    writeDraft(next);
  };

  const updateStep = (
    id: string,
    patch: { title?: string; description?: string; image?: string; audio?: string },
  ) => {
    // Usar o estado 'draft' mais atualizado do componente em vez de ler do localStorage
    // para evitar perda de dados se o writeDraft/readDraft tiver latência ou inconsistência
    const next: FunnelDraft = {
      ...draft,
      steps: { ...(draft.steps || {}), [id]: { ...(draft.steps?.[id] || {}), ...patch } },
    };

    // Sincronizar campo de vendas se o ID for relacionado a sales
    if (id === "sales_vsl") {
      next.sales = { ...next.sales, videoHeadline: patch.title || "" };
    } else if (id === "sales_vsl_video") {
      next.sales = { ...next.sales, vslUrl: patch.image || "", videoThumb: patch.image || "" };
    }

    // Se for o passo 'intro', garantir que o rascunho de vendas não seja afetado por engano
    // mas o resto do código já cuida do merge profundo.

    setDraft(next);
    writeDraft(next);
  };

  const handleUpload = async (
    id: string,
    file: File | undefined,
    field: "image" | "audio" = "image",
  ) => {
    if (!file) return;

    // Type validation
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/");
    const isVideo = file.type.startsWith("video/");

    if (field === "audio" && !isAudio) {
      toast.error(
        `Tipo de arquivo inválido. Você tentou enviar um "${file.type}", mas este campo aceita apenas áudio (MP3, WAV, OGG).`,
      );
      return;
    }

    if (field === "image" && id !== "sales_vsl_video" && !isImage) {
      toast.error(
        `Tipo de arquivo inválido. Você tentou enviar um "${file.type}", mas este campo aceita apenas imagens (JPG, PNG, WEBP).`,
      );
      return;
    }

    if (id === "sales_vsl_video" && field === "image" && !isImage && !isVideo) {
      toast.error(
        `Tipo de arquivo inválido ("${file.type}"). Para o vídeo de vendas, envie um arquivo de vídeo ou uma imagem de capa.`,
      );
      return;
    }

    // Size validation
    const isLargeMedia = field === "audio" || isVideo;
    const maxSize = isLargeMedia ? 500_000_000 : 5_000_000; // 500MB for audio/video, 5MB for images

    if (file.size > maxSize) {
      const sizeMB = (file.size / 1_000_000).toFixed(2);
      const limitMB = maxSize / 1_000_000;
      toast.error(
        `Arquivo muito grande (${sizeMB}MB). O limite máximo permitido para ${isLargeMedia ? "vídeo/áudio" : "imagens"} nesta seção é de ${limitMB}MB.`,
      );
      return;
    }

    let result: string;
    try {
      result = await uploadAdminMedia(file);
    } catch (uploadError) {
      console.error("Erro no upload do Storage:", uploadError);
      toast.error(`Não foi possível enviar o arquivo: ${getErrorMessage(uploadError)}`);
      return;
    }

    const next: FunnelDraft = {
      ...draft,
      steps: { ...(draft.steps || {}), [id]: { ...(draft.steps?.[id] || {}), [field]: result } },
    };
    if (id === "sales_vsl_video" && field === "image") {
      next.sales = isVideo
        ? { ...next.sales, vslUrl: result, videoThumb: result }
        : { ...next.sales, videoThumb: result };
    }
    setDraft(next);
    writeDraft(next);
    toast.success("Arquivo enviado. Clique em Publicar para salvar o conteúdo.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            className={`text-xl font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
          >
            Conteúdo e Mídia
          </h3>
          <p
            className={`text-sm font-medium ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
          >
            Gerencie imagens, textos e áudios do quiz.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveContent}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-black text-white hover:opacity-90 shadow-lg shadow-primary/20 uppercase tracking-widest disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Publicando..." : "Publicar Alterações"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((item, index) => (
          <Fragment key={item.id}>
            {(index === 0 || questions[index - 1]?.section !== item.section) && (
              <div
                className={`mb-2 mt-8 rounded-2xl border px-5 py-4 first:mt-0 ${
                  theme === "dark" ? "border-primary/20 bg-primary/10" : "border-red-100 bg-red-50"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                  Parte{" "}
                  {Array.from(new Set(questions.map((question) => question.section))).indexOf(
                    item.section,
                  ) + 1}
                </p>
                <h4
                  className={`mt-1 text-base font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
                >
                  {item.section}
                </h4>
              </div>
            )}
            <div
              className={`group flex flex-col rounded-2xl border transition-all p-4 ${
                theme === "dark"
                  ? "border-white/5 bg-white/5 hover:border-primary/30"
                  : "border-zinc-200 bg-white hover:border-primary/30 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                      theme === "dark" ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {item.id === "audio" || item.id === "sales_testimonial" ? (
                      <Music className="h-5 w-5" />
                    ) : item.id === "sales_vsl_video" ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-black uppercase ${theme === "dark" ? "text-zinc-200" : "text-zinc-800"}`}
                    >
                      {item.title}
                    </h4>
                    <p
                      className={`mt-1 max-w-2xl text-xs leading-relaxed ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      {item.description}
                    </p>
                    <span
                      className={`text-[10px] uppercase tracking-widest font-bold ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      {item.type} • ID: {item.id}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-zinc-500 hover:text-white">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-500/50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                className={`mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2 ${theme === "dark" ? "border-white/5" : "border-zinc-100"}`}
              >
                {item.id !== "sales_vsl_video" && item.id !== "sales_offer" && (
                  <div className="space-y-2 sm:col-span-2">
                    <label
                      className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      {item.id === "intro"
                        ? "Chamada principal da abertura"
                        : item.id === "dor" || item.id === "motivacao"
                          ? "Texto da pergunta"
                          : item.id === "sales_vsl"
                            ? "Chamada exibida acima do vídeo"
                            : "Título exibido nesta etapa"}
                    </label>
                    <input
                      type="text"
                      value={draft.steps?.[item.id]?.title ?? ""}
                      placeholder="Deixe vazio para manter o texto atual da página"
                      onChange={(e) => updateStep(item.id, { title: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        theme === "dark"
                          ? "border-white/10 bg-black/40 text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-900"
                      }`}
                    />
                    {item.id === "intro" && (
                      <>
                        <label
                          className={`mt-3 block text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                        >
                          Texto de apoio abaixo da chamada
                        </label>
                        <textarea
                          value={draft.steps?.[item.id]?.description ?? ""}
                          placeholder="Responda o diagnóstico gratuito de 2 minutos..."
                          onChange={(e) => updateStep(item.id, { description: e.target.value })}
                          rows={3}
                          className={`w-full resize-y rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                            theme === "dark"
                              ? "border-white/10 bg-black/40 text-white"
                              : "border-zinc-200 bg-zinc-50 text-zinc-900"
                          }`}
                        />
                      </>
                    )}
                  </div>
                )}
                {item.id !== "sales_vsl" && item.id !== "sales_offer" && (
                  <div className="space-y-2 sm:col-span-2">
                    <label
                      className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      {item.id === "sales_vsl_video"
                        ? "Vídeo da Oferta (VSL)"
                        : item.id === "audio"
                          ? "Imagem do depoimento exibida abaixo do áudio"
                          : item.id === "sales_testimonial"
                            ? "Print do depoimento no WhatsApp"
                            : item.id === "niche"
                              ? "Print do depoimento no Instagram"
                              : "Imagem/Background"}
                    </label>
                    <div className="flex flex-col gap-3">
                      <div
                        className={`relative w-full overflow-hidden rounded-2xl border ${
                          item.id === "audio" ||
                          item.id === "niche" ||
                          item.id === "sales_testimonial"
                            ? "h-[420px] sm:h-[520px]"
                            : item.id === "intro" || item.id === "sales_vsl_video"
                              ? "h-64"
                              : "h-52"
                        } ${theme === "dark" ? "bg-zinc-900 border-white/5" : "bg-zinc-50 border-zinc-200 shadow-inner"}`}
                      >
                        <MediaPreview item={item} draft={draft} />

                        {(draft.steps?.[item.id]?.image ||
                          draft.steps?.[item.id]?.audio ||
                          (item.id === "intro" && !draft.steps?.[item.id]?.image)) && (
                          <button
                            onClick={() => {
                              updateStep(
                                item.id,
                                item.id === "audio" ? { image: "" } : { image: "", audio: "" },
                              );
                              toast.info("Mídia restaurada para o padrão.");
                            }}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg z-10"
                            title="Remover imagem"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          placeholder={
                            item.id === "sales_vsl_video"
                              ? "URL do vídeo/thumb"
                              : item.id === "audio"
                                ? "URL da imagem do depoimento"
                                : item.id === "sales_testimonial"
                                  ? "URL da imagem do WhatsApp"
                                  : item.id === "niche"
                                    ? "URL da imagem do Instagram"
                                    : "URL da imagem"
                          }
                          value={
                            draft.steps?.[item.id]?.image?.startsWith("data:") ||
                            draft.steps?.[item.id]?.audio?.startsWith("data:")
                              ? ""
                              : draft.steps?.[item.id]?.image ||
                                draft.steps?.[item.id]?.audio ||
                                (item.id === "intro" ? logoAsset.url : "")
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const isAudio = Boolean(val.match(/\.(mp3|wav|ogg)(?:\?|$)/i));
                            updateStep(item.id, {
                              [item.id !== "audio" && isAudio ? "audio" : "image"]: val,
                            });
                          }}
                          className={`w-full rounded-lg border px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                            theme === "dark"
                              ? "border-white/10 bg-black/40 text-white"
                              : "border-zinc-200 bg-zinc-50 text-zinc-900"
                          }`}
                        />
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                            {item.id === "sales_vsl_video" ? (
                              <Video className="h-3 w-3" />
                            ) : item.id === "sales_testimonial" ? (
                              <Music className="h-3 w-3" />
                            ) : (
                              <ImageIcon className="h-3 w-3" />
                            )}
                            {item.id === "sales_vsl_video"
                              ? "Subir Vídeo"
                              : item.id === "audio"
                                ? "Subir Imagem"
                                : item.id === "sales_testimonial"
                                  ? "Subir Imagem"
                                  : "Alterar Upload"}
                            <input
                              type="file"
                              accept={
                                item.id === "sales_vsl_video"
                                  ? "video/*,image/*"
                                  : item.id === "audio"
                                    ? "image/*"
                                    : "image/*"
                              }
                              className="hidden"
                              onChange={(e) => {
                                handleUpload(item.id, e.target.files?.[0], "image");
                              }}
                            />
                          </label>

                          {item.id === "sales_testimonial" && (
                            <label className="cursor-pointer text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                              <Music className="h-3 w-3" />
                              Subir Áudio
                              <input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleUpload(item.id, e.target.files?.[0], "audio")
                                }
                              />
                            </label>
                          )}

                          {(draft.steps?.[item.id]?.image ||
                            draft.steps?.[item.id]?.audio ||
                            (item.id === "intro" && draft.steps?.[item.id]?.image)) && (
                            <button
                              onClick={() => {
                                updateStep(
                                  item.id,
                                  item.id === "audio" ? { image: "" } : { image: "", audio: "" },
                                );
                                toast.info("Mídia restaurada para o padrão.");
                              }}
                              className="text-xs font-black text-red-500 hover:underline flex items-center gap-1 uppercase tracking-tighter"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remover
                            </button>
                          )}
                        </div>
                        {item.id === "sales_testimonial" && draft.steps?.[item.id]?.audio && (
                          <audio
                            src={draft.steps?.[item.id]?.audio}
                            controls
                            preload="metadata"
                            className="h-9 w-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {QUIZ_OPTIONS[item.id] && (
                  <div className="space-y-3 sm:col-span-2">
                    <label
                      className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      {item.id === "sales_offer"
                        ? "Dados da oferta na ordem exibida abaixo"
                        : item.id === "audio" || item.id === "sales_testimonial"
                          ? "Textos complementares do testemunho"
                          : "Respostas que o visitante pode escolher"}
                    </label>
                    <div className="grid gap-3">
                      {(draft.steps?.[item.id]?.options ?? QUIZ_OPTIONS[item.id] ?? []).map(
                        (option, i) => (
                          <div key={i} className="flex gap-2">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[10px] font-black ${theme === "dark" ? "bg-zinc-800 border-white/5 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-400"}`}
                            >
                              #{i + 1}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(item.id, i, e.target.value)}
                              className={`w-full rounded-xl border px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                                theme === "dark"
                                  ? "border-white/10 bg-black/40 text-white"
                                  : "border-zinc-200 bg-zinc-50 text-zinc-900"
                              }`}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {item.id === "audio" && (
                  <div className="space-y-2">
                    <label
                      className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      Arquivo de Áudio (MP3)
                    </label>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex-1 rounded-lg px-3 py-2 text-[10px] font-mono border overflow-hidden truncate ${
                          theme === "dark"
                            ? "bg-zinc-800 text-zinc-400 border-white/5"
                            : "bg-zinc-50 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {draft.steps?.[item.id]?.audio ? (
                          <span className="text-green-500 font-bold">
                            ● Áudio carregado no Storage
                          </span>
                        ) : (
                          "Nenhum áudio selecionado"
                        )}
                      </div>
                      <label className="cursor-pointer text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                        <Music className="h-3 w-3" />
                        {draft.steps?.[item.id]?.audio ? "Alterar Áudio" : "Subir Novo"}
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => handleUpload(item.id, e.target.files?.[0], "audio")}
                        />
                      </label>
                      {draft.steps?.[item.id]?.audio && (
                        <button
                          onClick={() => {
                            updateStep(item.id, { audio: "" });
                            toast.info("Áudio removido da prévia.");
                          }}
                          className="text-xs font-black text-red-500 hover:underline flex items-center gap-1 uppercase tracking-tighter"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remover
                        </button>
                      )}
                    </div>
                    {draft.steps?.[item.id]?.audio && (
                      <audio
                        controls
                        preload="metadata"
                        src={draft.steps[item.id]?.audio}
                        className="mt-3 w-full"
                      >
                        Seu navegador não suporta reprodução de áudio.
                      </audio>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
      <button
        onClick={handleSaveContent}
        disabled={saving}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black uppercase text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60"
      >
        <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar Alterações de Conteúdo"}
      </button>
    </div>
  );
}

export function LivePreview({ theme }: { theme: "dark" | "light" }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    // Sincronizar prévia periodicamente se necessário
    const interval = setInterval(() => {
      const frame = document.querySelector("iframe[data-funnel-preview]") as HTMLIFrameElement;
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage(
          { type: "dqa:funnel-draft", draft: readDraft() },
          window.location.origin,
        );
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`sticky top-6 rounded-[2rem] border p-4 transition-all ${
        theme === "dark" ? "border-white/10 bg-zinc-900/70" : "border-zinc-200 bg-white shadow-xl"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span
            className={`text-[11px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}
          >
            Prévia ao vivo
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop")}
            title="Desktop"
            className={`rounded-lg p-2 transition-colors ${device === "desktop" ? "bg-primary text-white" : theme === "dark" ? "text-zinc-400 hover:bg-white/10" : "text-zinc-500 hover:bg-zinc-100"}`}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            title="Mobile"
            className={`rounded-lg p-2 transition-colors ${device === "mobile" ? "bg-primary text-white" : theme === "dark" ? "text-zinc-400 hover:bg-white/10" : "text-zinc-500 hover:bg-zinc-100"}`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            onClick={() => setNonce((n) => n + 1)}
            title="Recarregar prévia"
            className={`rounded-lg p-2 transition-colors ${theme === "dark" ? "text-zinc-400 hover:bg-white/10" : "text-zinc-500 hover:bg-zinc-100"}`}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={`mx-auto overflow-hidden rounded-2xl border ${theme === "dark" ? "border-white/10 bg-black" : "border-zinc-200 bg-zinc-50"} ${device === "mobile" ? "w-[390px] max-w-full" : "w-full"}`}
      >
        <iframe
          key={nonce}
          data-funnel-preview="true"
          src={`/?preview=1&t=${nonce}`}
          title="Prévia da Landing Page"
          onLoad={(e) => {
            setTimeout(() => {
              const currentDraft = readDraft();
              (e.currentTarget as HTMLIFrameElement).contentWindow?.postMessage(
                { type: "dqa:funnel-draft", draft: currentDraft },
                window.location.origin,
              );
            }, 500); // Delay para garantir que a página carregou os scripts de postMessage
          }}
          className="h-[720px] w-full bg-white"
        />
      </div>
      <p
        className={`mt-3 text-center text-[10px] font-bold uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
      >
        Atualiza automaticamente enquanto você edita
      </p>
    </div>
  );
}

function MediaPreview({ item, draft }: { item: any; draft: FunnelDraft }) {
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const mediaUrl =
    draft.steps?.[item.id]?.image ||
    draft.steps?.[item.id]?.audio ||
    (item.id === "intro" ? logoAsset.url : "");
  const isAudio =
    (item.id === "audio" && !draft.steps?.[item.id]?.image) ||
    (mediaUrl && mediaUrl.match(/\.(mp3|wav|ogg)/i));

  useEffect(() => {
    if (!mediaUrl) {
      setStatus("success"); // Empty state is not an error
      return;
    }

    setStatus("loading");

    if (isAudio) {
      const audio = new Audio();
      audio.src = mediaUrl;
      audio.oncanplaythrough = () => setStatus("success");
      audio.onerror = () => setStatus("error");
    } else {
      const img = new Image();
      img.src = mediaUrl;
      img.onload = () => setStatus("success");
      img.onerror = () => setStatus("error");
    }
  }, [mediaUrl, isAudio]);

  if (!mediaUrl && item.id !== "intro") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/5">
        <div className="flex flex-col items-center gap-2">
          {item.id === "sales" ? (
            <Video className="h-8 w-8 text-zinc-400/30" />
          ) : isAudio ? (
            <Music className="h-8 w-8 text-zinc-400/30" />
          ) : (
            <ImageIcon className="h-8 w-8 text-zinc-400/30" />
          )}
          <span className="text-[10px] font-bold text-zinc-400/50 uppercase">
            Sem {item.id === "sales" ? "Vídeo" : isAudio ? "Áudio" : "Imagem"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-sm p-4 text-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mb-1" />
          <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">
            Mídia não encontrada ou link quebrado
          </span>
          <p className="text-[8px] text-red-400/80 mt-1 max-w-[150px] leading-tight">
            Verifique se a URL está correta ou tente fazer o upload novamente.
          </p>
        </div>
      )}

      {item.id === "sales" ? (
        <video src={mediaUrl} className="h-full w-full object-cover" controls />
      ) : isAudio ? (
        <div className="flex h-full w-full items-center justify-center bg-primary/10">
          <Music className="h-8 w-8 text-primary animate-pulse" />
        </div>
      ) : (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/preview relative block h-full w-full"
          title="Abrir imagem em tamanho original"
        >
          <img
            key={mediaUrl || (item.id === "intro" ? "default-logo" : `step-${item.id}-default`)}
            src={mediaUrl}
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover/preview:scale-[1.02]"
            alt="Prévia da mídia"
          />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white opacity-0 transition-opacity group-hover/preview:opacity-100">
            Clique para ampliar
          </span>
        </a>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
        <span className="text-[10px] font-black text-white uppercase tracking-widest">
          {draft.steps?.[item.id]?.image || draft.steps?.[item.id]?.audio
            ? "Preview Atual"
            : "Padrão do Sistema"}
        </span>
      </div>
    </div>
  );
}

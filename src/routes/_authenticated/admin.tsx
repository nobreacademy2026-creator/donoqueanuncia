import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { readDraft, writeDraft, publishDraft, loadPublished, type FunnelDraft, EMPTY_DRAFT } from "@/lib/funnel-content";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "config" | "tracking" | "content">("analytics");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [draft, setDraft] = useState<FunnelDraft>(EMPTY_DRAFT);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      const published = await loadPublished();
      const local = readDraft();
      
      const merged: FunnelDraft = {
        steps: { ...(published?.steps || {}), ...local.steps },
        sales: { ...(published?.sales || {}), ...local.sales },
      };
      
      setDraft(merged);
      writeDraft(merged);
    }
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"}`}>
      {/* Sidebar Fixa */}
      <aside className={`w-[280px] shrink-0 border-r flex flex-col transition-all duration-300 ${
        theme === "dark" 
        ? "border-white/10 bg-zinc-900/50 backdrop-blur-xl" 
        : "border-zinc-200 bg-white shadow-sm"
      }`}>
        <div className="p-8">
          <div className="flex flex-col gap-2">
            <h1 className={`text-2xl font-black tracking-tighter uppercase leading-none ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>
              Dono que <span className="text-primary">Anuncia</span>
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>
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
              <><Sun className="h-5 w-5" /> Modo Claro</>
            ) : (
              <><Moon className="h-5 w-5" /> Modo Escuro</>
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
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-inherit/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {activeTab === "analytics" && "Analytics & Métricas"}
              {activeTab === "content" && "Conteúdo do Funil"}
              {activeTab === "config" && "Página de Vendas"}
              {activeTab === "tracking" && "Pixels & Tracking"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${
              theme === "dark" ? "bg-white/5 text-zinc-400" : "bg-zinc-100 text-zinc-600"
            }`}>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Sistema Online
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1400px]">
          <div className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
            theme === "dark" 
            ? "border-white/10 bg-zinc-900/30" 
            : "border-zinc-200 bg-white shadow-sm"
          }`}>
            <div className="p-8 sm:p-10">
              {activeTab === "analytics" && <AnalyticsSection theme={theme} />}
              {activeTab === "config" && <ConfigSection theme={theme} setDraft={setDraft} />}
              {activeTab === "tracking" && <TrackingSection theme={theme} />}
              {activeTab === "content" && <ContentSection theme={theme} draft={draft} setDraft={setDraft} />}
            </div>
          </div>

          {(activeTab === "content" || activeTab === "config") && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h3 className="text-xl font-bold uppercase tracking-tight">Preview em Tempo Real</h3>
              </div>
              <LivePreview theme={theme} />
            </div>
          )}
        </div>
      </main>
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
  
  const [funnelData, setFunnelData] = useState([
    { step: "Início Quiz", count: 0, drop: 0 },
    { step: "Pergunta 1 (Dor)", count: 0, drop: 0 },
    { step: "Pergunta 2 (Motivacao)", count: 0, drop: 0 },
    { step: "Objeção (Minions)", count: 0, drop: 0 },
    { step: "Checklist Benefícios", count: 0, drop: 0 },
    { step: "Depoimento (Áudio)", count: 0, drop: 0 },
    { step: "Nicho (Instagram)", count: 0, drop: 0 },
    { step: "Página de Vendas", count: 0, drop: 0 },
    { step: "Checkout", count: 0, drop: 0 },
  ]);

  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Buscar eventos reais do banco de dados
        const { data: events, error } = await supabase
          .from('analytics_events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (events && events.length > 0) {
          // Processar estatísticas
          const accessCount = events.filter(e => e.event_name === 'quiz_iniciado').length;
          const completionCount = events.filter(e => e.event_name === 'quiz_concluido').length;
          const checkoutCount = events.filter(e => e.event_name === 'checkout_iniciado').length;
          const videoCount = events.filter(e => e.event_name === 'clique_video').length; // Supondo este nome de evento

          setStats({
            access: accessCount,
            completion: completionCount,
            checkout: checkoutCount,
            videoViews: videoCount
          });

          // Processar leads
          const formattedLeads = events.map(e => ({
            id: e.id,
            event: e.event_name,
            details: JSON.stringify(e.payload),
            date: new Date(e.created_at || '').toLocaleString('pt-BR'),
            stage: (e.payload as any)?.stage || 'N/A',
            source: (e.payload as any)?.source || 'Direto'
          }));
          setLeads(formattedLeads);

          // Processar funil (simplificado para demonstração com dados reais)
          const steps = [
            { name: "Início Quiz", event: "quiz_iniciado" },
            { name: "Pergunta 1 (Dor)", event: "quiz_resposta", filter: (p: any) => p.pergunta === 'dor' },
            { name: "Pergunta 2 (Motivacao)", event: "quiz_resposta", filter: (p: any) => p.pergunta === 'motivacao' },
            { name: "Página de Vendas", event: "clique_vendas" },
            { name: "Checkout", event: "checkout_iniciado" },
          ];

          const newFunnel = steps.map((s, i) => {
            const currentFilter = s.filter;
            const count = events.filter(e => 
              e.event_name === s.event && (!currentFilter || (e.payload && currentFilter(e.payload)))
            ).length;
            
            let drop = 0;
            if (i > 0) {
              const prevStep = steps[i-1];
              if (prevStep) {
                const prevFilter = prevStep.filter;
                const prevCount = events.filter(e => 
                  e.event_name === prevStep.event && (!prevFilter || (e.payload && prevFilter(e.payload)))
                ).length;
                drop = prevCount > 0 ? Math.round((1 - count / prevCount) * 100) : 0;
              }
            }

            return { step: s.name, count, drop };
          });
          setFunnelData(newFunnel as any);
        }
      } catch (err) {
        console.error("Erro ao buscar dados reais:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "all" || lead.stage.toLowerCase() === filterStage.toLowerCase();
    const matchesSource = filterSource === "all" || lead.source.toLowerCase() === filterSource.toLowerCase();
    return matchesSearch && matchesStage && matchesSource;
  });

  return (
    <div className="space-y-8 animate-rise-in">
      <div className="grid gap-6 sm:grid-cols-4">
        <StatCard label="Acessos Totais" value={stats.access} icon={Users} color={theme === "dark" ? "text-blue-400" : "text-blue-600"} theme={theme} />
        <StatCard label="Finalizados" value={stats.completion} icon={Target} color={theme === "dark" ? "text-green-400" : "text-green-600"} theme={theme} />
        <StatCard label="Cliques Vídeo" value={stats.videoViews} icon={Video} color={theme === "dark" ? "text-purple-400" : "text-purple-600"} theme={theme} />
        <StatCard label="Checkouts" value={stats.checkout} icon={BarChart3} color={theme === "dark" ? "text-red-400" : "text-red-600"} theme={theme} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
              <div className={`surface-card rounded-[2rem] border transition-all p-8 ${
                theme === "dark" 
                ? "border-white/10 bg-zinc-900/80" 
                : "border-zinc-200 bg-white shadow-sm"
              }`}>
                <h3 className={`text-lg font-black mb-6 flex items-center gap-2 uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>
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
                    <span className={`font-bold uppercase tracking-widest text-[10px] ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>{item.step}</span>
                    <span className={`font-black ${theme === "dark" ? "text-zinc-100" : "text-zinc-900"}`}>{item.count} <span className="text-zinc-500 font-medium">({stats.access > 0 ? Math.round(item.count/stats.access * 100) : 0}%)</span></span>
                  </div>
                  <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === "dark" ? "bg-white/5" : "bg-zinc-100"}`}>
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${stats.access > 0 ? (item.count / stats.access) * 100 : 0}%` }}
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
          <h3 className={`text-lg font-black mb-4 uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>Ações do Admin</h3>
          <div className="grid gap-3">
             <button className={`flex items-center justify-between rounded-2xl p-4 text-sm font-bold border transition-all ${
               theme === "dark"
               ? "bg-zinc-900/50 text-zinc-300 border-white/5 hover:bg-white/5 hover:text-white"
               : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
             }`}>
                <span className="flex items-center gap-3"><ImageIcon className="h-4 w-4" /> Exportar Leads</span>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
             </button>
             <button className={`flex items-center justify-between rounded-2xl p-4 text-sm font-bold border transition-all ${
               theme === "dark"
               ? "bg-zinc-900/50 text-zinc-300 border-white/5 hover:bg-white/5 hover:text-white"
               : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
             }`}>
                <span className="flex items-center gap-3"><BarChart3 className="h-4 w-4" /> Relatório Completo</span>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
             </button>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className={`text-lg font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>Leads e Eventos</h3>
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
            
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
              theme === "dark" 
              ? "border-white/10 bg-black/20" 
              : "border-zinc-200 bg-zinc-50"
            }`}>
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className={`bg-transparent text-xs focus:outline-none font-bold ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
              >
                <option value="all" className={theme === "dark" ? "bg-zinc-900" : "bg-white"}>Todas Etapas</option>
                <option value="intro" className={theme === "dark" ? "bg-zinc-900" : "bg-white"}>Intro</option>
                <option value="quiz" className={theme === "dark" ? "bg-zinc-900" : "bg-white"}>Quiz</option>
                <option value="vendas" className={theme === "dark" ? "bg-zinc-900" : "bg-white"}>Página de Vendas</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select 
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                <option value="all" className="bg-zinc-900">Todas Origens</option>
                <option value="facebook ads" className="bg-zinc-900">Facebook Ads</option>
                <option value="instagram" className="bg-zinc-900">Instagram</option>
                <option value="google search" className="bg-zinc-900">Google Search</option>
                <option value="direto" className="bg-zinc-900">Direto</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`overflow-hidden rounded-2xl border transition-all ${
          theme === "dark" 
          ? "border-white/10 bg-zinc-900/50" 
          : "border-zinc-200 bg-white shadow-sm"
        }`}>
          <table className="w-full text-left text-sm">
            <thead className={`${theme === "dark" ? "bg-white/5 text-zinc-400" : "bg-zinc-50 text-zinc-500"} font-bold uppercase text-[10px] tracking-widest`}>
              <tr>
                <th className="px-4 py-4">Evento</th>
                <th className="px-4 py-4">Etapa</th>
                <th className="px-4 py-4">Origem</th>
                <th className="px-4 py-4">Detalhes</th>
                <th className="px-4 py-4 text-right">Data</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === "dark" ? "divide-white/5" : "divide-zinc-100"}`}>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-4 py-4">
                    <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{lead.event}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      theme === "dark" ? "bg-white/10 text-zinc-300" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className={`px-4 py-4 text-xs font-medium ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>{lead.source}</td>
                  <td className={`px-4 py-4 text-xs max-w-xs truncate ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>{lead.details}</td>
                  <td className={`px-4 py-4 text-xs text-right tabular-nums ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>
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
    <div className={`rounded-2xl border transition-all ${
      theme === "dark" 
      ? "border-white/10 bg-zinc-900/80" 
      : "border-zinc-200 bg-white shadow-sm"
    } p-6`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>{label}</p>
        <Icon className={`h-5 w-5 ${color} ${theme === "dark" ? "opacity-80" : "opacity-100"}`} />
      </div>
      <p className={`mt-2 text-3xl font-black ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>{value}</p>
    </div>
  );
}

function ConfigSection({ theme, setDraft }: { theme: "dark" | "light", setDraft: (d: FunnelDraft) => void }) {
  const initial = readDraft();
  const [checkoutUrl, setCheckoutUrl] = useState(initial.sales.checkoutUrl ?? "https://pay.kiwify.com.br/...");
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
      const currentDraft = readDraft();
      // Garantir que os estados locais dos inputs estão refletidos no rascunho antes de publicar
      currentDraft.sales = {
        ...currentDraft.sales,
        checkoutUrl,
        promoPrice,
        fullPrice,
        vslUrl,
        videoThumb: vslUrl // Sincroniza o thumb com a URL por padrão
      };
      
      setDraft(currentDraft); // Atualiza o estado global
      writeDraft(currentDraft); // Persiste no localStorage
      
      await publishDraft(currentDraft);
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
        <h3 className={`text-xl font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>Página de Vendas & Oferta</h3>
        <p className={`text-sm font-medium ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>Sincronize preços, vídeos e links da oferta final.</p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>Link do Checkout (Botões)</label>
          <input 
            type="text" 
            value={checkoutUrl}
            onChange={(e) => { setCheckoutUrl(e.target.value); publish({ checkoutUrl: e.target.value }); }}
            className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              theme === "dark"
              ? "border-white/10 bg-black/40 text-white"
              : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
            }`}
          />
        </div>

        <div className="space-y-2">
          <label className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>Vídeo VSL (URL Youtube/Vimeo)</label>
          <input 
            type="text" 
            placeholder="https://..."
            value={vslUrl}
            onChange={(e) => { setVslUrl(e.target.value); publish({ vslUrl: e.target.value, videoThumb: e.target.value }); }}
            className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              theme === "dark"
              ? "border-white/10 bg-black/40 text-white"
              : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
            }`}
          />
        </div>

        <div className="space-y-2">
          <label className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>Preço Original (R$)</label>
          <input 
            type="text" 
            value={fullPrice}
            onChange={(e) => { setFullPrice(e.target.value); publish({ fullPrice: e.target.value }); }}
            className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
              theme === "dark"
              ? "border-white/10 bg-black/40 text-white"
              : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
            }`}
          />
        </div>

        <div className="space-y-2">
          <label className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>Preço Oferta (R$)</label>
          <input 
            type="text" 
            value={promoPrice}
            onChange={(e) => { setPromoPrice(e.target.value); publish({ promoPrice: e.target.value }); }}
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

function TrackingSection({ theme }: { theme: "dark" | "light" }) {
  return (
    <div className="space-y-6">
      <h3 className={`text-xl font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>Pixels e Rastreamento</h3>
      
      <div className="space-y-2">
        <label className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>ID Meta Pixel</label>
        <input 
          type="text" 
          placeholder="Ex: 1234567890"
          className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
            theme === "dark"
            ? "border-white/10 bg-black/40 text-white"
            : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
          }`}
        />
      </div>

      <div className="space-y-2">
        <label className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>ID Google Analytics (G-XXX)</label>
        <input 
          type="text" 
          placeholder="Ex: G-ABC123DEF"
          className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
            theme === "dark"
            ? "border-white/10 bg-black/40 text-white"
            : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
          }`}
        />
      </div>

      <div className="space-y-2">
        <label className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>Scripts Adicionais (Head)</label>
        <textarea 
          rows={5}
          className={`w-full rounded-2xl border px-4 py-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
            theme === "dark"
            ? "border-white/10 bg-black/40 text-white"
            : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
          }`}
          placeholder="<!-- Scripts extras aqui -->"
        />
      </div>

      <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white hover:opacity-90 shadow-lg shadow-primary/20 uppercase tracking-widest text-sm">
        <Save className="h-4 w-4" />
        Atualizar Tracking
      </button>
    </div>
  );
}

function ContentSection({ theme, draft, setDraft }: { theme: "dark" | "light", draft: FunnelDraft, setDraft: (d: FunnelDraft) => void }) {
  const [questions, setQuestions] = useState([
    { id: 'intro', title: 'Página Inicial (Intro)', type: 'página' },
    { id: 'dor', title: 'Pergunta: Dor do Cliente', type: 'pergunta' },
    { id: 'motivacao', title: 'Pergunta: Motivação', type: 'pergunta' },
    { id: 'objecao', title: 'Página: Quebra de Objeção', type: 'etapa' },
    { id: 'beneficios', title: 'Página: Checklist de Benefícios', type: 'etapa' },
    { id: 'audio', title: 'Depoimento do Aluno', type: 'etapa' },
    { id: 'niche', title: 'Validação de Nicho', type: 'etapa' },
    { id: 'sales', title: 'Página de Vendas (Final)', type: 'página' },
  ]);

  const [saving, setSaving] = useState(false);

  // Removido useEffect interno redundante. O AdminDashboard já gerencia a inicialização do draft.

  const handleSaveContent = async () => {
    setSaving(true);
    try {
      // Garantir que publicamos o estado 'draft' que está no componente,
      // pois ele é a fonte da verdade mais recente durante a edição
      writeDraft(draft); // Sincroniza o localStorage
      await publishDraft(draft);
      toast.success("Conteúdo do quiz publicado com sucesso!");
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
  };

  const updateOption = (id: string, index: number, value: string) => {
    const step = draft.steps?.[id] || {};
    const options = [...(step.options ?? QUIZ_OPTIONS[id] ?? [])];
    options[index] = value;
    const next: FunnelDraft = {
      ...draft,
      steps: { ...(draft.steps || {}), [id]: { ...step, options } },
    };
    setDraft(next);
    writeDraft(next);
  };

  const updateStep = (id: string, patch: { title?: string; image?: string; audio?: string }) => {
    // Usar o estado 'draft' mais atualizado do componente em vez de ler do localStorage
    // para evitar perda de dados se o writeDraft/readDraft tiver latência ou inconsistência
    const next: FunnelDraft = {
      ...draft,
      steps: { ...(draft.steps || {}), [id]: { ...(draft.steps?.[id] || {}), ...patch } },
    };
    
    // Sincronizar campo de vendas se o ID for 'sales'
    if (id === 'sales') {
      next.sales = {
        ...next.sales,
        ...(patch.title !== undefined ? { videoHeadline: patch.title } : {}),
        ...(patch.image !== undefined ? { videoThumb: patch.image } : {}),
      };
    }
    
    setDraft(next);
    writeDraft(next);
  };

  const handleUpload = (id: string, file: File | undefined, field: 'image' | 'audio' = 'image') => {
    if (!file) return;
    if (file.size > 10_000_000) { 
      toast.error("Arquivo muito grande (máx. 10MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      
      // Imediatamente atualiza o estado local e o preview
      const next: FunnelDraft = {
        ...draft,
        steps: { ...(draft.steps || {}), [id]: { ...(draft.steps?.[id] || {}), [field]: result } },
      };
      
      if (id === 'sales' && field === 'image') {
        next.sales = { ...next.sales, videoThumb: result };
      }
      
      setDraft(next);
      writeDraft(next);
      
      toast.info(`${field === 'audio' ? 'Áudio' : 'Upload'} concluído na prévia. Clique em 'Publicar' para salvar.`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className={`text-xl font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>Conteúdo e Mídia</h3>
          <p className={`text-sm font-medium ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>Gerencie imagens, textos e áudios do quiz.</p>
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
        {questions.map((item) => (
          <div key={item.id} className={`group flex flex-col rounded-2xl border transition-all p-4 ${
            theme === "dark"
            ? "border-white/5 bg-white/5 hover:border-primary/30"
            : "border-zinc-200 bg-white hover:border-primary/30 shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                  theme === "dark" ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                }`}>
                  {item.id === 'audio' ? <Music className="h-5 w-5" /> : 
                   item.id === 'sales' ? <Video className="h-5 w-5" /> : 
                   <ImageIcon className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className={`text-sm font-black uppercase ${theme === "dark" ? "text-zinc-200" : "text-zinc-800"}`}>{item.title}</h4>
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>{item.type} • ID: {item.id}</span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-zinc-500 hover:text-white"><Settings className="h-4 w-4" /></button>
                <button className="p-2 text-red-500/50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>

            <div className={`mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2 ${theme === "dark" ? "border-white/5" : "border-zinc-100"}`}>
              <div className="space-y-2 sm:col-span-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>Texto / Título exibido</label>
                <input
                  type="text"
                  value={draft.steps?.[item.id]?.title ?? ""}
                  placeholder="Deixe vazio para manter o texto atual da página"
                  onChange={(e) => updateStep(item.id, { title: e.target.value })}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    theme === "dark" ? "border-white/10 bg-black/40 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-900"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>
                  {item.id === 'sales' ? 'Vídeo da Oferta (VSL)' : 'Imagem/Background'}
                </label>
                <div className="flex flex-col gap-3">
                  <div className={`relative h-28 w-full rounded-xl overflow-hidden border ${theme === "dark" ? "bg-zinc-800 border-white/5" : "bg-zinc-100 border-zinc-200 shadow-inner"}`}>
                     {draft.steps?.[item.id]?.image ? (
                       <>
                         <img src={draft.steps?.[item.id]?.image} className="h-full w-full object-cover" alt="" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Preview Atual</span>
                         </div>
                         <button 
                           onClick={() => {
                             updateStep(item.id, { image: "" });
                             toast.info("Imagem removida da prévia.");
                           }}
                           className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg z-10"
                           title="Remover imagem"
                         >
                           <X className="h-3.5 w-3.5" />
                         </button>
                       </>
                     ) : item.id === 'sales' ? (
                       <div className="flex h-full w-full items-center justify-center bg-black/20">
                         <div className="flex flex-col items-center gap-2">
                           <Video className="h-8 w-8 text-zinc-500/50" />
                           <span className="text-[10px] font-bold text-zinc-500 uppercase">Sem Vídeo</span>
                         </div>
                       </div>
                     ) : (
                       <div className="flex h-full w-full items-center justify-center bg-black/5">
                         <div className="flex flex-col items-center gap-2">
                           <ImageIcon className="h-8 w-8 text-zinc-400/30" />
                           <span className="text-[10px] font-bold text-zinc-400/50 uppercase">Sem Imagem</span>
                         </div>
                       </div>
                     )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      placeholder={item.id === 'sales' ? "URL do vídeo/thumb" : "URL da imagem"}
                      value={draft.steps?.[item.id]?.image?.startsWith("data:") ? "" : (draft.steps?.[item.id]?.image ?? "")}
                      onChange={(e) => updateStep(item.id, { image: e.target.value })}
                      className={`w-full rounded-lg border px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        theme === "dark" ? "border-white/10 bg-black/40 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-900"
                      }`}
                    />
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                        {item.id === 'sales' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                        {item.id === 'sales' ? 'Subir Vídeo' : 'Alterar Upload'}
                        <input
                          type="file"
                          accept={item.id === 'sales' ? "video/*,image/*" : "image/*"}
                          className="hidden"
                          onChange={(e) => handleUpload(item.id, e.target.files?.[0])}
                        />
                      </label>
                      
                      {draft.steps?.[item.id]?.image && (
                        <button 
                          onClick={() => {
                            updateStep(item.id, { image: "" });
                            toast.info("Imagem removida da prévia.");
                          }}
                          className="text-xs font-black text-red-500 hover:underline flex items-center gap-1 uppercase tracking-tighter"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {QUIZ_OPTIONS[item.id] && (
                <div className="space-y-3 sm:col-span-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>Opções de resposta</label>
                  <div className="grid gap-3">
                    {(draft.steps?.[item.id]?.options ?? QUIZ_OPTIONS[item.id] ?? []).map((option, i) => (
                      <div key={i} className="flex gap-2">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[10px] font-black ${theme === "dark" ? "bg-zinc-800 border-white/5 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-400"}`}>
                          #{i + 1}
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(item.id, i, e.target.value)}
                          className={`w-full rounded-xl border px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                            theme === "dark" ? "border-white/10 bg-black/40 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-900"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {item.id === 'audio' && (
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>Arquivo de Áudio (MP3)</label>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 rounded-lg px-3 py-2 text-[10px] font-mono border overflow-hidden truncate ${
                      theme === "dark" ? "bg-zinc-800 text-zinc-400 border-white/5" : "bg-zinc-50 text-zinc-600 border-zinc-200"
                    }`}>
                      {draft.steps[item.id]?.audio ? (
                        <span className="text-green-500 font-bold">● Áudio carregado (Base64)</span>
                      ) : "Nenhum áudio selecionado"}
                    </div>
                    <label className="cursor-pointer text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                      <Music className="h-3 w-3" /> 
                      {draft.steps[item.id]?.audio ? "Alterar Áudio" : "Subir Novo"}
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => handleUpload(item.id, e.target.files?.[0], 'audio')}
                      />
                    </label>
                    {draft.steps[item.id]?.audio && (
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
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSaveContent}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black uppercase text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60"
      >
        <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar Alterações de Conteúdo"}
      </button>
    </div>
  );
}


function LivePreview({ theme }: { theme: "dark" | "light" }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [nonce, setNonce] = useState(0);

  return (
    <div className={`sticky top-6 rounded-[2rem] border p-4 transition-all ${
      theme === "dark" ? "border-white/10 bg-zinc-900/70" : "border-zinc-200 bg-white shadow-xl"
    }`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className={`text-[11px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>
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

      <div className={`mx-auto overflow-hidden rounded-2xl border ${theme === "dark" ? "border-white/10 bg-black" : "border-zinc-200 bg-zinc-50"} ${device === "mobile" ? "w-[390px] max-w-full" : "w-full"}`}>
        <iframe
          key={nonce}
          data-funnel-preview="true"
          src={`/?preview=1&t=${nonce}`}
          title="Prévia da Landing Page"
          onLoad={(e) => {
            const currentDraft = readDraft();
            (e.currentTarget as HTMLIFrameElement).contentWindow?.postMessage(
              { type: "dqa:funnel-draft", draft: currentDraft },
              window.location.origin,
            );
          }}
          className="h-[720px] w-full bg-white"
        />
      </div>
      <p className={`mt-3 text-center text-[10px] font-bold uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>
        Atualiza automaticamente enquanto você edita
      </p>
    </div>
  );
}

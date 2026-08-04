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
  ExternalLink,
  Target,
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "config" | "tracking" | "content">("analytics");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"} p-6`}>
      <div className="mx-auto max-w-[1600px] pt-4">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-8 border-current opacity-90 transition-all">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                theme === "dark" 
                ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" 
                : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 shadow-sm"
              }`}
              title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}
            >
              <Layout className={`h-5 w-5 transition-transform duration-300 ${isSidebarOpen ? "" : "rotate-90"}`} />
            </button>
            <div>
              <h1 className={`text-4xl font-black tracking-tighter uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>Dashboard Premium</h1>
              <p className={`${theme === "dark" ? "text-zinc-500" : "text-zinc-600"} mt-1 font-bold flex items-center gap-2`}>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Gestão do Funil Dono que Anuncia
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={toggleTheme}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                theme === "dark" 
                ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" 
                : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 shadow-sm"
              }`}
              title={theme === "dark" ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => window.open("/", "_blank")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                theme === "dark"
                ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 shadow-sm"
              }`}
            >
              <Layout className="h-4 w-4" />
              Landing Page
            </button>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 shadow-lg shadow-red-600/20"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row items-start">
          <aside className={`w-full shrink-0 lg:w-64 sticky top-6 self-start rounded-2xl border p-4 transition-all duration-500 ease-in-out overflow-hidden ${
            isSidebarOpen ? "opacity-100 translate-x-0" : "lg:w-0 lg:p-0 lg:border-0 opacity-0 -translate-x-10 pointer-events-none"
          } ${
            theme === "dark" 
            ? "border-white/10 bg-zinc-900/50" 
            : "border-zinc-200 bg-white shadow-sm"
          }`}>
            <nav className="flex flex-col gap-1 w-56">
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
                label="Conteúdo do Quiz"
                theme={theme}
              />
              <NavButton 
                active={activeTab === "config"} 
                onClick={() => setActiveTab("config")}
                icon={Settings}
                label="Configurações Funil"
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
          </aside>


          <main className={`flex-1 transition-all duration-500 ease-in-out ${isSidebarOpen ? "" : "w-full"}`}>
            <div className={`surface-card rounded-[2rem] p-8 border transition-all ${
              theme === "dark" 
              ? "border-white/10 bg-zinc-900" 
              : "border-zinc-200 bg-white shadow-xl shadow-zinc-200/50"
            }`}>
              {activeTab === "analytics" && <AnalyticsSection theme={theme} />}
              {activeTab === "config" && <ConfigSection theme={theme} />}
              {activeTab === "tracking" && <TrackingSection theme={theme} />}
              {activeTab === "content" && <ContentSection theme={theme} />}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label, theme }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
          : theme === "dark"
            ? "text-zinc-400 hover:bg-white/5 hover:text-white"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
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
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
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

function ConfigSection({ theme }: { theme: "dark" | "light" }) {
  const [checkoutUrl, setCheckoutUrl] = useState("https://pay.kiwify.com.br/...");

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <h3 className={`text-xl font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>Configurações de Conversão</h3>
      
      <div className="space-y-2">
        <label className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>URL de Checkout</label>
        <input 
          type="text" 
          value={checkoutUrl}
          onChange={(e) => setCheckoutUrl(e.target.value)}
          className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
            theme === "dark"
            ? "border-white/10 bg-black/40 text-white"
            : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
          }`}
        />
      </div>

      <div className="space-y-2 pt-4">
        <label className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>Preço Promocional (Texto)</label>
        <input 
          type="text" 
          placeholder="R$ 197,00"
          className={`w-full rounded-2xl border px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
            theme === "dark"
            ? "border-white/10 bg-black/40 text-white"
            : "border-zinc-200 bg-zinc-50 text-zinc-900 shadow-inner"
          }`}
        />
      </div>

      <button 
        onClick={handleSave}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white hover:opacity-90 shadow-lg shadow-primary/20 uppercase tracking-widest text-sm"
      >
        <Save className="h-4 w-4" />
        Salvar Alterações
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

function ContentSection({ theme }: { theme: "dark" | "light" }) {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className={`text-xl font-black uppercase ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>Conteúdo e Mídia</h3>
          <p className={`text-sm font-medium ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>Gerencie imagens, textos e áudios do quiz.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:opacity-90 shadow-lg shadow-primary/20 uppercase tracking-widest">
          <Plus className="h-4 w-4" /> Nova Etapa
        </button>
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
                  {item.id === 'audio' ? <Music className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
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
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>Imagem/Background</label>
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-20 rounded-lg overflow-hidden border ${theme === "dark" ? "bg-zinc-800 border-white/5" : "bg-zinc-100 border-zinc-200 shadow-inner"}`}>
                     <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=200" className="h-full w-full object-cover" />
                  </div>
                  <button className="text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                    <ImageIcon className="h-3 w-3" /> Alterar Upload
                  </button>
                </div>
              </div>
              {item.id === 'audio' && (
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>Arquivo de Áudio (MP3)</label>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 rounded-lg px-3 py-2 text-[10px] font-mono border ${
                      theme === "dark" ? "bg-zinc-800 text-zinc-400 border-white/5" : "bg-zinc-50 text-zinc-600 border-zinc-200"
                    }`}>testemunho_aluno_01.mp3</div>
                    <button className="text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                      <Music className="h-3 w-3" /> Subir Novo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black uppercase text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90">
        <Save className="h-4 w-4" /> Salvar Alterações de Conteúdo
      </button>
    </div>
  );
}

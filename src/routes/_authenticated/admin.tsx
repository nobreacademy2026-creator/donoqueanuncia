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
      <div className="mx-auto max-w-7xl pt-4">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Dashboard Premium</h1>
            <p className={`${theme === "dark" ? "text-zinc-400" : "text-zinc-500"} mt-1 font-medium`}>Gerencie seu funil Dono que Anuncia</p>
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

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-64">
            <nav className="flex flex-col gap-1">
              <NavButton 
                active={activeTab === "analytics"} 
                onClick={() => setActiveTab("analytics")}
                icon={BarChart3}
                label="Analytics & Métricas"
              />
              <NavButton 
                active={activeTab === "content"} 
                onClick={() => setActiveTab("content")}
                icon={Layout}
                label="Conteúdo do Quiz"
              />
              <NavButton 
                active={activeTab === "config"} 
                onClick={() => setActiveTab("config")}
                icon={Settings}
                label="Configurações Funil"
              />
              <NavButton 
                active={activeTab === "tracking"} 
                onClick={() => setActiveTab("tracking")}
                icon={Code}
                label="Pixels & Tracking"
              />
            </nav>
          </aside>


          <main className="flex-1">
            <div className={`surface-card rounded-[2.5rem] p-8 border transition-all shadow-2xl ${
              theme === "dark" 
              ? "border-white/10 bg-zinc-900 shadow-black/50" 
              : "border-zinc-200 bg-white shadow-zinc-200/50"
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

function NavButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
        active 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
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
        <StatCard label="Acessos Totais" value={stats.access} icon={Users} color="text-blue-500" theme={theme} />
        <StatCard label="Finalizaram Quiz" value={stats.completion} icon={MousePointer2} color="text-green-500" theme={theme} />
        <StatCard label="Cliques Vídeo" value={stats.videoViews} icon={Video} color="text-purple-500" theme={theme} />
        <StatCard label="Cliques Checkout" value={stats.checkout} icon={BarChart3} color="text-red-500" theme={theme} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
              <div className={`surface-card rounded-[2rem] border transition-all p-6 ${
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
                    <span className="text-zinc-400">{item.step}</span>
                    <span className="text-zinc-100">{item.count} <span className="text-zinc-500">({stats.access > 0 ? Math.round(item.count/stats.access * 100) : 0}%)</span></span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
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
          <h3 className="text-lg font-semibold mb-4">Ações do Admin</h3>
          <div className="grid gap-3">
             <button className="flex items-center justify-between rounded-xl bg-zinc-900/50 p-4 text-sm text-zinc-300 border border-white/5 hover:bg-white/5 hover:text-white transition-all">
                <span className="flex items-center gap-3"><ImageIcon className="h-4 w-4" /> Exportar Leads</span>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
             </button>
             <button className="flex items-center justify-between rounded-xl bg-zinc-900/50 p-4 text-sm text-zinc-300 border border-white/5 hover:bg-white/5 hover:text-white transition-all">
                <span className="flex items-center gap-3"><BarChart3 className="h-4 w-4" /> Relatório Completo</span>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
             </button>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold">Leads e Eventos</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Buscar lead ou origem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-64"
              />
            </div>
            
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                <option value="all" className="bg-zinc-900">Todas Etapas</option>
                <option value="intro" className="bg-zinc-900">Intro</option>
                <option value="quiz" className="bg-zinc-900">Quiz</option>
                <option value="vendas" className="bg-zinc-900">Página de Vendas</option>
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

            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Evento</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Detalhes</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{lead.event}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase text-zinc-300">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{lead.source}</td>
                  <td className="px-4 py-3 text-zinc-500 max-w-xs truncate">{lead.details}</td>
                  <td className="px-4 py-3 text-xs flex items-center gap-1 text-zinc-400">
                    <Calendar className="h-3 w-3 text-zinc-500" />
                    {lead.date}
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
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
      <h3 className="text-xl font-semibold">Configurações de Conversão</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">URL de Checkout</label>
        <input 
          type="text" 
          value={checkoutUrl}
          onChange={(e) => setCheckoutUrl(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="space-y-2 pt-4">
        <label className="text-sm font-medium text-muted-foreground">Preço Promocional (Texto)</label>
        <input 
          type="text" 
          placeholder="R$ 197,00"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <button 
        onClick={handleSave}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:opacity-90"
      >
        <Save className="h-4 w-4" />
        SALVAR ALTERAÇÕES
      </button>
    </div>
  );
}

function TrackingSection({ theme }: { theme: "dark" | "light" }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Pixels e Scripts de Rastreamento</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">ID Meta Pixel</label>
        <input 
          type="text" 
          placeholder="Ex: 1234567890"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">ID Google Analytics (G-XXX)</label>
        <input 
          type="text" 
          placeholder="Ex: G-ABC123DEF"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Scripts Adicionais (Head)</label>
        <textarea 
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="<!-- Scripts extras aqui -->"
        />
      </div>

      <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:opacity-90">
        <Save className="h-4 w-4" />
        ATUALIZAR TRACKING
      </button>
    </div>
  );
}

function ContentSection({ theme }: { theme: "dark" | "light" }) {
  const [questions, setQuestions] = useState([
    { id: 'dor', title: 'Na hora de fazer seus anúncios patrocinados...', type: 'pergunta' },
    { id: 'motivacao', title: 'Porque você sente que precisa fazer anúncios?', type: 'pergunta' },
    { id: 'objecao', title: 'Quebra de Objeção (Minions)', type: 'etapa' },
    { id: 'audio', title: 'Depoimento do Aluno (Áudio)', type: 'etapa' },
    { id: 'niche', title: 'Validação de Nicho (Instagram)', type: 'etapa' },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Conteúdo e Mídia</h3>
          <p className="text-sm text-muted-foreground">Gerencie imagens, textos e áudios de cada etapa.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30">
          <Plus className="h-3 w-3" /> NOVA ETAPA
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((item) => (
          <div key={item.id} className="group flex flex-col rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
                  {item.id === 'audio' ? <Music className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{item.title}</h4>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">{item.type} • ID: {item.id}</span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-zinc-500 hover:text-white"><Settings className="h-4 w-4" /></button>
                <button className="p-2 text-red-500/50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 border-t border-white/5 pt-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Imagem/Background</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-20 rounded-lg bg-zinc-800 border border-white/5 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=200" className="h-full w-full object-cover" />
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> Alterar Upload
                  </button>
                </div>
              </div>
              {item.id === 'audio' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Arquivo de Áudio (MP3)</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-[10px] font-mono text-zinc-400">testemunho_aluno_01.mp3</div>
                    <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
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

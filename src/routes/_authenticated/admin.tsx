import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  BarChart3, 
  Users, 
  MousePointer2, 
  Layout,
  Save,
  Code
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "config" | "tracking">("analytics");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-1">Gerencie seu funil Nobre Academy</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.open("/", "_blank")}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <Layout className="h-4 w-4" />
              Ver Landing Page
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
                label="Analytics & Leads"
              />
              <NavButton 
                active={activeTab === "config"} 
                onClick={() => setActiveTab("config")}
                icon={Settings}
                label="Configurações Quiz"
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
            <div className="surface-card rounded-3xl p-8 border-white/5 bg-zinc-900/50 backdrop-blur-sm">
              {activeTab === "analytics" && <AnalyticsSection />}
              {activeTab === "config" && <ConfigSection />}
              {activeTab === "tracking" && <TrackingSection />}
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

function AnalyticsSection() {
  const [stats, setStats] = useState({ access: 0, leads: 0, checkout: 0 });

  useEffect(() => {
    // Mock loading stats - in real app would query analytics_events
    setStats({ access: 1240, leads: 432, checkout: 89 });
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Acessos Totais" value={stats.access} icon={Users} color="text-blue-500" />
        <StatCard label="Leads Gerados" value={stats.leads} icon={MousePointer2} color="text-green-500" />
        <StatCard label="Cliques Checkout" value={stats.checkout} icon={BarChart3} color="text-red-500" />
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">Leads Recentes</h3>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <LeadRow name="João Silva" whatsapp="(11) 99999-9999" email="joao@email.com" date="Há 2 horas" />
              <LeadRow name="Maria Santos" whatsapp="(21) 98888-8888" email="maria@email.com" date="Há 5 horas" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeadRow({ name, whatsapp, email, date }: any) {
  return (
    <tr>
      <td className="px-4 py-3">{name}</td>
      <td className="px-4 py-3">{whatsapp}</td>
      <td className="px-4 py-3">{email}</td>
      <td className="px-4 py-3">{date}</td>
    </tr>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function ConfigSection() {
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

function TrackingSection() {
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

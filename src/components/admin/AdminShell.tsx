import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Code2,
  Gauge,
  LayoutTemplate,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";

export type AdminTab = "overview" | "analytics" | "content" | "sales" | "tracking" | "settings";

type ShellProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void | Promise<void>;
  children: ReactNode;
};

type CheckoutNotification = {
  id: string;
  created_at: string | null;
  session_id: string | null;
  payload: Record<string, unknown> | null;
};

const NAV_ITEMS = [
  { id: "overview" as const, label: "Visão Geral", icon: Gauge },
  { id: "analytics" as const, label: "Analytics e Métricas", icon: BarChart3 },
  { id: "content" as const, label: "Conteúdo do Funil", icon: LayoutTemplate },
  { id: "sales" as const, label: "Página de Vendas", icon: ShoppingBag },
  { id: "tracking" as const, label: "Pixels e Tracking", icon: Code2 },
  { id: "settings" as const, label: "Configurações", icon: Settings },
];

const PAGE_COPY: Record<AdminTab, { title: string; description: string }> = {
  overview: {
    title: "Visão Geral",
    description: "Resumo do desempenho e da operação do seu funil.",
  },
  analytics: {
    title: "Analytics e Métricas",
    description: "Acompanhe o desempenho e a conversão do seu funil em tempo real.",
  },
  content: {
    title: "Conteúdo do Funil",
    description: "Edite textos, imagens, áudios e etapas da experiência.",
  },
  sales: {
    title: "Página de Vendas",
    description: "Gerencie sua oferta, preços, vídeo e destino de checkout.",
  },
  tracking: {
    title: "Pixels e Tracking",
    description: "Centralize as integrações de mensuração e atribuição.",
  },
  settings: {
    title: "Configurações",
    description: "Preferências e acessos do ambiente administrativo.",
  },
};

export function AdminShell({ activeTab, onTabChange, onLogout, children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CheckoutNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const page = PAGE_COPY[activeTab];
  const initials = useMemo(() => "DA", []);

  const selectTab = (tab: AdminTab) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  useEffect(() => {
    let active = true;

    void supabase
      .from("analytics_events")
      .select("id,created_at,session_id,payload")
      .eq("event_name", "checkout_iniciado")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("[Admin] Falha ao carregar notificacoes de checkout", error);
          return;
        }
        setNotifications((data ?? []) as CheckoutNotification[]);
      });

    const channel = supabase
      .channel("admin-checkout-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics_events",
          filter: "event_name=eq.checkout_iniciado",
        },
        ({ new: inserted }) => {
          const notification = inserted as CheckoutNotification & { event_name?: string };
          if (notification.event_name !== "checkout_iniciado") return;
          setNotifications((current) => [notification, ...current].slice(0, 10));
          setUnreadNotifications((current) => current + 1);
          toast.success("Novo clique no checkout", {
            description: "Uma pessoa acabou de clicar no botao de compra.",
          });
        },
      )
      .subscribe((status, error) => {
        if (error)
          console.error("[Admin] Notificacoes em tempo real indisponiveis", { status, error });
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const toggleNotifications = () => {
    setNotificationsOpen((open) => !open);
    setProfileOpen(false);
    setUnreadNotifications(0);
  };

  const sidebar = (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-white/[0.06] px-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-600 text-sm font-black text-white shadow-[0_8px_24px_rgba(220,38,38,.24)]">
          D
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold tracking-tight text-white">
              Dono que Anuncia
            </p>
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">Painel Administrativo</p>
          </div>
        )}
      </div>

      <nav
        className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5"
        aria-label="Navegação principal"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              onClick={() => selectTab(item.id)}
              className={`admin-nav-item ${active ? "is-active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={() => void onLogout()}
          className={`admin-nav-item text-zinc-500 hover:text-red-400 ${collapsed ? "justify-center px-0" : ""}`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sair do painel</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-shell min-h-screen bg-[#08090b] text-zinc-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/[0.06] bg-[#0d0e11] transition-[width] duration-300 lg:flex lg:flex-col ${collapsed ? "w-[76px]" : "w-[244px]"}`}
      >
        {sidebar}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-24 grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-[#17181d] text-zinc-500 shadow-lg transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          />
          <aside className="relative flex h-full w-[min(86vw,300px)] flex-col border-r border-white/10 bg-[#0d0e11] shadow-2xl">
            {sidebar}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-5 grid h-10 w-10 place-items-center rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white"
              aria-label="Fechar menu lateral"
            >
              <X className="h-5 w-5" />
            </button>
          </aside>
        </div>
      )}

      <div
        className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[244px]"}`}
      >
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-white/[0.06] bg-[#08090b]/90 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="admin-icon-button lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
                {page.title}
              </h1>
              <p className="hidden truncate text-sm text-zinc-500 sm:block">{page.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-emerald-500/[0.08] px-3 py-1.5 text-xs font-medium text-emerald-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              Sistema online
            </span>
            <div className="relative">
              <button
                type="button"
                className="admin-icon-button relative"
                aria-label="Notificações"
                aria-expanded={notificationsOpen}
                onClick={toggleNotifications}
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-[#08090b]">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(90vw,360px)] overflow-hidden rounded-2xl border border-white/10 bg-[#15161a] shadow-2xl">
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <strong className="block text-sm text-white">Notificações</strong>
                    <span className="text-xs text-zinc-500">Cliques recentes no checkout</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <p className="px-3 py-8 text-center text-sm text-zinc-500">
                        Nenhum clique no checkout registrado ainda.
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.04]"
                        >
                          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                            <ShoppingBag className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <strong className="block text-sm font-medium text-zinc-100">
                              Clique no botão de checkout
                            </strong>
                            <small className="mt-1 block text-xs text-zinc-500">
                              {notification.created_at
                                ? new Date(notification.created_at).toLocaleString("pt-BR")
                                : "Agora"}
                            </small>
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      selectTab("analytics");
                      setNotificationsOpen(false);
                    }}
                    className="w-full border-t border-white/[0.06] px-4 py-3 text-center text-xs font-semibold text-red-400 transition hover:bg-white/[0.03]"
                  >
                    Ver todos os eventos
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setProfileOpen((value) => !value)}
                className="flex h-11 items-center gap-2 rounded-xl px-1.5 transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-red-700 text-[11px] font-bold text-white">
                  {initials}
                </span>
                <span className="hidden text-left xl:block">
                  <strong className="block text-xs font-semibold text-white">Administrador</strong>
                  <small className="block text-[10px] text-zinc-500">Acesso completo</small>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-zinc-600 xl:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-xl border border-white/10 bg-[#15161a] p-2 shadow-2xl">
                  <button onClick={() => selectTab("settings")} className="admin-dropdown-item">
                    <Settings />
                    Configurações
                  </button>
                  <button
                    onClick={() => void onLogout()}
                    className="admin-dropdown-item text-red-400"
                  >
                    <LogOut />
                    Encerrar sessão
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1560px] p-4 sm:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Erro ao entrar: " + error.message);
    } else {
      toast.success("Bem-vindo de volta!");
      // TanStack router will handle the redirect if handled via state or search params
      window.location.href = "/admin";
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="w-full max-w-[360px] space-y-8 rounded-[40px] bg-black p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight text-white">Admin Nobre</h2>
          <p className="mt-1 text-xs font-medium text-white/50 uppercase tracking-[0.2em]">Painel de Controle</p>
        </div>
        <form onSubmit={handleLogin} className="mt-10 space-y-6">
          <div className="space-y-1.5">
            <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-[#ff0000]/80">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-none border-none bg-white px-6 py-4 text-sm text-black transition-all placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white/20"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-[#ff0000]/80">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-none border-none bg-white px-6 py-4 text-sm text-black transition-all placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white/20"
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-full bg-[#ff0000] py-4.5 text-[11px] font-black tracking-[0.2em] text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "ENTRANDO..." : "ENTRAR NO PAINEL"}
          </button>
        </form>
      </div>
    </div>
  );
}

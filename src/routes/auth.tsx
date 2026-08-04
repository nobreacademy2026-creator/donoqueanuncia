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
      <div className="w-full max-w-[380px] space-y-6 rounded-[32px] bg-black p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">Admin Nobre</h2>
          <p className="mt-1 text-sm font-medium text-white/70">Entre para gerenciar seu funil</p>
        </div>
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-bold uppercase tracking-wider text-[#ff0000]">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-none bg-white px-5 py-3.5 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff0000]/50"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-bold uppercase tracking-wider text-[#ff0000]">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-none bg-white px-5 py-3.5 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff0000]/50"
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-[#ff0000] py-4 text-sm font-black tracking-widest text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "ENTRANDO..." : "ENTRAR NO PAINEL"}
          </button>
        </form>
      </div>
    </div>
  );
}

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
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/5 bg-zinc-900/50 p-10 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Admin Nobre</h2>
          <p className="mt-2 text-muted-foreground">Entre para gerenciar seu funil</p>
        </div>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "ENTRAR NO PAINEL"}
          </button>
        </form>
      </div>
    </div>
  );
}

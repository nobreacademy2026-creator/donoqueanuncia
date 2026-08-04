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
    <div className="flex min-h-screen items-center justify-center bg-[#808080] px-5">
      <div className="w-full max-w-md space-y-8 rounded-[40px] bg-[#919191] p-10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white drop-shadow-sm">Admin Nobre</h2>
          <p className="mt-2 text-lg font-medium text-white/90">Entre para gerenciar seu funil</p>
        </div>
        <form onSubmit={handleLogin} className="mt-10 space-y-6">
          <div className="space-y-2">
            <label className="ml-1 text-base font-bold text-zinc-800">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[20px] border-none bg-[#757575] px-6 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-base font-bold text-zinc-800">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[20px] border-none bg-[#757575] px-6 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-[25px] bg-[#e60012] py-5 text-lg font-black tracking-wider text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "ENTRANDO..." : "ENTRAR NO PAINEL"}
          </button>
        </form>
      </div>
    </div>
  );
}

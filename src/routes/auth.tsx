import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkAdminRole } from "@/lib/auth.functions";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const data = await checkAdminRole();
          if (data && data.hasAdmin) {
            window.location.replace("/admin");
            return;
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Cadastro realizado! Verifique seu e-mail.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error("E-mail ou senha incorretos.");
        } else {
          const data = await checkAdminRole();
          if (!data || !data.hasAdmin) {
            toast.error("Acesso negado: Você não é um administrador.");
            await supabase.auth.signOut();
          } else {
            toast.success("Bem-vindo!");
            setTimeout(() => window.location.replace("/admin"), 100);
          }
        }
      }
    } catch (err) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="w-full max-w-[360px] space-y-8 bg-black p-10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">Admin Nobre</h2>
          <p className="mt-1 text-[10px] font-medium text-white/50 uppercase tracking-widest">
            {isSignUp ? "Criar Conta" : "Painel de Controle"}
          </p>
        </div>
        <form onSubmit={handleAuth} className="mt-10 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-red-500">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white px-6 py-4 text-sm text-black focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-red-500">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white px-6 py-4 text-sm text-black focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-red-600 py-4.5 text-[11px] font-black tracking-widest text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "PROCESSANDO..." : isSignUp ? "CRIAR CONTA" : "ENTRAR NO PAINEL"}
          </button>
          
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white"
          >
            {isSignUp ? "Já tenho conta? Entrar" : "Não tem conta? Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

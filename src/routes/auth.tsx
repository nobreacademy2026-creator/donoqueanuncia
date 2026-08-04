import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);

  // Verificação automática de sessão ao carregar a página
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Sessão detectada, verificando admin...");
          const { data: roleData, error } = await supabase
            .from("user_roles" as any)
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .maybeSingle();

          if (error) {
            console.error("Erro ao verificar papel de admin no checkSession:", error);
            setCheckingSession(false);
            return;
          }

          if (roleData) {
            console.log("Admin confirmado, redirecionando...");
            window.location.href = "/admin";
            return;
          } else {
            console.log("Usuário logado mas não é admin.");
          }
        }
      } catch (err) {
        console.error("Erro na verificação de sessão:", err);
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Password should be")) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
          } else if (error.message.includes("User already registered")) {
            toast.error("Este e-mail já está cadastrado.");
          } else {
            toast.error("Erro ao cadastrar: " + error.message);
          }
        } else {
          toast.success("Cadastro realizado com sucesso! Você já pode entrar.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Erro de login:", error);
          if (error.message.includes("Invalid login credentials")) {
            toast.error("E-mail ou senha incorretos.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Por favor, confirme seu e-mail antes de entrar.");
          } else if (error.message.includes("Failed to fetch")) {
            toast.error("Erro de conexão. Verifique sua internet.");
          } else {
            toast.error(`Erro (${error.status || '?' }): ${error.message}`);
          }
        } else {
          // Após login bem-sucedido, verificar se o usuário tem o papel de admin antes de redirecionar
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: roleData, error: roleError } = await supabase
              .from("user_roles" as any)
              .select("role")
              .eq("user_id", user.id)
              .eq("role", "admin")
              .maybeSingle();

            if (roleError) {
              console.error("Erro ao verificar permissão:", roleError);
              toast.error("Erro técnico ao verificar suas permissões.");
              setLoading(false);
              return;
            }

            if (!roleData) {
              toast.error("Acesso negado: Você não tem permissão de administrador.");
              await supabase.auth.signOut();
              setLoading(false);
              return;
            }

            toast.success("Bem-vindo, Administrador!");
            setTimeout(() => {
              window.location.href = "/admin";
            }, 500);
          }
        }


      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
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
      <div className="w-full max-w-[360px] space-y-8 rounded-none bg-black p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight text-white">Admin Nobre</h2>
          <p className="mt-1 text-xs font-medium text-white/50 uppercase tracking-[0.2em]">
            {isSignUp ? "Criar Conta" : "Painel de Controle"}
          </p>
        </div>
        <form onSubmit={handleAuth} className="mt-10 space-y-6">
          <div className="space-y-1.5">
            <label className="ml-0 text-[10px] font-black uppercase tracking-widest text-[#ff0000]/80">E-mail</label>
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
            <label className="ml-0 text-[10px] font-black uppercase tracking-widest text-[#ff0000]/80">Senha</label>
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
            className="w-full rounded-none bg-[#ff0000] py-4.5 text-[11px] font-black tracking-[0.2em] text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "PROCESSANDO..." : isSignUp ? "CRIAR CONTA" : "ENTRAR NO PAINEL"}
          </button>
          
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors"
          >
            {isSignUp ? "Já tenho conta? Entrar" : "Não tem conta? Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

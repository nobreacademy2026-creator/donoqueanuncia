import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logoAsset from "@/assets/logo-dono-que-anuncia.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { checkCurrentUserAdmin } from "@/lib/auth-client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

type AuthMode = "login" | "signup" | "forgot" | "reset";

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("user already registered")) return "Este e-mail já possui uma conta.";
  if (normalized.includes("password should be"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (normalized.includes("rate limit"))
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  return message || "Não foi possível concluir a solicitação.";
}

function AuthPage() {
  const [mode, setMode] = useState<AuthMode>(() => {
    if (typeof window === "undefined") return "login";
    return new URLSearchParams(window.location.search).get("mode") === "reset" ? "reset" : "login";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;

        const wantsReset = new URLSearchParams(window.location.search).get("mode") === "reset";
        if (wantsReset) {
          setMode("reset");
          setRecoveryReady(Boolean(data.session));
          return;
        }

        if (data.session) {
          const role = await checkCurrentUserAdmin();
          if (role?.hasAdmin) {
            window.location.replace("/admin");
            return;
          }
        }
      } catch (error) {
        console.error("[Auth] Falha ao verificar sessão", error);
      } finally {
        if (active) setCheckingSession(false);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setRecoveryReady(Boolean(session));
        setCheckingSession(false);
      }
    });

    void checkSession();
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const goToMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormError("");
    setPassword("");
    setConfirmPassword("");
    if (nextMode !== "reset") window.history.replaceState({}, "", "/auth");
  };

  const handleLoginOrSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Cadastro realizado. Verifique seu e-mail para confirmar a conta.");
        goToMode("login");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      const role = await checkCurrentUserAdmin();
      if (!role?.hasAdmin) {
        await supabase.auth.signOut();
        const accessError = role?.error
          ? `Login aceito, mas não foi possível validar o acesso: ${role.error}`
          : "Login aceito, mas esta conta não possui permissão de administrador.";
        setFormError(accessError);
        toast.error(accessError);
        return;
      }

      toast.success("Acesso autorizado.");
      window.location.replace("/admin");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      const friendlyMessage = getAuthErrorMessage(message);
      setFormError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth?mode=reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      toast.success("Enviamos o link de recuperação. Verifique sua caixa de entrada e o spam.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      const friendlyMessage = getAuthErrorMessage(message);
      setFormError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (password.length < 6) {
      toast.error("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Este link expirou ou já foi utilizado. Solicite um novo link.");
        setRecoveryReady(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Senha alterada com sucesso. Entre usando a nova senha.");
      goToMode("login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      const friendlyMessage = getAuthErrorMessage(message);
      setFormError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-950">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-red-500" />
      </div>
    );
  }

  const titles: Record<AuthMode, { title: string; subtitle: string }> = {
    login: { title: "Acessar o painel", subtitle: "Entre com sua conta de administrador" },
    signup: { title: "Criar conta", subtitle: "Cadastre seus dados de acesso" },
    forgot: { title: "Recuperar senha", subtitle: "Receba um link seguro por e-mail" },
    reset: { title: "Definir nova senha", subtitle: "Escolha uma nova senha para sua conta" },
  };

  const passwordField = (label: string, value: string, onChange: (value: string) => void) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-11 pr-12 text-sm text-zinc-950 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          placeholder="Mínimo de 6 caracteres"
        />
        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-950 px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_38%)]" />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/40">
        <div className="border-b border-zinc-100 px-8 pb-7 pt-8 text-center sm:px-10">
          <img
            src={logoAsset.url}
            alt="Dono que Anuncia"
            className="mx-auto h-20 w-auto object-contain"
          />
          <div className="mt-5 flex items-center justify-center gap-2 text-red-600">
            {mode === "forgot" || mode === "reset" ? <KeyRound className="h-5 w-5" /> : null}
            <h1 className="text-2xl font-black tracking-tight text-zinc-950">
              {titles[mode].title}
            </h1>
          </div>
          <p className="mt-2 text-sm text-zinc-500">{titles[mode].subtitle}</p>
        </div>

        <div className="p-8 sm:p-10">
          {formError && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-relaxed text-red-700"
            >
              {formError}
            </div>
          )}
          {mode === "reset" && !recoveryReady ? (
            <div className="space-y-5 text-center">
              <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                O link de recuperação é inválido ou expirou.
              </p>
              <button onClick={() => goToMode("forgot")} className="admin-button-primary w-full">
                Solicitar novo link
              </button>
            </div>
          ) : mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <EmailField email={email} setEmail={setEmail} />
              <SubmitButton loading={loading} label="Enviar link de recuperação" />
            </form>
          ) : mode === "reset" ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {passwordField("Nova senha", password, setPassword)}
              {passwordField("Confirmar nova senha", confirmPassword, setConfirmPassword)}
              <SubmitButton loading={loading} label="Salvar nova senha" />
            </form>
          ) : (
            <form onSubmit={handleLoginOrSignup} className="space-y-5">
              <EmailField email={email} setEmail={setEmail} />
              {passwordField("Senha", password, setPassword)}
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => goToMode("forgot")}
                  className="block w-full text-right text-xs font-bold text-red-600 hover:text-red-700"
                >
                  Esqueci minha senha
                </button>
              )}
              <SubmitButton
                loading={loading}
                label={mode === "signup" ? "Criar conta" : "Entrar no painel"}
              />
            </form>
          )}

          {mode !== "reset" && (
            <button
              type="button"
              onClick={() => goToMode(mode === "login" ? "signup" : "login")}
              className="mt-6 flex w-full items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-950"
            >
              {mode !== "login" && <ArrowLeft className="h-4 w-4" />}
              {mode === "login" ? "Ainda não tenho conta" : "Voltar para o login"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function EmailField({ email, setEmail }: { email: string; setEmail: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
        E-mail
      </label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-11 pr-4 text-sm text-zinc-950 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          placeholder="seu@email.com"
        />
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-2xl bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
    >
      {loading ? "Processando..." : label}
    </button>
  );
}

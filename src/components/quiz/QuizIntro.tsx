import { ArrowRight, ShieldCheck, Timer, Sparkles } from "lucide-react";

export function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-rise-in mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Sparkles className="h-3.5 w-3.5 text-primary" /> Nobre Academy
      </span>
      <h1 className="mt-6 text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
        Descubra em apenas 2 minutos por que seus anúncios{" "}
        <span className="text-gradient-primary">não estão trazendo clientes.</span>
      </h1>
      <p className="mt-5 text-base text-muted-foreground sm:text-lg">
        Responda algumas perguntas e receba um diagnóstico personalizado do seu negócio.
      </p>
      <button
        onClick={onStart}
        className="gradient-primary glow-primary mt-9 inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.03]"
      >
        Começar Diagnóstico <ArrowRight className="h-5 w-5" />
      </button>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" /> 7 perguntas rápidas
        </span>
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> 100% gratuito
        </span>
      </div>
    </div>
  );
}
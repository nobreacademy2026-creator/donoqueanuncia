import { ArrowRight, ShieldCheck, BarChart3, Target } from "lucide-react";
import logoAsset from "@/assets/logo-dono-que-anuncia.png.asset.json";

export function QuizIntro({ onStart, draft }: { onStart: () => void; draft?: any }) {
  const title = draft?.title || "DESCUBRA POR QUE SEUS ANÚNCIOS NÃO TRAZEM CLIENTES.";
  const description =
    draft?.description ||
    "Responda o diagnóstico gratuito de 2 minutos e receba o plano personalizado para o seu negócio.";
  const logo = logoAsset.url;

  return (
    <div className="animate-rise-in mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
      {/* Logo Section */}
      <div className="mb-6 flex flex-col items-center">
        <img
          src={draft?.image || logo}
          alt="Dono que Anuncia"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.05)] sm:h-44 transition-transform duration-500"
        />
      </div>

      {/* Hero Content */}
      <div className="space-y-6">
        <h1 className="text-5xl leading-[1.05] font-black tracking-tight sm:text-7xl text-zinc-950 uppercase max-w-2xl mx-auto flex flex-col gap-2">
          {title.includes("NÃO TRAZEM CLIENTES") ? (
            <>
              <span>{title.split("NÃO TRAZEM CLIENTES")[0]}</span>
              <span className="text-red-600 block">NÃO TRAZEM CLIENTES.</span>
            </>
          ) : (
            <span>{title}</span>
          )}
        </h1>

        <div className="flex flex-col items-center gap-6">
          <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-sm">
            <BarChart3 className="h-5 w-5 text-zinc-600" />
          </div>

          <p className="mx-auto max-w-lg text-lg text-zinc-950 font-medium sm:text-xl leading-relaxed px-4">
            {description.split("personalizado").map((part: string, i: number) => (
              <span key={i}>
                {part}
                {i === 0 && description.includes("personalizado") && (
                  <strong className="text-red-600 font-bold">personalizado</strong>
                )}
              </span>
            ))}
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-center gap-6 pt-2">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-red-600 px-8 py-3.5 text-base font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-red-600/20 uppercase tracking-tight w-full sm:w-auto min-w-[280px]"
          >
            <Target className="h-4 w-4 text-white animate-pulse" />
            <span className="relative z-10">Começar Diagnóstico</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
            <div className="absolute inset-0 bg-red-600"></div>
          </button>

          <div className="flex items-center gap-4 w-full max-w-xs">
            <div className="h-px flex-1 bg-zinc-200"></div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-900 uppercase tracking-[0.2em] whitespace-nowrap">
              <ShieldCheck className="h-3 w-3 text-green-600" /> 100% online e seguro
            </div>
            <div className="h-px flex-1 bg-zinc-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

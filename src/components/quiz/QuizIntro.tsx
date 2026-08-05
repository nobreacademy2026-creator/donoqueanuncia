import { ArrowRight, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/logo-dono-que-anuncia.png.asset.json";

export function QuizIntro({ onStart, draft }: { onStart: () => void; draft?: any }) {
  const title = draft?.title || "Descubra por que seus anúncios não trazem clientes.";
  const logo = draft?.image || logoAsset.url;

  return (
    <div className="animate-rise-in mx-auto flex max-w-2xl flex-col items-center justify-center text-center py-10">
      <div className="mb-2 flex flex-col items-center relative">
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent blur-3xl -z-10 h-full w-full transform scale-150 opacity-50"></div>
        {logo ? (
          <img 
            key={logo}
            src={logo} 
            alt="Dono que Anuncia" 
            className="h-32 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] sm:h-48 transition-transform hover:scale-105 duration-500"
          />
        ) : (
          <div className="h-32 sm:h-48" /> // Espaçador caso não tenha logo
        )}
      </div>

      <div className="space-y-6">
        <h1 className="text-4xl leading-tight font-black tracking-tight sm:text-6xl text-zinc-950 uppercase">
          {title.split('não trazem clientes').map((part: string, i: number) => (
            <span key={i}>
              {part}
              {i === 0 && title.includes('não trazem clientes') && (
                <span className="text-red-600 block">não trazem clientes.</span>
              )}
            </span>
          ))}
        </h1>
        
        <p className="mx-auto max-w-lg text-lg text-zinc-600 font-medium sm:text-xl leading-relaxed">
          Responda o diagnóstico gratuito de 2 minutos e receba o plano personalizado para o seu negócio.
        </p>

        <div className="flex flex-col items-center gap-6 pt-4">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-zinc-950 px-8 py-4 text-base font-bold text-white transition-all hover:bg-zinc-900 hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-zinc-900/10 uppercase tracking-wide"
          >
            Começar Diagnóstico 
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
          </button>

          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-green-500" /> 100% online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

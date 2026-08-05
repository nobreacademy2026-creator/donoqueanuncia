import { ArrowRight, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/logo-dono-que-anuncia.png.asset.json";

export function QuizIntro({ onStart, draft }: { onStart: () => void; draft?: any }) {
  const title = draft?.title || "Descubra por que seus anúncios não trazem clientes.";
  const logo = draft?.image || logoAsset.url;

  return (
    <div className="animate-rise-in mx-auto flex max-w-2xl flex-col items-center justify-center text-center py-10">
      <div className="mb-6 flex flex-col items-center relative">
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent blur-3xl -z-10 h-full w-full transform scale-150 opacity-50"></div>
        <img 
          key={logo}
          src={logo} 

          alt="Dono que Anuncia" 
          className="h-32 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] sm:h-48 transition-transform hover:scale-105 duration-500"
        />
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
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-zinc-900 px-10 py-5 text-lg font-black text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-zinc-900/20 uppercase tracking-wide"
          >
            Começar Diagnóstico 
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
          </button>

          <div className="flex items-center gap-6 text-sm font-bold text-zinc-400 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" /> 100% online
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
            <span>Acesso Imediato</span>
          </div>
        </div>
      </div>
    </div>
  );
}

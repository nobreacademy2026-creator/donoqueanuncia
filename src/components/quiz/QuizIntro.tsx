import { ArrowRight, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/logo-dono-que-anuncia.png.asset.json";

export function QuizIntro({ onStart, draft }: { onStart: () => void; draft?: any }) {
  const title = draft?.title || "DESCUBRA POR QUE SEUS ANÚNCIOS NÃO TRAZEM CLIENTES.";
  const description = draft?.description || "Responda o diagnóstico gratuito de 2 minutos e receba o plano personalizado para o seu negócio.";
  const logo = logoAsset.url; // Force the logo as requested

  return (
    <div className="animate-rise-in mx-auto flex max-w-2xl flex-col items-center justify-center text-center py-10">
      <div className="mb-8 flex flex-col items-center relative">
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent blur-3xl -z-10 h-full w-full transform scale-150 opacity-50"></div>
        <img 
          src={logo} 
          alt="Dono que Anuncia" 
          className="h-32 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] sm:h-48 transition-transform hover:scale-105 duration-500"
        />
      </div>

      <div className="space-y-8">
        <h1 className="text-4xl leading-[1.1] font-black tracking-tight sm:text-6xl text-zinc-950 uppercase max-w-xl mx-auto">
          {title.includes('NÃO TRAZEM CLIENTES') ? (
            <>
              {title.split('NÃO TRAZEM CLIENTES')[0]}
              <span className="text-red-600 block mt-2">NÃO TRAZEM CLIENTES.</span>
            </>
          ) : title}
        </h1>
        
        <div className="w-12 h-1.5 bg-zinc-950 mx-auto rounded-full opacity-10"></div>

        <p className="mx-auto max-w-lg text-lg text-zinc-600 font-medium sm:text-xl leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col items-center gap-6 pt-6">
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

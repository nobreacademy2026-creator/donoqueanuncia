import React, { useEffect, useState } from "react";
import { Check, Loader2, ShieldCheck, Target, Zap } from "lucide-react";

const STEPS = [
  { icon: Target, text: "Cruzando respostas com nicho..." },
  { icon: Zap, text: "Avaliando faturamento potencial..." },
  { icon: ShieldCheck, text: "Validando escala de anúncios..." },
];

export function AnalyzingStep({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => {
        if (prev + 1 >= STEPS.length) {
          clearInterval(timer);
          setTimeout(onDone, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [onDone]);

  return (
    <div className="animate-rise-in mx-auto w-full max-w-xl py-12">
      <div className="text-center mb-12">
        <div className="relative mx-auto mb-8 h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-red-500/10" />
          <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-red-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-4xl font-black text-zinc-900 uppercase tracking-tight mb-4">
          Analisando dados
        </h2>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">
          Por favor, aguarde alguns segundos...
        </p>
      </div>


      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-100">
          <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Processamento 100% seguro
        </div>
      </div>
    </div>
  );
}

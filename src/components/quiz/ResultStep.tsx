import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

type Props = {
  score: number;
  pillars: { pilar: string; valor: number }[];
};

export function ResultStep({ score, pillars }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setDisplay(current);
      if (current >= score) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [score]);

  const circumference = 2 * Math.PI * 54;

  return (
    <div className="animate-rise-in mx-auto w-full max-w-2xl">
      <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Seu resultado</h2>

      <div className="surface-card mt-8 rounded-3xl p-8 text-center bg-zinc-50 border-zinc-100 shadow-sm">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Nível atual</p>
        <div className="relative mx-auto mt-5 h-32 w-32">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--secondary)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * display) / 100}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-3xl font-bold">{display}%</span>
        </div>

        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
          Seu maior problema <strong className="text-foreground">não é o orçamento</strong> dos seus
          anúncios — é a <strong className="text-foreground">estratégia</strong> por trás deles. Pequenas
          mudanças no criativo, na segmentação e na oferta podem aumentar significativamente seus
          resultados sem investir um real a mais.
        </p>
      </div>


      {/* Flow 3 — Quebra de Objeção Content */}
      <div className="mt-12 space-y-8 text-center">
        <div className="mx-auto aspect-[16/9] w-full max-w-md overflow-hidden rounded-3xl bg-zinc-100 border border-zinc-200 shadow-inner">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" 
            alt="Transição estratégica"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold leading-tight">
            Vão te oferecer milhares de “fórmulas mágicas”, mas o que realmente vai{" "}
            <span className="text-primary underline decoration-primary/30">destravar suas vendas</span> é:
          </h3>
          
          <ul className="grid gap-3 text-left max-w-lg mx-auto mt-6">
            {[
              "Fazer anúncios do jeito certo (mesmo começando do zero)",
              "Aparecer todos os dias para pessoas da sua cidade",
              "Saber exatamente o que fazer quando o anúncio não vende",
              "Atrair clientes prontos para comprar.",
              "Usar uma estrutura validada, que investe pouco e te faz vender todos os dias.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-base font-medium">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import minionsAsset from "@/assets/minions-blah.png.asset.json";

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




      {/* Quebra de Objeção Content */}
      <div className="mt-12 space-y-8 text-center bg-white rounded-3xl p-4 sm:p-8">
        <div className="mx-auto aspect-[1.8/1] w-full overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200 shadow-sm">
          <img 
            src={minionsAsset.url} 
            alt="Blah Blah Blah"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold leading-tight text-zinc-900">
            Vão te oferecer milhares de “fórmulas mágicas”, mas o que realmente vai{" "}
            <span className="text-red-600 block sm:inline">destravar suas vendas</span> é:
          </h3>
          
          <ul className="grid gap-4 text-left max-w-lg mx-auto mt-8">
            {[
              { text: "Fazer anúncios do jeito certo (mesmo começando do zero)", bold: ["anúncios do jeito certo"] },
              { text: "Aparecer todos os dias para pessoas da sua cidade", bold: [] },
              { text: "Saber exatamente o que fazer quando o anúncio não vende", bold: [] },
              { text: "Atrair clientes prontos para comprar.", bold: ["Atrair clientes"] },
              { text: "Usar uma estrutura validada, que investe pouco e te faz vender todos os dias.", bold: ["vender todos os dias."] },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-base font-medium text-zinc-900">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <span>
                  {item.bold.length > 0 ? (
                    item.text.split(new RegExp(`(${item.bold.join('|')})`, 'g')).map((part, idx) => 
                      item.bold.includes(part) ? <strong key={idx}>{part}</strong> : part
                    )
                  ) : item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

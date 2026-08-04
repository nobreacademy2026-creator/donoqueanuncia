import { CheckCircle2 } from "lucide-react";
import minionsAsset from "@/assets/minions-blah.png.asset.json";

export function ResultStep() {
  return (
    <div className="animate-rise-in mx-auto w-full max-w-2xl">
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

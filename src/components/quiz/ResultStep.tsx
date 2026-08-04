import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function ResultStep({ onNext }: { onNext: () => void }) {
  const [subStage, setSubStage] = useState<"objection" | "solution">("objection");

  if (subStage === "solution") {
    return (
      <div className="animate-rise-in mx-auto w-full max-w-2xl">
        <div className="mt-4 space-y-8 text-center bg-white rounded-3xl p-4 sm:p-8">
          <div className="mx-auto aspect-[1.8/1] w-full overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200 shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" 
              alt="Fictitious strategy"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 text-left max-w-lg mx-auto bg-green-50/50 p-6 rounded-2xl border border-green-100">
              {[
                { text: "Passo a passo para criar anúncios no gerenciador e no turbinar do jeito certo.", bold: ["anúncios no gerenciador e no turbinar"] },
                { text: "Como fazer anúncios pelo celular e computador de um jeito simples.", bold: ["celular", "computador"] },
                { text: "Estruturas validadas para atrair novos clientes todos os dias.", bold: ["Estruturas validadas"] },
                { text: "Aulas práticas e objetivas.", bold: ["Aulas práticas e objetivas."] },
                { text: "Como lotar seu Whatsapp de clientes.", bold: ["lotar seu Whatsapp"] },
                { text: "Como ganhar seguidores qualificados.", bold: ["seguidores qualificados."] },
                { text: "Como vender pelo seu site.", bold: ["vender"] },
                { text: "Ferramentas para aumentar o faturamento e organizar seu negócio.", bold: ["Ferramentas"] },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm sm:text-base font-medium text-zinc-900 list-none">
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
              <p className="mt-4 text-zinc-700 font-medium">
                Tudo pensado para você <strong>impulsionar as vendas</strong> do seu negócio usando a Internet.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={onNext}
                className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-2xl px-12 py-5 text-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/20 uppercase"
              >
                É disso que eu preciso
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise-in mx-auto w-full max-w-2xl">
      <div className="mt-4 space-y-8 text-center bg-white rounded-3xl p-4 sm:p-8">
        <div className="mx-auto aspect-[1.8/1] w-full overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200 shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=800" 
            alt="Fictitious representative"
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

          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setSubStage("solution")}
              className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-2xl px-12 py-5 text-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/20"
            >
              Vou dominar isso agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

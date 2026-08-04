import { CheckCircle2, Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

export function ResultStep({ onNext }: { onNext: () => void }) {
  const [subStage, setSubStage] = useState<"objection" | "solution" | "testimonial" | "niche">("objection");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (subStage === "testimonial") {
    return (
      <div className="animate-rise-in mx-auto w-full max-w-2xl">
        <div className="mt-4 space-y-8 text-center bg-white rounded-3xl p-4 sm:p-8">
          <h3 className="text-2xl font-extrabold text-red-600 sm:text-3xl">
            Clique no áudio e escute o que meu aluno disse 😲
          </h3>

          <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-zinc-100 bg-[#f0f2f5] p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm cursor-pointer" onClick={toggleAudio}>
                {isPlaying ? <Pause className="h-6 w-6 text-zinc-600 fill-zinc-600" /> : <Play className="h-6 w-6 text-zinc-600 fill-zinc-600 ml-1" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-8 w-full bg-zinc-200 rounded-sm relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-around px-2">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="w-1 bg-zinc-400 rounded-full" style={{ height: `${20 + Math.random() * 60}%` }}></div>
                    ))}
                  </div>
                  {isPlaying && (
                    <div className="absolute inset-0 bg-blue-400/30 animate-pulse transition-all" style={{ width: '40%' }}></div>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-medium px-1">
                  <span>00:00</span>
                  <div className="flex items-center gap-1">
                     <div className="h-3 w-3 bg-blue-400 rounded-full flex items-center justify-center">
                        <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                     </div>
                  </div>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-zinc-300 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Student" />
              </div>
            </div>
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" className="hidden" />
          </div>

          <div className="space-y-6">
            <p className="text-lg font-bold text-red-600 sm:text-xl leading-snug">
              De R$ 10 mil para mais de R$ 100 mil por mês, o método <span className="bg-black text-white px-2 py-0.5 rounded">DONO QUE ANUNCIA</span> funciona e o próximo pode ser VOCÊ.
            </p>

            <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md">
              <div className="flex items-center gap-3 p-4 border-b border-zinc-100">
                <div className="h-12 w-12 rounded-full ring-2 ring-pink-500 p-0.5">
                  <div className="h-full w-full rounded-full bg-zinc-200 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Profile" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">casadocapacete_ro</p>
                  <p className="text-xs text-zinc-500">Casa dos Capacetes</p>
                </div>
              </div>
              <div className="flex justify-around p-3 text-center border-b border-zinc-100">
                <div>
                  <p className="font-bold text-sm">532</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">posts</p>
                </div>
                <div>
                  <p className="font-bold text-sm">12,7 mil</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">seguidores</p>
                </div>
                <div>
                  <p className="font-bold text-sm">727</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">seguindo</p>
                </div>
              </div>
              <div className="p-4 text-left text-xs space-y-1">
                <p className="font-bold">Casa dos Capacetes</p>
                <p>Empreendedor(a)</p>
                <p>•Envio para todo Brasil 🇧🇷 🚚</p>
                <p>•Manutenção em capacete 🪖</p>
                <p>•Higienização de Capacete 🫧</p>
                <p>•instalação de Interfones 🎧 ... <span className="text-zinc-400">mais</span></p>
                <p className="text-blue-900">Av.amazonas 3621 agenor de Carvalho, Porto Velho</p>
                <p className="text-blue-900 flex items-center gap-1">
                   <span className="inline-block rotate-45">🔗</span> wa.me/message/6CHAELMQMCH... <span className="text-zinc-400">e outros 2 links</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                import("@/lib/tracking").then(m => m.trackEvent("clique_quero_isso_tambem"));
                setSubStage("niche");
              }}
              className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-2xl px-12 py-5 text-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/20 uppercase"
            >
              Eu quero isso também
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (subStage === "niche") {
    return (
      <div className="animate-rise-in mx-auto w-full max-w-2xl">
        <div className="mt-4 space-y-8 text-center bg-white rounded-3xl p-4 sm:p-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-red-600 sm:text-3xl uppercase">
              Será que funciona pro seu nicho?
            </h3>
            <p className="text-zinc-900 font-medium">
              Se ainda tem dúvidas se funciona mesmo, olha o tanto de segmentos que eu já ajudei e hoje vendem muito 👇
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
            {/* Mock Carousel of Instagram Profiles */}
            <div className="p-4 space-y-4">
              <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden shadow-sm">
                <div className="p-3 flex items-center gap-3 border-b border-zinc-50">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5">
                    <div className="h-full w-full rounded-full bg-white p-0.5">
                      <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=100" alt="Gordo Grill" className="h-full w-full rounded-full object-cover" />
                    </div>
                  </div>
                  <div className="text-left leading-tight">
                    <p className="font-bold text-sm">gordogrillpb</p>
                    <p className="text-[10px] text-zinc-500">Gordo Grill / Casa de Carne</p>
                  </div>
                </div>
                <div className="p-4 text-left">
                  <div className="flex justify-around mb-3 text-center">
                    <div><p className="font-bold text-sm">18</p><p className="text-[9px] text-zinc-400 uppercase">posts</p></div>
                    <div><p className="font-bold text-sm">1.584</p><p className="text-[9px] text-zinc-400 uppercase">seguidores</p></div>
                    <div><p className="font-bold text-sm">264</p><p className="text-[9px] text-zinc-400 uppercase">seguindo</p></div>
                  </div>
                  <p className="text-xs font-medium mb-1">Delivery de Carnes em João Pessoa 🥩 🍖</p>
                  <p className="text-xs mb-3">Quando tudo estiver fechado o Gordo te salva 🤝 ✨</p>
                  <button className="w-full bg-blue-500 text-white rounded-md py-1.5 text-xs font-bold">Seguir de volta</button>
                </div>
                <div className="bg-zinc-50 p-3 text-left">
                  <p className="text-xs italic text-zinc-600">"Fiz o insta do Zero Hoje faz 1 semana Apenas Já Bateu 1500 agr e não para de chegar e sempre convertendo em vendas"</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-1.5 pb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-800"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-300"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-300"></div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-zinc-900 font-bold leading-tight">
              São tantos que eu não consigo colocar todos aqui... Quer ser o próximo a vender muito também?
            </p>

            <button
              onClick={onNext}
              className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-2xl px-12 py-5 text-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/20 uppercase"
            >
              Quero vender muito 😍
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                onClick={() => {
                  import("@/lib/tracking").then(m => m.trackEvent("clique_solucao_preciso"));
                  setSubStage("testimonial");
                }}
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
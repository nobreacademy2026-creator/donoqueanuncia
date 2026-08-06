import { CheckCircle2, Play, Pause } from "lucide-react";
import danielInstagramMockup from "@/assets/daniel-instagram-mockup.png.asset.json";
import { useEffect, useState, useRef } from "react";
import { trackEvent } from "@/lib/tracking";

export function ResultStep({
  onNext,
  steps,
}: {
  onNext: () => void;
  steps: Record<
    string,
    { title?: string; description?: string; image?: string; audio?: string; options?: string[] }
  >;
}) {
  const [subStage, setSubStage] = useState<"objection" | "solution" | "testimonial" | "niche">(
    "objection",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectionDraft = steps["objecao"];
  const solutionDraft = steps["beneficios"];
  const testimonialDraft = steps["audio"];
  const nicheDraft = steps["niche"];

  useEffect(() => {
    void trackEvent("etapa_visualizada", { etapa: subStage });
  }, [subStage]);

  const toggleAudio = () => {
    if (!testimonialDraft?.audio) return;
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
            {testimonialDraft?.title || "Clique no áudio e escute o que meu aluno disse 😲"}
          </h3>

          <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-zinc-100 bg-[#f0f2f5] p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                onClick={toggleAudio}
                disabled={!testimonialDraft?.audio}
                aria-label={
                  testimonialDraft?.audio
                    ? isPlaying
                      ? "Pausar áudio"
                      : "Reproduzir áudio"
                    : "Áudio não configurado"
                }
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-zinc-600 fill-zinc-600" />
                ) : (
                  <Play className="h-6 w-6 text-zinc-600 fill-zinc-600 ml-1" />
                )}
              </button>
              <div className="flex-1 space-y-1">
                <div className="h-8 w-full bg-zinc-200 rounded-sm relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-around px-2">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-zinc-400 rounded-full"
                        style={{ height: `${24 + ((i * 37) % 56)}%` }}
                      ></div>
                    ))}
                  </div>
                  {isPlaying && (
                    <div
                      className="absolute inset-0 bg-blue-400/30 animate-pulse transition-all"
                      style={{ width: "40%" }}
                    ></div>
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
            </div>
            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              src={testimonialDraft?.audio}
              className="hidden"
            />
            {!testimonialDraft?.audio && (
              <p className="mt-3 text-xs font-medium text-zinc-500">
                Nenhum depoimento em áudio foi publicado.
              </p>
            )}
          </div>

          <div className="space-y-6">
            <img
              src={testimonialDraft?.image || danielInstagramMockup.url}
              alt="Depoimento do aluno no Instagram"
              className="mx-auto w-full max-w-sm rounded-3xl shadow-2xl border border-zinc-100"
            />

            <button
              onClick={() => {
                import("@/lib/tracking").then((m) => m.trackEvent("clique_quero_isso_tambem"));
                setSubStage("niche");
              }}
              className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-green-600/10 uppercase"
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
              {nicheDraft?.title || "Será que funciona pro seu nicho?"}
            </h3>
            <p className="text-zinc-900 font-medium">
              Se ainda tem dúvidas se funciona mesmo, olha o tanto de segmentos que eu já ajudei e
              hoje vendem muito 👇
            </p>
          </div>

          {nicheDraft?.image ? (
            <img
              src={nicheDraft.image}
              alt="Depoimento de aluno no Instagram"
              className="mx-auto h-auto w-full max-w-md rounded-3xl border border-zinc-200 object-contain shadow-2xl"
            />
          ) : (
            <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl">
              {/* Mock Carousel of Instagram Profiles */}
              <div className="p-4 space-y-4">
                <div className="rounded-2xl border border-zinc-100 bg-white overflow-hidden shadow-sm">
                  <div className="p-3 flex items-center justify-between border-b border-zinc-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5 shrink-0">
                        <div className="h-full w-full rounded-full bg-white p-0.5">
                          <img
                            src={
                              nicheDraft?.image ||
                              "https://id-preview--cf182c25-70e3-47b3-a4bc-f0183382b65a.lovable.app/lovable-uploads/29ed9a43-05ef-450e-a991-b1e7f6074ca6.png"
                            }
                            alt="Gordo Grill"
                            className="h-full w-full rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-left leading-tight">
                        <p className="font-bold text-sm text-zinc-900">daniel_ferreira</p>
                        <p className="text-[10px] text-zinc-500">Daniel Ferreira / Empreendedor</p>
                      </div>
                    </div>
                    <button className="text-zinc-400">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="6" cy="12" r="1.5" />
                        <circle cx="18" cy="12" r="1.5" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4 text-left">
                    <div className="flex justify-around mb-4 text-center">
                      <div>
                        <p className="font-bold text-sm text-zinc-900">18</p>
                        <p className="text-[9px] text-zinc-400 uppercase font-semibold">posts</p>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900">1.584</p>
                        <p className="text-[9px] text-zinc-400 uppercase font-semibold">
                          seguidores
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900">264</p>
                        <p className="text-[9px] text-zinc-400 uppercase font-semibold">seguindo</p>
                      </div>
                    </div>

                    <div className="space-y-0.5 mb-4">
                      <p className="text-xs font-bold text-zinc-900">Daniel Ferreira</p>
                      <p className="text-xs text-zinc-800">
                        Transformando negócios com anúncios 🚀
                      </p>
                      <p className="text-xs text-zinc-800">De R$ 10k para R$ 100k em 30 dias! 📈</p>
                    </div>

                    <button className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white rounded-lg py-1.5 text-xs font-bold transition-colors">
                      Seguir de volta
                    </button>
                  </div>

                  <div className="bg-zinc-50/50 p-4 text-left border-t border-zinc-50">
                    <p className="text-xs leading-relaxed text-zinc-700 italic">
                      "O método Dono que Anuncia mudou minha vida. Em 1 semana já comecei a ver os
                      resultados e as vendas não param de chegar!"
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-1.5 pb-5">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-800"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-300"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-300"></div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <p className="text-zinc-900 font-bold leading-tight">
              São tantos que eu não consigo colocar todos aqui... Quer ser o próximo a vender muito
              também?
            </p>

            <button
              onClick={onNext}
              className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-green-600/10 uppercase"
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
          {solutionDraft?.title && (
            <h3 className="text-2xl font-extrabold text-red-600 sm:text-3xl">
              {solutionDraft.title}
            </h3>
          )}
          <div className="mx-auto aspect-[1.8/1] w-full overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200 shadow-sm">
            <img
              key="result-solution"
              src={
                solutionDraft?.image ||
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
              }

              alt="Fictitious strategy"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 text-left max-w-lg mx-auto bg-green-50/50 p-6 rounded-2xl border border-green-100">
              {[
                {
                  text: "Passo a passo para criar anúncios no gerenciador e no turbinar do jeito certo.",
                  bold: ["anúncios no gerenciador e no turbinar"],
                },
                {
                  text: "Como fazer anúncios pelo celular e computador de um jeito simples.",
                  bold: ["celular", "computador"],
                },
                {
                  text: "Estruturas validadas para atrair novos clientes todos os dias.",
                  bold: ["Estruturas validadas"],
                },
                { text: "Aulas práticas e objetivas.", bold: ["Aulas práticas e objetivas."] },
                { text: "Como lotar seu Whatsapp de clientes.", bold: ["lotar seu Whatsapp"] },
                {
                  text: "Como ganhar seguidores qualificados.",
                  bold: ["seguidores qualificados."],
                },
                { text: "Como vender pelo seu site.", bold: ["vender"] },
                {
                  text: "Ferramentas para aumentar o faturamento e organizar seu negócio.",
                  bold: ["Ferramentas"],
                },
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm sm:text-base font-medium text-zinc-900 list-none"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-green-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span>
                    {item.bold.length > 0
                      ? item.text
                          .split(new RegExp(`(${item.bold.join("|")})`, "g"))
                          .map((part, idx) =>
                            item.bold.includes(part) ? <strong key={idx}>{part}</strong> : part,
                          )
                      : item.text}
                  </span>
                </li>
              ))}
              <p className="mt-4 text-zinc-700 font-medium">
                Tudo pensado para você <strong>impulsionar as vendas</strong> do seu negócio usando
                a Internet.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  import("@/lib/tracking").then((m) => m.trackEvent("clique_solucao_preciso"));
                  setSubStage("testimonial");
                }}
                className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-green-600/10 uppercase"
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
            key="result-objection"
            src={
              objectionDraft?.image ||
              "https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=800"
            }

            alt="Fictitious representative"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold leading-tight text-zinc-900">
            {objectionDraft?.title || (
              <>
                Vão te oferecer milhares de “fórmulas mágicas”, mas o que realmente vai{" "}
                <span className="text-red-600 block sm:inline">destravar suas vendas</span> é:
              </>
            )}
          </h3>

          <ul className="grid gap-4 text-left max-w-lg mx-auto mt-8">
            {[
              {
                text: "Fazer anúncios do jeito certo (mesmo começando do zero)",
                bold: ["anúncios do jeito certo"],
              },
              { text: "Aparecer todos os dias para pessoas da sua cidade", bold: [] },
              { text: "Saber exatamente o que fazer quando o anúncio não vende", bold: [] },
              { text: "Atrair clientes prontos para comprar.", bold: ["Atrair clientes"] },
              {
                text: "Usar uma estrutura validada, que investe pouco e te faz vender todos os dias.",
                bold: ["vender todos os dias."],
              },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm sm:text-base font-medium text-zinc-900"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <span>
                  {item.bold.length > 0
                    ? item.text
                        .split(new RegExp(`(${item.bold.join("|")})`, "g"))
                        .map((part, idx) =>
                          item.bold.includes(part) ? <strong key={idx}>{part}</strong> : part,
                        )
                    : item.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setSubStage("solution")}
              className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-green-600/10 uppercase"
            >
              Vou dominar isso agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

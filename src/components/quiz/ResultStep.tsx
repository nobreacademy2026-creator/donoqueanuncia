import { CheckCircle2, Play, Pause } from "lucide-react";
import danielInstagramMockup from "@/assets/daniel-instagram-mockup.png.asset.json";
import { useEffect, useState, useRef, useMemo } from "react";
import { trackFunnelEvent } from "@/lib/tracking";
import { optimizedImageSrcSet, optimizedImageUrl } from "@/lib/image-optimization";

export function ResultStep({
  onNext,
  steps,
}: {
  onNext: () => void;
  steps: Record<
    string,
    {
      title?: string;
      description?: string;
      image?: string;
      images?: string[];
      audio?: string;
      options?: string[];
      hidden?: boolean;
    }
  >;
}) {
  const subStages = useMemo(() => {
    const stages: ("objection" | "solution" | "testimonial" | "niche")[] = [];
    if (!steps["objecao"]?.hidden) stages.push("objection");
    if (!steps["beneficios"]?.hidden) stages.push("solution");
    if (!steps["audio"]?.hidden) stages.push("testimonial");
    if (!steps["niche"]?.hidden) stages.push("niche");
    return stages;
  }, [steps]);

  const [subStage, setSubStage] = useState<"objection" | "solution" | "testimonial" | "niche">(() => {
    return subStages[0] || "objection";
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectionDraft = steps["objecao"];
  const solutionDraft = steps["beneficios"];
  const testimonialDraft = steps["audio"];
  const nicheDraft = steps["niche"];

  const nicheImages = nicheDraft?.images?.length
    ? nicheDraft.images.slice(0, 5)
    : nicheDraft?.image
      ? [nicheDraft.image]
      : [];

  useEffect(() => {
    // Se o subStage atual ficar oculto, reseta para o primeiro disponível
    const isCurrentHidden = steps[subStage === "solution" ? "beneficios" : subStage === "objection" ? "objecao" : subStage]?.hidden;
    if (isCurrentHidden) {
      const firstAvailable = subStages[0];
      if (firstAvailable) {
        setSubStage(firstAvailable);
      }
    }
  }, [subStages, steps, subStage]);

  const handleNextSubStage = (current: typeof subStage) => {
    const currentIndex = subStages.indexOf(current);
    if (currentIndex >= 0 && currentIndex < subStages.length - 1) {
      const nextStage = subStages[currentIndex + 1];
      if (nextStage) {
        setSubStage(nextStage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      onNext();
    }
  };

  useEffect(() => {
    void trackFunnelEvent("etapa_visualizada", { etapa: subStage });
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
        <div className="mt-2 space-y-4 text-center bg-white rounded-3xl p-3 sm:space-y-8 sm:p-8">
          <h3 className="text-xl font-extrabold text-red-600 sm:text-3xl">
            {testimonialDraft?.title || "Clique no áudio e escute o que meu aluno disse 😳"}
          </h3>

          <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-zinc-100 bg-[#f0f2f5] p-3 shadow-sm sm:rounded-2xl sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
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
                  <Pause className="h-5 w-5 text-zinc-600 fill-zinc-600 sm:h-6 sm:w-6" />
                ) : (
                  <Play className="h-5 w-5 text-zinc-600 fill-zinc-600 ml-0.5 sm:h-6 sm:w-6 sm:ml-1" />
                )}
              </button>
              <div className="flex-1 space-y-1">
                <div className="h-6 w-full bg-zinc-200 rounded-sm relative overflow-hidden sm:h-8">
                  <div className="absolute inset-0 flex items-center justify-around px-1 sm:px-2">
                    {[...Array(15)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-zinc-400 rounded-full sm:w-1"
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
                <div className="flex justify-between text-[9px] text-zinc-500 font-medium px-0.5 sm:text-[10px]">
                  <span>00:00</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 bg-blue-400 rounded-full flex items-center justify-center sm:h-3 sm:w-3">
                      <div className="h-1 w-1 bg-white rounded-full sm:h-1.5 sm:w-1.5"></div>
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
              <p className="mt-2 text-[10px] font-medium text-zinc-500 sm:mt-3 sm:text-xs">
                Nenhum depoimento em áudio foi publicado.
              </p>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="relative mx-auto w-full max-w-[280px] sm:max-w-sm">
              <img
                src={optimizedImageUrl(testimonialDraft?.image || danielInstagramMockup.url, 672)}
                srcSet={optimizedImageSrcSet(testimonialDraft?.image || danielInstagramMockup.url)}
                sizes="(max-width: 448px) 100vw, 384px"
                alt="Depoimento do aluno"
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl shadow-xl border border-zinc-100 sm:rounded-3xl sm:shadow-2xl"
              />
            </div>

            <button
              onClick={() => {
                void trackFunnelEvent("clique_quero_isso_tambem");
                handleNextSubStage("testimonial");
              }}
              className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-green-600/10 uppercase sm:px-8 sm:py-4 sm:text-base"
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
        <div className="mt-2 space-y-4 text-center bg-white rounded-3xl p-3 sm:space-y-8 sm:p-8">
          <div className="space-y-2 sm:space-y-4">
            <h3 className="text-xl font-extrabold text-red-600 sm:text-3xl uppercase">
              {nicheDraft?.title || "Será que funciona pro seu nicho?"}
            </h3>
            <p className="text-xs text-zinc-900 font-medium sm:text-base">
              Se ainda tem dúvidas se funciona mesmo, olha o tanto de segmentos que eu já ajudei e
              hoje vendem muito 👇
            </p>
          </div>

          {nicheImages.length > 0 ? (
            nicheImages.length === 1 ? (
              <img
                src={optimizedImageUrl(nicheImages[0], 672)}
                srcSet={optimizedImageSrcSet(nicheImages[0])}
                sizes="(max-width: 512px) 100vw, 448px"
                alt="Segmentos"
                loading="lazy"
                decoding="async"
                className="mx-auto h-auto w-full max-w-[280px] rounded-2xl border border-zinc-200 object-contain shadow-xl sm:max-w-md sm:rounded-3xl sm:shadow-2xl"
              />
            ) : (
              <div className="mx-auto flex w-full max-w-[280px] snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-thin sm:max-w-md sm:gap-4 sm:pb-4">
                {nicheImages.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={optimizedImageUrl(image, 672)}
                    srcSet={optimizedImageSrcSet(image)}
                    sizes="(max-width: 512px) 100vw, 448px"
                    alt={`Segmento ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full shrink-0 snap-center rounded-2xl border border-zinc-200 object-contain shadow-lg sm:rounded-3xl sm:shadow-xl"
                  />
                ))}
              </div>
            )
          ) : (
            <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl sm:max-w-md sm:rounded-[2rem] sm:shadow-2xl">
              {/* Mock Instagram Profile */}
              <div className="p-3 space-y-3 sm:p-4 sm:space-y-4">
                <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden shadow-sm sm:rounded-2xl">
                  <div className="p-2 flex items-center justify-between border-b border-zinc-50 sm:p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5 shrink-0 sm:h-10 sm:w-10">
                        <div className="h-full w-full rounded-full bg-white p-0.5">
                          <img
                            src={
                              nicheDraft?.image ||
                              "https://id-preview--cf182c25-70e3-47b3-a4bc-f0183382b65a.lovable.app/lovable-uploads/29ed9a43-05ef-450e-a991-b1e7f6074ca6.png"
                            }
                            alt="Aluno"
                            className="h-full w-full rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-left leading-tight">
                        <p className="font-bold text-xs text-zinc-900 sm:text-sm">bruno_mendes</p>
                        <p className="text-[9px] text-zinc-500 sm:text-[10px]">Bruno Mendes / Empreendedor</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 text-left sm:p-4">
                    <div className="flex justify-around mb-3 text-center sm:mb-4">
                      <div>
                        <p className="font-bold text-xs text-zinc-900 sm:text-sm">18</p>
                        <p className="text-[8px] text-zinc-400 uppercase font-semibold sm:text-[9px]">posts</p>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-zinc-900 sm:text-sm">1.584</p>
                        <p className="text-[8px] text-zinc-400 uppercase font-semibold sm:text-[9px]">seguidores</p>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-zinc-900 sm:text-sm">264</p>
                        <p className="text-[8px] text-zinc-400 uppercase font-semibold sm:text-[9px]">seguindo</p>
                      </div>
                    </div>

                    <div className="space-y-0.5 mb-3 sm:mb-4">
                      <p className="text-[10px] font-bold text-zinc-900 sm:text-xs">Daniel Ferreira</p>
                      <p className="text-[10px] text-zinc-800 sm:text-xs">Transformando negócios 🚀</p>
                      <p className="text-[10px] text-zinc-800 sm:text-xs">De R$ 10k para R$ 100k! 📈</p>
                    </div>

                    <button className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white rounded-lg py-1 text-[10px] font-bold transition-colors sm:py-1.5 sm:text-xs">
                      Seguir de volta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            <p className="text-xs text-zinc-900 font-bold leading-tight sm:text-sm">
              Quer ser o próximo a vender muito também?
            </p>

            <button
              onClick={() => handleNextSubStage("niche")}
              className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-green-600/10 uppercase sm:px-8 sm:py-4 sm:text-base"
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
        <div className="mt-2 space-y-4 text-center bg-white rounded-3xl p-3 sm:space-y-8 sm:p-8">
          {solutionDraft?.title && (
            <h3 className="text-xl font-extrabold text-red-600 sm:text-3xl">
              {solutionDraft.title}
            </h3>
          )}
          <div className="mx-auto aspect-[1.8/1] w-full max-w-[280px] overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200 shadow-sm sm:max-w-none sm:rounded-2xl">
            <img
              key="result-solution"
              src={
                solutionDraft?.image ||
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
              }
              alt="Estratégia"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 text-left max-w-lg mx-auto bg-green-50/50 p-4 rounded-xl border border-green-100 sm:gap-4 sm:p-6 sm:rounded-2xl">
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
                  className="flex items-start gap-2.5 text-xs font-medium text-zinc-900 list-none sm:gap-3 sm:text-base"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-green-100 sm:h-6 sm:w-6">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
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
              <p className="mt-2 text-xs text-zinc-700 font-medium sm:mt-4 sm:text-sm">
                Tudo pensado para você <strong>impulsionar as vendas</strong> do seu negócio usando
                a Internet.
              </p>
            </div>

            <div className="mt-4 flex justify-center sm:mt-8">
              <button
                onClick={() => {
                  void trackFunnelEvent("clique_solucao_preciso");
                  handleNextSubStage("solution");
                }}
                className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-green-600/10 uppercase sm:px-8 sm:py-4 sm:text-base"
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
      <div className="mt-2 space-y-4 text-center bg-white rounded-3xl p-3 sm:mt-4 sm:space-y-8 sm:p-8">
        <div className="mx-auto aspect-[1.8/1] w-full max-w-[280px] overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200 shadow-sm sm:max-w-none sm:rounded-2xl">
          <img
            key="result-objection"
            src={
              objectionDraft?.image ||
              "https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=800"
            }
            alt="Objeção"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg font-bold leading-tight text-zinc-900 sm:text-2xl">
            {objectionDraft?.title || (
              <>
                Vão te oferecer milhares de “fórmulas mágicas”, mas o que realmente vai{" "}
                <span className="text-red-600 block sm:inline">destravar suas vendas</span> é:
              </>
            )}
          </h3>

          <ul className="grid gap-3 text-left max-w-lg mx-auto mt-4 sm:gap-4 sm:mt-8">
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
                className="flex items-start gap-2.5 text-xs font-medium text-zinc-900 sm:gap-3 sm:text-base"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-green-100 sm:h-6 sm:w-6">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
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

          <div className="mt-6 flex justify-center sm:mt-12">
            <button
              onClick={() => handleNextSubStage("objection")}
              className="bg-[#22c55e] hover:bg-[#16a34a] inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-green-600/10 uppercase sm:px-8 sm:py-4 sm:text-base"
            >
              Vou dominar isso agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

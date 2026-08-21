import React from "react";
import {
  Award,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  Megaphone,
  MessageCircle,
  Play,
  ShieldCheck,
  Target,
  Timer,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import {
  CHECKOUT_URL,
  appendAttributionParams,
  trackCheckoutClick,
  trackContact,
  trackFunnelEvent,
  whatsappLink,
} from "@/lib/tracking";
import professorImg from "@/assets/rogerio-nobre.jpg";
import { optimizedImageSrcSet, optimizedImageUrl } from "@/lib/image-optimization";
import anniversaryAsset from "@/assets/anniversary.png.asset.json";
import instagramPrintAsset from "@/assets/daniel-instagram-mockup.png.asset.json";

const BENEFITS = [
  {
    icon: Megaphone,
    title: "Anúncios que vendem",
    text: "Crie campanhas que trazem clientes reais, não apenas curtidas.",
  },
  {
    icon: Target,
    title: "Público certo",
    text: "Aprenda a segmentar quem realmente compra do seu negócio.",
  },
  {
    icon: Wallet,
    title: "Menos desperdício",
    text: "Pare de queimar orçamento com impulsionamentos aleatórios.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp cheio",
    text: "Transforme anúncios em conversas e conversas em vendas.",
  },
];

const LEARN = [
  "O passo a passo para criar anúncios no turbinar e gerenciador do jeito certo.",
  "Como fazer anúncios pelo celular e computador de um jeito simples.",
  "Como aparecer para pessoas da sua cidade ou região.",
  "Aulas práticas e objetivas para donos de negócio.",
  "Como lotar seu WhatsApp de clientes qualificados.",
  "Como ganhar seguidores que compram de você.",
  "Ferramentas para aumentar o faturamento do seu negócio.",
];

const FOR_WHO = [
  "Donos de loja física que querem encher o movimento",
  "Prestadores de serviço e clínicas que vivem de agenda cheia",
  "Restaurantes que querem mais pedidos e reservas",
  "Quem já impulsiona publicações e não vê retorno",
];

const DIFFERENTIALS = [
  {
    icon: Zap,
    title: "Direto ao ponto",
    text: "Aulas curtas e práticas, feitas para quem tem pouco tempo.",
  },
  {
    icon: Users,
    title: "Para o dono, não para agência",
    text: "Linguagem simples, sem termos técnicos desnecessários.",
  },
  {
    icon: Award,
    title: "Método testado",
    text: "Aplicado em centenas de pequenos negócios no Brasil.",
  },
];

const BONUS = [
  "Suporte e grupo de alunos para tirar dúvidas.",
  "Ideias infinitas de anúncios pro seu negócio.",
  "Todas as aulas adicionais durante o ano.",
  "Tudo pensado para você impulsionar as vendas do seu negócio usando a Internet.",
];

const FAQ = [
  {
    q: "Preciso ter experiência com anúncios?",
    a: "Não. O curso começa do absoluto zero, mesmo que você nunca tenha criado um anúncio.",
  },
  {
    q: "Quanto preciso investir em anúncios?",
    a: "Você pode começar com valores baixos. O método ensina a extrair o máximo de cada real investido.",
  },
  {
    q: "Serve para o meu segmento?",
    a: "Sim. O método é aplicado a lojas físicas, e-commerces, clínicas, restaurantes e prestadores de serviço.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "O acesso é liberado imediatamente após a compra, incluindo as atualizações do curso.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias de garantia incondicional. Basta pedir o reembolso e devolvemos 100% do valor.",
  },
];

function CTAButton({
  label = "QUERO ME TORNAR UM DONO QUE ANUNCIA",
  className = "",
  href,
}: {
  label?: string;
  className?: string;
  href?: string;
}) {
  const destination = appendAttributionParams(href || CHECKOUT_URL);
  return (
    <a
      href={destination}
      target="_blank"
      rel="noopener noreferrer"
      onClick={async (event) => {
        // We don't prevent default here to allow direct navigation if needed,
        // but tracking should happen. The 'target="_blank"' handles the new tab.
        void trackCheckoutClick({ origem: "pagina_vendas" });
      }}
      className={`bg-[#22c55e] hover:bg-[#16a34a] inline-flex items-center justify-center rounded-xl px-8 py-4 text-center text-sm font-bold tracking-wide text-white transition-all duration-200 hover:scale-105 sm:text-base shadow-lg shadow-green-600/20 animate-pulse-subtle ${className}`}
    >
      {label}
    </a>
  );
}

function normalizeEmbedUrl(url: string, autoplay = false) {
  try {
    const parsed = new URL(url);
    let embed = parsed;
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) embed = new URL(`https://www.youtube.com/embed/${videoId}`);
    } else if (parsed.hostname === "youtu.be") {
      embed = new URL(`https://www.youtube.com/embed/${parsed.pathname.slice(1)}`);
    } else if (parsed.hostname.includes("vimeo.com") && !parsed.hostname.includes("player.")) {
      embed = new URL(
        `https://player.vimeo.com/video/${parsed.pathname.split("/").filter(Boolean)[0]}`,
      );
    }
    if (autoplay) embed.searchParams.set("autoplay", "1");
    return embed.toString();
  } catch {
    return url;
  }
}

function EmbeddedVideo({ url }: { url: string }) {
  const [started, setStarted] = React.useState(true);

  React.useEffect(() => {
    if (!started) return;
    
    // Milestones to track for YouTube/Vimeo
    const milestones = [10, 30, 60, 120, 300, 600];
    const trackedMilestones = new Set();
    
    const interval = setInterval(() => {
      // Note: We can't easily get exact currentTime from cross-origin iframes 
      // without their specific SDKs, but for embedded videos we track the 
      // "Engagement Time" as a proxy for retention.
      const elapsed = Math.floor((Date.now() - (window as any)._videoStartTime) / 1000);
      
      const currentMilestone = milestones.find(m => elapsed >= m && !trackedMilestones.has(m));
      if (currentMilestone) {
        trackedMilestones.add(currentMilestone);
        void trackFunnelEvent("video_retencao", {
          segundos: currentMilestone,
          origem: "pagina_vendas",
          tipo: "embed"
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [started]);

  return (
    <div className="relative h-full w-full">
      <iframe
        src={normalizeEmbedUrl(url, started)}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vídeo de Vendas"
      />
    </div>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto mt-24 w-full max-w-6xl px-5 sm:mt-32 sm:px-8 ${className}`}>
      {title && (
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-black tracking-[-0.035em] text-zinc-950 sm:text-5xl">
          {title}
        </h2>
      )}
      <div className={title ? "mt-10 sm:mt-14" : ""}>{children}</div>
    </section>
  );
}

type SalesDraft = {
  videoHeadline?: string;
  videoThumb?: string;
  vslUrl?: string;
  fullPrice?: string;
  promoPrice?: string;
  checkoutUrl?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
};

type FunnelStep = {
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  audio?: string;
  options?: string[];
};

export function SalesPage({
  draft = {},
  tracking = {},
  steps = {},
}: {
  draft?: SalesDraft;
  tracking?: any;
  steps?: Record<string, FunnelStep>;
}) {
  const [started, setStarted] = React.useState(true);
  const headline = draft.videoHeadline || "ASSISTE ESSE VÍDEO AQUI PRA VOCÊ ENTENDER:";
  const videoThumb =
    draft.videoThumb !== undefined
      ? draft.videoThumb
      : "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1200";
  const vslUrl = draft.vslUrl;
  const isUploadedVideo = Boolean(vslUrl && /\.(mp4|webm|ogg|mov)(?:\?|$)/i.test(vslUrl));
  const fullPrice = draft.fullPrice || "R$ 399,00";
  const promoPrice = draft.promoPrice || "R$ 197,00";
  const checkoutUrl = draft.checkoutUrl || CHECKOUT_URL;
  const whatsappNumber = draft.whatsappNumber;
  const whatsappMessage = draft.whatsappMessage || "Olá! Tenho dúvidas sobre o Dono que Anuncia.";
  const salesTestimonial = steps["sales_testimonial"];
  const funnelTestimonial = steps["audio"];
  const testimonial = {
    ...funnelTestimonial,
    ...salesTestimonial,
    audio: salesTestimonial?.audio || funnelTestimonial?.audio,
  };
  const niche = steps["niche"];
  const salesInstagram = steps["sales_instagram"] || niche;

  const [timeLeft, setTimeLeft] = React.useState(900); // 15 minutes in seconds

  React.useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className="animate-rise-in overflow-hidden bg-white pb-24 text-zinc-900 selection:bg-red-600 selection:text-white sm:pb-32">
      {/* Countdown Timer Floating Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="w-full flex justify-center pointer-events-auto">
          <div className="w-full flex items-center justify-center gap-3 bg-red-600 py-3 text-white backdrop-blur-md px-4 sm:px-6">
            <Timer className="h-3.5 w-3.5 animate-pulse shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest sm:text-xs">
              Oferta expira em:
            </span>
            <span className="font-mono text-lg font-black leading-none tracking-tight tabular-nums sm:text-xl">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Hero / Video Section */}
      <section className="relative bg-white px-5 pb-8 pt-4 text-center text-zinc-950 sm:pb-28 sm:pt-20 min-h-[85vh] sm:min-h-[calc(100vh-52px)] flex flex-col justify-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(220,38,38,0.05),transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl w-full flex flex-col items-center">
          <div className="mb-1 inline-flex rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-red-600 sm:mb-10 sm:px-4 sm:py-2 sm:text-[11px]">
            Acesso Liberado com Desconto
          </div>
          <h2 className="mx-auto mb-1 max-w-4xl text-[17px] font-black uppercase leading-[1.1] tracking-[-0.055em] text-zinc-950 sm:mb-12 sm:text-7xl">
            {headline.split(" ").map((word, i) => {
              const cleanWord = word.replace(/[^\w]/g, "").toUpperCase();
              return (
                <span key={i} className={cleanWord === "VÍDEO" ? "text-red-600" : ""}>
                  {word}{" "}
                </span>
              );
            })}
          </h2>

          <div className="mx-auto max-w-4xl w-full relative -mt-1 sm:mt-0">
            <div
              className="group relative mb-1.5 aspect-video w-full overflow-hidden rounded-xl border border-zinc-100 bg-black shadow-[0_32px_100px_rgba(0,0,0,0.15)] sm:mb-12 sm:rounded-[2rem] max-h-[35vh] sm:max-h-none"
              onClick={() => trackFunnelEvent("clique_video", { origem: "pagina_vendas" })}
            >
              {vslUrl && isUploadedVideo ? (
                <div className="relative h-full w-full">
                  <video
                    id="vsl-video-player"
                    src={vslUrl}
                    className="h-full w-full bg-black object-contain pointer-events-none"
                    
                    playsInline
                    autoPlay
                    preload="auto"
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget;
                      const progress = (video.currentTime / video.duration) * 100;
                      
                      // Custom non-linear progress bar logic
                      // Start fast, then slow down
                      let visualProgress = 0;
                      if (progress < 20) {
                        // First 20% of video fills 50% of the bar
                        visualProgress = (progress / 20) * 50;
                      } else {
                        // Remaining 80% of video fills remaining 50% of the bar
                        visualProgress = 50 + ((progress - 20) / 80) * 50;
                      }

                      const progressBar = document.getElementById("video-progress-bar");
                      if (progressBar) progressBar.style.width = `${visualProgress}%`;

                      // Track retention milestones
                      const time = Math.floor(video.currentTime);
                      const milestones = [10, 30, 60, 120, 300, 600]; // seconds
                      const lastMilestone = (video as any)._lastMilestone || 0;
                      const currentMilestone = milestones.find((m) => time >= m && m > lastMilestone);

                      if (currentMilestone) {
                        (video as any)._lastMilestone = currentMilestone;
                        void trackFunnelEvent("video_retencao", {
                          segundos: currentMilestone,
                          porcentagem: Math.round(progress),
                          origem: "pagina_vendas",
                          duracao_total: video.duration
                        });
                      }
                    }}
                    onPlay={(e) => {
                      setStarted(true);
                      // Registrar a duração real do vídeo no primeiro play
                      const video = e.currentTarget;
                      void trackFunnelEvent("video_info", {
                        duracao: video.duration,
                        origem: "pagina_vendas"
                      });
                    }}
                  >
                    Seu navegador não suporta reprodução de vídeo.
                  </video>
                  {/* Enhanced Progress Bar */}
                  <div className="absolute bottom-0 left-0 h-3 w-full bg-white/20 z-10">
                    <div
                      id="video-progress-bar"
                      className="h-full bg-green-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              ) : vslUrl ? (
                <EmbeddedVideo url={vslUrl} />
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-white cursor-pointer group/overlay bg-black/40 hover:bg-black/20 transition-colors"
                  onClick={() => {
                    (window as any)._videoStartTime = Date.now();
                    void trackFunnelEvent("clique_video", { origem: "pagina_vendas" });
                  }}
                >
                  <div className="flex flex-col items-center gap-2 bg-red-600 p-4 rounded-xl border border-white/20 backdrop-blur-sm shadow-xl animate-pulse-subtle scale-75 sm:scale-90">
                    <span className="text-xs font-bold uppercase tracking-widest text-white">
                      Clique aqui
                    </span>
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                      <div className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-red-600 shadow-lg">
                        <div className="relative">
                          <Play className="ml-0.5 h-6 w-6 fill-current" />
                          <div className="absolute -top-0.5 -right-0.5 h-7 w-0.5 border-t-2 border-red-600 rotate-45 origin-center" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-white/90">para ativar o som</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto max-w-3xl space-y-1 sm:space-y-7 -mt-2 sm:mt-0">
            <h3 className="hidden sm:block text-xl font-black leading-tight tracking-tight text-zinc-950 sm:text-5xl">
              Parabéns! Você deu o primeiro passo.
            </h3>
            
            <div className="flex flex-col items-center gap-1.5 sm:gap-6">
              <div className="flex flex-row items-baseline justify-center gap-2 sm:flex-col sm:items-center sm:gap-0">
                <span className="text-[10px] font-bold text-zinc-400 line-through sm:text-lg">
                  De {fullPrice}
                </span>
                <span className="text-xl font-black text-red-600 sm:text-6xl">
                  Por {promoPrice}
                </span>
              </div>
              
              <CTAButton
                href={checkoutUrl}
                label="Quero Garantir Minha Vaga com Desconto"
                className="w-full rounded-xl bg-green-500 py-3 text-[11px] font-black uppercase tracking-tight shadow-[0_20px_50px_-10px_rgba(34,197,94,0.3)] hover:bg-green-600 sm:w-auto sm:rounded-2xl sm:px-8 sm:py-5 sm:text-lg animate-pulse-subtle"
              />
              
              <div className="flex items-center gap-1.5 text-[7px] font-bold text-zinc-400 uppercase tracking-widest sm:text-xs">
                <ShieldCheck className="h-2.5 w-2.5 text-green-500 sm:h-4 sm:w-4" /> Pagamento 100% Seguro
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objective */}
      <div className="mx-auto -mt-8 max-w-3xl px-5 text-center relative z-10 sm:-mt-10">
        <div className="rounded-3xl border border-zinc-200/70 bg-white p-7 shadow-xl shadow-zinc-900/5 sm:p-10">
          <h3 className="text-xl font-black mb-4 flex items-center justify-center gap-2 uppercase">
            🎯 Seu Objetivo:
          </h3>
          <p className="text-lg leading-relaxed text-zinc-800 font-medium">
            Hoje você vai começar a fazer anúncios que realmente trazem clientes,{" "}
            <span className="text-red-600 font-bold italic">
              usando as estratégias que eu aplico pra vender todo dia!
            </span>
          </p>
        </div>
      </div>

      {/* Hero / Solution Content (Moved down) */}
      <section className="mx-auto mt-24 max-w-5xl px-5 text-center sm:mt-32">
        <h2 className="text-3xl font-black leading-tight tracking-[-0.035em] text-zinc-950 sm:text-5xl">
          No método <span className="text-zinc-900">DONO QUE ANUNCIA</span> eu vou te mostrar:
        </h2>

        <ul className="mt-10 grid gap-3 text-left sm:grid-cols-2">
          {LEARN.map((item) => (
            <li
              key={item}
              className="flex items-start gap-4 rounded-2xl border border-zinc-200/70 bg-white px-5 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#22c55e]" />
              <span className="text-sm font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Audio Proof */}
      <Section
        title={testimonial?.title || "Clique no áudio e escute o que meu aluno disse 😱"}
        className="max-w-3xl"
      >
        <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-xl shadow-zinc-900/5 transition-all duration-300 sm:p-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {testimonial?.audio ? (
              <audio
                src={testimonial.audio}
                controls
                preload="metadata"
                className="w-full sm:max-w-xs"
              />
            ) : (
              <button
                type="button"
                disabled
                className="h-20 w-20 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center text-white shadow-xl shadow-green-500/30 opacity-60"
              >
                <Play className="h-10 w-10 fill-current ml-1" />
              </button>
            )}
            <div className="flex-1 space-y-4">
              <div className="relative h-3 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-50">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                <div className="absolute inset-0 flex items-center justify-around px-4 opacity-20">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-0.5 bg-zinc-400 ${i % 3 === 0 ? "h-full" : "h-1/2"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-xs font-bold text-zinc-400 tracking-tighter">
                <span>00:45</span>
                <span>02:14</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-xl font-bold leading-relaxed text-zinc-800">
          O método <span className="text-primary font-black">DONO QUE ANUNCIA</span> é a sua ponte
          para o próximo nível.
        </p>
        <div className="mt-8 text-center">
          <CTAButton
            href={checkoutUrl}
            label="Eu quero isso também"
            className="bg-[#22c55e] hover:bg-[#16a34a] shadow-green-600/20"
          />
        </div>
      </Section>

      <Section title={salesInstagram?.title || "O QUE OS ALUNOS ESTÃO DIZENDO"}>
        <p className="text-center text-muted-foreground -mt-4 mb-8">
          Confira o depoimento de quem já aplicou o método e transformou seus resultados 👇
        </p>
        <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
          <img
            src={optimizedImageUrl(salesInstagram?.image || instagramPrintAsset.url, 672)}
            srcSet={optimizedImageSrcSet(salesInstagram?.image || instagramPrintAsset.url)}
            sizes="(max-width: 448px) 100vw, 448px"
            alt="Depoimento de cliente no Instagram"
            className="h-auto w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-zinc-200/70 bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="text-xl font-bold text-zinc-800">
            "Não importa o seu nicho, o tráfego pago é o oxigênio de qualquer negócio que quer
            crescer."
          </p>
          <p className="mt-4 text-muted-foreground">
            Já ajudei centenas de empresários a saírem do zero e atingirem resultados expressivos.
          </p>
        </div>
        <div className="mt-8 text-center">
          <CTAButton
            href={checkoutUrl}
            label="QUERO VENDER MUITO 🤩"
            className="bg-[#22c55e] hover:bg-[#16a34a] shadow-green-600/20"
          />
        </div>
      </Section>

      <Section title="">
        <div className="mx-auto max-w-3xl rounded-3xl border border-green-200/70 bg-gradient-to-br from-green-50 to-white p-8 text-center shadow-xl shadow-green-900/5 sm:p-12">
          <h3 className="text-2xl font-black text-red-600 mb-6 uppercase leading-tight">
            🎁 Bônus que você recebe no <br /> DONO QUE ANUNCIA:
          </h3>
          <ul className="space-y-4 text-left">
            <li className="flex items-start gap-3">
              <span className="text-xl shrink-0">🎁</span>
              <span className="text-base font-medium text-zinc-900">
                <strong>Suporte</strong> e <strong>grupo de alunos</strong> para tirar dúvidas.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl shrink-0">🎁</span>
              <span className="text-base font-medium text-zinc-900">
                <strong>Ideias infinitas</strong> de anúncios pro seu negócio.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl shrink-0">🎁</span>
              <span className="text-base font-medium text-zinc-900">
                Todas as <strong>aulas adicionadas</strong> durante o ano você{" "}
                <strong>não pagará</strong> nada.
              </span>
            </li>
          </ul>
          <p className="mt-8 text-sm text-zinc-700 font-medium">
            Tudo pensado para você <strong>Impulsionar as vendas</strong> do seu negócio usando a
            Internet.
          </p>
        </div>
      </Section>

      {/* Final Offer */}
      <section className="mx-auto mt-20 max-w-5xl px-5 text-center sm:mt-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white px-6 py-12 text-zinc-950 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.05)] sm:rounded-[3rem] sm:p-16">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap className="h-64 w-64 text-red-600" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-9">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-red-500/30 bg-red-50 px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-red-600 sm:text-xs">
                Oferta Exclusiva e Limitada
              </span>
              <h2 className="text-4xl font-black uppercase leading-none tracking-[-0.055em] sm:text-7xl">
                SUA HORA É AGORA!
              </h2>
            </div>

            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              <div className="flex items-center gap-4 text-zinc-400 font-black uppercase tracking-widest italic text-xl">
                <span>De {fullPrice}</span>
                <div className="h-0.5 w-20 bg-red-600" />
              </div>

              <div className="relative w-full">
                <div className="absolute inset-0 bg-red-600 blur-3xl opacity-5" />
                <div className="relative rounded-3xl border border-zinc-200 bg-zinc-50 p-8 text-zinc-950 shadow-sm sm:p-10">
                  <span className="block text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2">
                    Preço Promocional
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black leading-none tracking-tighter sm:text-7xl">
                      {promoPrice}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 border-t border-zinc-100 pt-4">
                    <img
                      src="https://logopng.com.br/logos/pix-106.png"
                      className="h-6 object-contain"
                      alt="Pix"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="text-sm font-black uppercase tracking-widest">
                      Pagamento Único
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-2 text-zinc-500 font-bold">
                <p className="text-lg">
                  Ou 12x de <span className="text-zinc-950 font-black">R$ 19,78</span> no cartão
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest opacity-60">
                  <ShieldCheck className="h-3 w-3" /> Acesso imediato após aprovação
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                55% de DESCONTO para os próximos 50 alunos
              </div>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-2 font-medium">
                Isso aqui não é gatilho mental, olhe no link da minha bio e veja que o treinamento
                tem valor de 399,00.
              </p>
              <p className="text-sm font-black text-green-500">
                Clica no link e aproveita o desconto 👇
              </p>
              <CTAButton
                href={checkoutUrl}
                label="Garantir com desconto"
                className="w-full sm:w-auto px-10 py-5 text-lg bg-[#22c55e] hover:bg-[#16a34a] border-b-4 border-[#15803d] active:border-b-0 active:translate-y-1 shadow-lg shadow-green-600/10 animate-pulse-subtle"
              />
            </div>

            <p className="mt-6 text-xs text-zinc-400 font-bold uppercase tracking-widest">
              Acesso imediato • Pagamento seguro • Vitalício
            </p>
          </div>
        </div>
      </section>

      {/* WhatsApp Support */}
      <section className="mx-auto mt-24 max-w-2xl px-5 text-center sm:mt-32">
        <h3 className="mb-6 text-xl font-black uppercase tracking-tight">
          AINDA ESTÁ COM DÚVIDAS?
        </h3>
        <a
          href={appendAttributionParams(whatsappLink(whatsappMessage, whatsappNumber))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContact({ origem: "pagina_vendas", canal: "whatsapp" })}
          className="inline-flex items-center gap-3 rounded-2xl bg-zinc-100 border border-zinc-200 px-8 py-4 font-bold uppercase text-zinc-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-200 active:translate-y-0"
        >
          <div className="bg-[#25D366] p-2 rounded-full">
            <MessageCircle className="h-6 w-6 fill-white text-white" />
          </div>
          Fale comigo no WhatsApp
        </a>
      </section>

      {/* FAQ */}

      <Section title="Perguntas frequentes">
        <div className="grid gap-3 max-w-3xl mx-auto">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-zinc-200/70 bg-white px-6 py-5 shadow-sm transition hover:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </main>
  );
}

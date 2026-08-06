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
  Star,
  Target,
  Timer,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { CHECKOUT_URL, trackCheckoutClick, trackEvent, whatsappLink } from "@/lib/tracking";
import professorImg from "@/assets/rogerio-nobre.jpg";
import anniversaryAsset from "@/assets/anniversary.png.asset.json";

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

const TESTIMONIALS = [
  {
    name: "Tony Nobre",
    role: "Estrategista Digital",
    text: "O método Dono que Anuncia mudou completamente a forma como encaro as vendas. Antes eu dependia da sorte, agora eu domino as ferramentas que trazem clientes todos os dias. É o caminho mais curto para quem quer resultados reais no digital.",
  },
  {
    name: "Ricardo Silva",
    role: "Dono de Hamburgueria",
    text: "Eu achava que anúncios eram só para grandes empresas. Com o treinamento, aprendi a investir pouco e ter um retorno absurdo. Minha agenda de pedidos vive cheia e meu WhatsApp não para de tocar.",
  },
  {
    name: "Ana Oliveira",
    role: "Loja de Roupas Femininas",
    text: "Simples, direto e sem enrolação. Consegui aplicar as aulas no mesmo dia e já vi diferença no movimento da loja e no engajamento do meu perfil. Vale cada centavo do investimento!",
  },
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
  const destination = href || CHECKOUT_URL;
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
      className={`bg-[#22c55e] hover:bg-[#16a34a] inline-flex items-center justify-center rounded-xl px-8 py-4 text-center text-sm font-bold tracking-wide text-white transition-all duration-200 hover:scale-[1.01] sm:text-base shadow-lg shadow-green-600/10 ${className}`}
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
  const [started, setStarted] = React.useState(false);
  return (
    <div className="relative h-full w-full">
      <iframe
        src={normalizeEmbedUrl(url, started)}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vídeo de Vendas"
      />
      {!started && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void trackEvent("clique_video", { origem: "pagina_vendas", tipo: "embed" });
            setStarted(true);
          }}
          className="absolute inset-0 grid place-items-center bg-black/15 text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500"
          aria-label="Reproduzir vídeo"
        >
          <span className="grid h-24 w-24 place-items-center rounded-full bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] transition-transform hover:scale-105">
            <Play className="ml-1 h-10 w-10 fill-current" />
          </span>
        </button>
      )}
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
};

type FunnelStep = { title?: string; image?: string; audio?: string; options?: string[] };

export function SalesPage({
  draft = {},
  tracking = {},
  steps = {},
}: {
  draft?: SalesDraft;
  tracking?: any;
  steps?: Record<string, FunnelStep>;
}) {
  const headline = draft.videoHeadline || "ASSISTE ESSE VÍDEO AQUI PRA VOCÊ ENTENDER:";
  const videoThumb =
    draft.videoThumb !== undefined
      ? draft.videoThumb
      : "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1200";
  const vslUrl = draft.vslUrl;
  const isUploadedVideo = Boolean(vslUrl && /\.(mp4|webm|ogg|mov)(?:\?|$)/i.test(vslUrl));
  const fullPrice = draft.fullPrice || "R$ 497,00";
  const promoPrice = draft.promoPrice || "R$ 197,00";
  const checkoutUrl = draft.checkoutUrl || CHECKOUT_URL;
  const testimonial = steps["sales_testimonial"] || steps["audio"];
  const niche = steps["niche"];

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
          <div className="w-full flex items-center justify-center gap-3 bg-red-600 py-1.5 text-white shadow-lg backdrop-blur-md px-4 sm:px-6">
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
      <section className="relative bg-white px-5 pb-20 pt-24 text-center text-zinc-950 sm:pb-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(220,38,38,0.05),transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-6 inline-flex rounded-full border border-red-100 bg-red-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-red-600">
            Acesso Liberado com Desconto
          </div>
          <h2 className="mx-auto mb-10 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.055em] text-zinc-950 sm:text-7xl">
            {headline.split(" ").map((word, i) => (
              <span key={i} className={word.toUpperCase() === "VÍDEO" ? "text-red-600" : ""}>
                {word}{" "}
              </span>
            ))}
          </h2>

          <div className="mx-auto max-w-4xl relative">
            <div
              className="group relative mb-12 aspect-video w-full overflow-hidden rounded-2xl border border-zinc-100 bg-black shadow-[0_32px_100px_rgba(0,0,0,0.15)] sm:rounded-[2rem]"
              onClick={() => trackEvent("clique_video", { origem: "pagina_vendas" })}
            >
              {vslUrl && isUploadedVideo ? (
                <video
                  src={vslUrl}
                  className="h-full w-full bg-black object-contain"
                  controls
                  playsInline
                  preload="metadata"
                >
                  Seu navegador não suporta reprodução de vídeo.
                </video>
              ) : vslUrl ? (
                <EmbeddedVideo url={vslUrl} />
              ) : (
                <>
                  {videoThumb && (
                    <img
                      key={videoThumb}
                      src={videoThumb}
                      alt="Vídeo explicativo DONO QUE ANUNCIA"
                      className="h-full w-full object-cover opacity-70 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-500 cursor-pointer">
                      <Play className="h-10 w-10 fill-current ml-1" />
                    </div>
                    <div className="bg-black/40 backdrop-blur-sm px-5 py-2 rounded-full">
                      <span className="font-bold text-[10px] tracking-widest uppercase">
                        Assistir Aula Completa
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mx-auto max-w-3xl space-y-7">
            <h3 className="text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-5xl">
              Parabéns! Você deu o primeiro passo.
            </h3>
            <p className="text-lg font-medium leading-relaxed text-zinc-600 sm:text-xl">
              Em <span className="text-red-600 font-black">menos de 24hrs</span>, você já pode estar
              atraindo novos clientes e vendendo muito mais{" "}
              <span className="font-black text-zinc-950">usando apenas o seu celular.</span>
            </p>

            <div className="flex flex-col items-center gap-4">
              <CTAButton
                href={checkoutUrl}
                label="Quero Garantir Minha Vaga com Desconto"
                className="w-full rounded-2xl bg-green-500 px-8 py-5 text-base uppercase tracking-tight shadow-[0_20px_50px_-10px_rgba(34,197,94,0.3)] hover:bg-green-600 sm:w-auto sm:text-lg"
              />
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-green-500" /> Pagamento 100% Seguro
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
              <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
                <div>
                  <h4 className="font-bold text-zinc-900 text-lg">Resultado Real</h4>
                  <p className="text-zinc-500 text-sm font-medium">Aluno do Dono que Anuncia</p>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-bold text-xl">De R$ 10k → R$ 100k</span>
                </div>
              </div>
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
        <div className="mt-8 max-w-sm mx-auto">
          <div className="bg-[#e5ddd5] rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-zinc-900 flex flex-col aspect-[9/19] relative">
            {/* Status Bar */}
            <div className="bg-[#075e54] px-6 py-2 flex justify-between items-center text-white text-[10px] font-medium">
              <span>14:26</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 border border-white/50 rounded-sm" />
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>

            {/* WhatsApp Header */}
            <div className="bg-[#075e54] p-4 flex items-center gap-3 text-white border-b border-black/10">
              <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden shrink-0 border border-white/20">
                <img
                  src={
                    testimonial?.image ||
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"
                  }
                  alt="Aluno"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-none truncate">Carlos Eduardo (Aluno)</p>
                <p className="text-[10px] opacity-80 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> online
                </p>
              </div>
              <div className="flex gap-4 opacity-80">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.3 14.45l-2.89 2.89c-2.83-1.54-5.13-3.84-6.67-6.67l2.89-2.89c.28-.28.38-.67.28-1.03L10.39 3.3c-.08-.42-.45-.72-.88-.72H3.8c-.53 0-.94.46-.89.98.41 4.7 2.32 9.05 5.3 12.5 3.33 3.85 7.82 6.13 12.75 6.42.52.03.95-.38.95-.91v-5.7c0-.43-.3-.8-.72-.88l-3.45-.72c-.36-.08-.75.02-1.04.3z" />
                </svg>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2 s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:400px]">
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm relative">
                  <p className="text-zinc-800 text-sm leading-relaxed">
                    Tony, tô passando aqui pra te agradecer de verdade!
                  </p>
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <p className="text-[9px] text-zinc-400">14:20</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm relative">
                  <p className="text-zinc-800 text-sm leading-relaxed">
                    Fiz minha primeira venda hoje seguindo exatamente o passo a passo. O curso é
                    muito prático!
                  </p>
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <p className="text-[9px] text-zinc-400">14:21</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 max-w-[85%] ml-auto items-end">
                <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-none p-3 shadow-sm relative">
                  <p className="text-zinc-800 text-sm leading-relaxed">
                    Que top Carlos! Fico muito feliz em saber disso. Bora pra cima que é só o
                    começo! 🚀
                  </p>
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <p className="text-[9px] text-zinc-400">14:25</p>
                    <svg viewBox="0 0 16 11" className="w-3 h-3 fill-blue-400">
                      <path d="M11.05 1.05L5.5 6.6 2.45 3.55 1.4 4.6l4.1 4.1 6.6-6.6-1.05-1.05zM14.55 1.05L8.5 7.1 7.45 6.05l-1.05 1.05 2.1 2.1 7.1-7.1-1.05-1.05z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm relative">
                  <p className="text-zinc-800 text-sm leading-relaxed">
                    Obrigado mesmo, o investimento já se pagou no primeiro dia com essa venda. 🙏
                  </p>
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <p className="text-[9px] text-zinc-400">14:26</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="bg-[#f0f0f0] p-2 flex items-center gap-2">
              <div className="bg-white flex-1 rounded-full px-4 py-2 flex items-center justify-between shadow-sm">
                <span className="text-zinc-400 text-sm">Mensagem</span>
                <div className="flex gap-3 text-zinc-400">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.36 8-5.29 8-9.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
              <div className="w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current ml-0.5">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <CTAButton
            href={checkoutUrl}
            label="Eu quero isso também"
            className="bg-[#22c55e] hover:bg-[#16a34a] shadow-green-600/20"
          />
        </div>
      </Section>

      <Section title={niche?.title || "O QUE OS ALUNOS ESTÃO DIZENDO"}>
        <p className="text-center text-muted-foreground -mt-4 mb-8">
          Confira o depoimento de quem já aplicou o método e transformou seus resultados 👇
        </p>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-3xl border border-zinc-100 bg-zinc-50/30 p-8 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-sm font-medium leading-relaxed text-zinc-700 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-200" />
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
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

      {/* Anniversary Badge */}
      <section className="mx-auto mt-24 flex justify-center px-5 sm:mt-32">
        <div className="relative group transition-transform hover:scale-110">
          <img
            src={anniversaryAsset.url}
            alt="1st Year Anniversary Celebration"
            className="h-32 object-contain drop-shadow-[0_0_15px_rgba(190,155,0,0.3)]"
          />
        </div>
      </section>

      {/* Final Offer */}
      <section className="mx-auto mt-20 max-w-5xl px-5 text-center sm:mt-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 px-6 py-12 text-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.65)] sm:rounded-[3rem] sm:p-16">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="h-64 w-64 text-red-600" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-9">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-red-400 sm:text-xs">
                Oferta Exclusiva e Limitada
              </span>
              <h2 className="text-4xl font-black uppercase leading-none tracking-[-0.055em] sm:text-7xl">
                SUA HORA É AGORA!
              </h2>
            </div>

            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              <div className="flex items-center gap-4 text-zinc-500 font-black uppercase tracking-widest italic text-xl">
                <span>De {fullPrice}</span>
                <div className="h-0.5 w-20 bg-red-600" />
              </div>

              <div className="relative w-full">
                <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 animate-pulse" />
                <div className="relative rounded-3xl border border-white/10 bg-white p-8 text-zinc-950 shadow-2xl sm:p-10">
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
                    />
                    <span className="text-sm font-black uppercase tracking-widest">
                      Pagamento Único
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-2 text-zinc-400 font-bold">
                <p className="text-lg">
                  Ou 12x de <span className="text-white">R$ 20,35</span> no cartão
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest opacity-60">
                  <ShieldCheck className="h-3 w-3" /> Acesso imediato após aprovação
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                55% de DESCONTO para os próximos 50 alunos
              </div>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-2">
                Isso aqui não é gatilho mental, olhe no link da minha bio e veja que o treinamento
                tem valor de 497,00.
              </p>
              <p className="text-sm font-black text-green-500">
                Clica no link e aproveita o desconto 👇
              </p>
              <CTAButton
                href={checkoutUrl}
                label="Garantir com desconto"
                className="w-full sm:w-auto px-10 py-5 text-lg bg-[#22c55e] hover:bg-[#16a34a] border-b-4 border-[#15803d] active:border-b-0 active:translate-y-1 shadow-lg shadow-green-600/10"
              />
            </div>

            <p className="mt-6 text-xs text-muted-foreground/60">
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
          href={whatsappLink("Olá! Tenho dúvidas sobre o Dono que Anuncia.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-2xl bg-zinc-950 px-8 py-4 font-bold uppercase text-white shadow-xl shadow-zinc-900/10 transition hover:-translate-y-0.5 hover:bg-zinc-800 active:translate-y-0"
        >
          <div className="bg-white/20 p-2 rounded-full">
            <MessageCircle className="h-6 w-6 fill-white" />
          </div>
          Fale comigo no WhatsApp
        </a>
      </section>

      {/* FAQ */}
      <Section title="O que os alunos estão dizendo">
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col gap-4"
            >
              <div className="flex gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-zinc-600 text-sm italic leading-relaxed">"{t.text}"</p>
              <div className="mt-auto pt-4 border-t border-zinc-50">
                <p className="font-bold text-sm text-zinc-950">{t.name}</p>
                <p className="text-xs text-zinc-400 font-medium">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

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

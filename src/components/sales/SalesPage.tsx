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
    name: "[Nome do aluno]",
    role: "[Segmento do negócio]",
    text: "[Espaço para depoimento do aluno]",
  },
  {
    name: "[Nome do aluno]",
    role: "[Segmento do negócio]",
    text: "[Espaço para depoimento do aluno]",
  },
  {
    name: "[Nome do aluno]",
    role: "[Segmento do negócio]",
    text: "[Espaço para depoimento do aluno]",
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
    <section className={`mx-auto mt-20 w-full max-w-5xl px-5 ${className}`}>
      <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-8">{children}</div>
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
    <main className="animate-rise-in bg-zinc-50 pb-24 text-zinc-900 selection:bg-black selection:text-white">
      {/* Countdown Timer Floating Banner */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none sm:px-0">
        <div className="mx-auto flex max-w-lg justify-center pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md text-red-600 px-6 py-2 rounded-full shadow-[0_8px_32px_rgba(220,38,38,0.15)] flex items-center gap-3 border border-red-100/50">
            <Timer className="h-4 w-4 animate-pulse shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest sm:text-xs">
              Oferta expira em:
            </span>
            <span className="text-xl font-black font-mono tabular-nums leading-none tracking-tight sm:text-2xl min-w-[3.5rem] text-center">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Hero / Video Section */}
      <section className="mx-auto max-w-5xl px-5 pt-12 text-center">
        <div className="inline-block bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          Acesso Liberado com Desconto
        </div>
        <h2 className="text-4xl font-black text-zinc-950 uppercase mb-10 sm:text-6xl leading-[0.9] tracking-tighter">
          {headline.split(" ").map((word, i) => (
            <span key={i} className={word.toUpperCase() === "VÍDEO" ? "text-red-600" : ""}>
              {word}{" "}
            </span>
          ))}
        </h2>

        <div className="mx-auto max-w-4xl relative">
          <div
            className="aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl relative group mb-12 border-4 border-white"
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

            {/* Live Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-full shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                Gravado
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8 max-w-3xl mx-auto">
          <h3 className="text-4xl font-black text-zinc-950 leading-none tracking-tighter uppercase">
            Parabéns! Você deu o primeiro passo.
          </h3>
          <p className="text-xl text-zinc-600 leading-relaxed font-medium">
            Em <span className="text-red-600 font-black">menos de 24hrs</span>, você já pode estar
            atraindo novos clientes e vendendo muito mais{" "}
            <span className="text-zinc-950 font-black">usando apenas o seu celular.</span>
          </p>

          <div className="flex flex-col items-center gap-4">
            <CTAButton
              href={checkoutUrl}
              label="Quero Garantir Minha Vaga com Desconto"
              className="bg-green-500 hover:bg-green-600 shadow-[0_20px_50px_-10px_rgba(34,197,94,0.3)] px-8 py-6 text-xl rounded-2xl animate-pulse-green w-full sm:w-auto uppercase tracking-tighter"
            />
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-green-500" /> Pagamento 100% Seguro
            </div>
          </div>
        </div>
      </section>

      {/* Objective */}
      <div className="mx-auto mt-20 max-w-2xl px-5 text-center">
        <div className="rounded-3xl p-8 border border-zinc-100 bg-white">
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
      <section className="mx-auto max-w-3xl px-5 mt-20 text-center">
        <h2 className="text-3xl leading-tight font-black tracking-tight sm:text-4xl uppercase text-zinc-900">
          No método <span className="text-zinc-900">DONO QUE ANUNCIA</span> eu vou te mostrar:
        </h2>

        <ul className="mt-10 grid gap-3 text-left sm:grid-cols-2">
          {LEARN.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl bg-zinc-50 px-5 py-4 shadow-sm border border-zinc-100"
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
        <div className="surface-card group relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl border-2 border-green-100 bg-white transition-all duration-300 hover:shadow-green-200/40">
          <div className="flex items-center gap-6">
            {testimonial?.audio ? (
              <audio
                src={testimonial.audio}
                controls
                preload="metadata"
                className="w-full max-w-xs"
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
              <div className="flex justify-between items-end">
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
        <div className="mt-8 aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden shadow-xl border border-zinc-100">
          {testimonial?.image ? (
            <img
              src={testimonial.image}
              alt="Depoimento de aluno"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-muted-foreground">
              Foto/Prova Social do Aluno
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <CTAButton
            href={checkoutUrl}
            label="Eu quero isso também"
            className="bg-[#22c55e] hover:bg-[#16a34a] shadow-green-600/20"
          />
        </div>
      </Section>

      {/* Nicho Proof (Carousel Placeholder) */}
      <Section title={niche?.title || "SERÁ QUE FUNCIONA PRO SEU NICHO?"}>
        <p className="text-center text-muted-foreground -mt-4 mb-8">
          Se ainda tem dúvidas se funciona mesmo, olha o tanto de segmentos que eu já ajudei e hoje
          vendem muito 👇
        </p>
        <div className="flex gap-4 overflow-x-auto pb-6 px-2 no-scrollbar justify-center">
          <div className="min-w-[320px] max-w-sm rounded-[2rem] border border-zinc-200 bg-white shadow-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-zinc-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5 shrink-0">
                  <div className="h-full w-full rounded-full bg-white p-0.5">
                    <img
                      src={
                        niche?.image ||
                        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=100"
                      }
                      alt="Gordo Grill"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-left leading-tight">
                  <p className="font-bold text-sm text-zinc-900">premium_grill_sp</p>
                  <p className="text-[10px] text-zinc-500">Premium Grill / Boutique de Carnes</p>
                </div>
              </div>
              <button className="text-zinc-400">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>
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
                  <p className="text-[9px] text-zinc-400 uppercase font-semibold">seguidores</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-900">264</p>
                  <p className="text-[9px] text-zinc-400 uppercase font-semibold">seguindo</p>
                </div>
              </div>
              
              <div className="space-y-0.5 mb-4">
                <div className="flex items-center gap-1">
                   <p className="text-xs font-bold text-zinc-900">Premium Grill / Boutique de Carnes</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-800">
                  <span>Delivery de Carnes em São Paulo 🥩 🍖</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-800">
                  <span>O melhor corte da cidade agora na sua casa 🤝 ✨</span>
                </div>
              </div>
              
              <button className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white rounded-lg py-1.5 text-xs font-bold transition-colors">
                Seguir de volta
              </button>
            </div>
            
            <div className="bg-zinc-50/50 p-4 text-left border-t border-zinc-50">
              <p className="text-xs leading-relaxed text-zinc-700 italic">
                "Fiz o insta do Zero Hoje faz 1 semana Apenas Já Bateu 1500 agr e não para de
                chegar e sempre convertendo em vendas"
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center bg-zinc-50 border border-zinc-100 p-8 rounded-[2rem]">
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
        <div className="bg-[#e6fcf0] border border-[#22c55e]/20 rounded-3xl p-8 shadow-sm max-w-2xl mx-auto text-center">
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
      <section className="mx-auto mt-20 flex justify-center px-5">
        <div className="relative group transition-transform hover:scale-110">
          <img
            src={anniversaryAsset.url}
            alt="1st Year Anniversary Celebration"
            className="h-32 object-contain drop-shadow-[0_0_15px_rgba(190,155,0,0.3)]"
          />
        </div>
      </section>

      {/* Final Offer */}
      <section className="mx-auto mt-24 max-w-4xl px-5 text-center">
        <div className="relative overflow-hidden rounded-[3rem] bg-zinc-950 p-12 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="h-64 w-64 text-red-600" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-10">
            <div className="space-y-4">
              <span className="bg-red-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] animate-bounce">
                Oferta Exclusiva e Limitada
              </span>
              <h2 className="text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl">
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
                <div className="relative bg-white text-zinc-950 rounded-[2.5rem] p-10 shadow-2xl transform scale-110">
                  <span className="block text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2">
                    Preço Promocional
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black">R$</span>
                    <span className="text-8xl font-black leading-none tracking-tighter">197</span>
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
              <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                55% de DESCONTO para os próximos 50 alunos
              </div>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-2">
                Isso aqui não é gatilho mental, olhe no link da minha bio e veja que o treinamento
                tem valor de 497,00.
              </p>
              <p className="text-sm font-black text-green-600 animate-bounce">
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
      <section className="mx-auto mt-20 max-w-2xl px-5 text-center">
        <h3 className="text-xl font-bold mb-6">AINDA ESTÁ COM DÚVIDAS?</h3>
        <a
          href={whatsappLink("Olá! Tenho dúvidas sobre o Dono que Anuncia.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-xl bg-[#ffb900] hover:bg-[#e6a600] text-white font-bold px-8 py-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-yellow-500/10 uppercase"
        >
          Fale comigo no WhatsApp
        </a>
      </section>

      {/* FAQ */}
      <Section title="Perguntas frequentes">
        <div className="grid gap-3 max-w-3xl mx-auto">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="surface-card group rounded-2xl px-5 py-4 border border-zinc-100 shadow-sm bg-zinc-50"
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

import {
  Award,
  BadgeCheck,
  Check,
  ChevronDown,
  Megaphone,
  MessageCircle,
  Play,
  ShieldCheck,
  Star,
  Target,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { CHECKOUT_URL, trackCheckoutClick, whatsappLink } from "@/lib/tracking";
import professorImg from "@/assets/rogerio-nobre.jpg";

const BENEFITS = [
  { icon: Megaphone, title: "Anúncios que vendem", text: "Crie campanhas que trazem clientes reais, não apenas curtidas." },
  { icon: Target, title: "Público certo", text: "Aprenda a segmentar quem realmente compra do seu negócio." },
  { icon: Wallet, title: "Menos desperdício", text: "Pare de queimar orçamento com impulsionamentos aleatórios." },
  { icon: MessageCircle, title: "WhatsApp cheio", text: "Transforme anúncios em conversas e conversas em vendas." },
];

const LEARN = [
  "Passo a passo para criar anúncios no gerenciador e no turbinar do jeito certo.",
  "Como fazer anúncios pelo celular e computador de um jeito simples.",
  "Estruturas validadas para atrair novos clientes todos os dias.",
  "Aulas práticas e objetivas.",
  "Como lotar seu WhatsApp de clientes.",
  "Como ganhar seguidores qualificados.",
  "Como vender pelo seu site.",
  "Ferramentas para aumentar o faturamento e organizar seu negócio.",
];

const FOR_WHO = [
  "Donos de loja física que querem encher o movimento",
  "Prestadores de serviço e clínicas que vivem de agenda cheia",
  "Restaurantes que querem mais pedidos e reservas",
  "Quem já impulsiona publicações e não vê retorno",
];

const DIFFERENTIALS = [
  { icon: Zap, title: "Direto ao ponto", text: "Aulas curtas e práticas, feitas para quem tem pouco tempo." },
  { icon: Users, title: "Para o dono, não para agência", text: "Linguagem simples, sem termos técnicos desnecessários." },
  { icon: Award, title: "Método testado", text: "Aplicado em centenas de pequenos negócios no Brasil." },
];

const BONUS = [
  "Suporte e grupo de alunos para tirar dúvidas.",
  "Ideias infinitas de anúncios pro seu negócio.",
  "Todas as aulas adicionais durante o ano.",
  "Tudo pensado para você impulsionar as vendas do seu negócio usando a Internet.",
];

const TESTIMONIALS = [
  { name: "[Nome do aluno]", role: "[Segmento do negócio]", text: "[Espaço para depoimento do aluno]" },
  { name: "[Nome do aluno]", role: "[Segmento do negócio]", text: "[Espaço para depoimento do aluno]" },
  { name: "[Nome do aluno]", role: "[Segmento do negócio]", text: "[Espaço para depoimento do aluno]" },
];

const FAQ = [
  { q: "Preciso ter experiência com anúncios?", a: "Não. O curso começa do absoluto zero, mesmo que você nunca tenha criado um anúncio." },
  { q: "Quanto preciso investir em anúncios?", a: "Você pode começar com valores baixos. O método ensina a extrair o máximo de cada real investido." },
  { q: "Serve para o meu segmento?", a: "Sim. O método é aplicado a lojas físicas, e-commerces, clínicas, restaurantes e prestadores de serviço." },
  { q: "Por quanto tempo tenho acesso?", a: "O acesso é liberado imediatamente após a compra, incluindo as atualizações do curso." },
  { q: "E se eu não gostar?", a: "Você tem 7 dias de garantia incondicional. Basta pedir o reembolso e devolvemos 100% do valor." },
];

function CTAButton({ label = "QUERO ME TORNAR UM DONO QUE ANUNCIA", className = "" }: { label?: string; className?: string }) {
  return (
    <a
      href={CHECKOUT_URL}
      onClick={() => trackCheckoutClick({ origem: "pagina_vendas" })}
      className={`gradient-primary glow-primary inline-flex items-center justify-center rounded-2xl px-8 py-4 text-center text-sm font-bold tracking-wide text-primary-foreground transition-transform duration-200 hover:scale-[1.02] sm:text-base ${className}`}
    >
      {label}
    </a>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-auto mt-20 w-full max-w-5xl px-5 ${className}`}>
      <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function SalesPage() {
  return (
    <main className="animate-rise-in bg-white pb-24 text-zinc-900 selection:bg-primary selection:text-white">
      {/* Top Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-3 text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase sm:text-sm">
          ⚡ OPORTUNIDADE ÚNICA: VAISER A PAGINA DA PROMOÇÃO
        </p>
      </div>

      {/* Hero / Solution */}
      <section className="mx-auto max-w-3xl px-5 pt-16 text-center">
        <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Na <span className="text-primary">STARFLIX</span> eu vou te mostrar:
        </h1>
        
        {/* Product Mockup Placeholder */}
        <div className="surface-card mt-10 aspect-video w-full overflow-hidden rounded-3xl border-primary/10 bg-zinc-50 shadow-xl group">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" 
            alt="Interface do curso STARFLIX"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <ul className="mt-10 grid gap-3 text-left sm:grid-cols-2">
          {LEARN.map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-2xl bg-zinc-50 px-5 py-4 shadow-sm border border-zinc-100">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm font-medium">{item}</span>
            </li>
          ))}
        </ul>
        
        <p className="mt-8 text-base font-medium text-muted-foreground">
          Tudo pensado para você impulsionar as vendas do seu negócio usando a Internet.
        </p>

        <div className="mt-10">
          <CTAButton label="É DISSO QUE EU PRECISO" className="bg-green-600 hover:bg-green-700 shadow-green-600/20" />
        </div>
      </section>

      {/* Audio Proof */}
      <Section title="Clique no áudio e escute o que meu aluno disse 😱" className="max-w-3xl">
        <div className="surface-card group relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl border-2 border-green-100 bg-white transition-all duration-300 hover:shadow-green-200/40">
          <div className="flex items-center gap-6">
            <button className="h-20 w-20 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center text-white shadow-xl shadow-green-500/30 transition-transform active:scale-95 group-hover:scale-105">
              <Play className="h-10 w-10 fill-current ml-1" />
            </button>
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
                     <div key={i} className={`w-0.5 bg-zinc-400 ${i % 3 === 0 ? 'h-full' : 'h-1/2'}`} />
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
          O método <span className="text-primary font-black">STARFLIX</span> é a sua ponte para o próximo nível.
        </p>
        <div className="mt-8 aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden shadow-xl border border-zinc-100">
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-muted-foreground">
            Foto/Prova Social do Aluno
          </div>
        </div>
        <div className="mt-8 text-center">
          <CTAButton label="Eu quero isso também" className="bg-green-600 hover:bg-green-700" />
        </div>
      </Section>

      {/* Nicho Proof (Carousel Placeholder) */}
      <Section title="SERÁ QUE FUNCIONA PRO SEU NICHO?">
        <p className="text-center text-muted-foreground -mt-4 mb-8">
          Se ainda tem dúvidas se funciona mesmo, olha o tanto de segmentos que eu já ajudei e hoje vendem muito 👇
        </p>
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
          {[1,2,3,4].map(i => (
            <div key={i} className="min-w-[280px] aspect-[4/5] rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm flex items-center justify-center text-muted-foreground">
              Print de Resultado {i}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center bg-zinc-50 border border-zinc-100 p-8 rounded-[2rem]">
          <p className="text-xl font-bold text-zinc-800">
            "Não importa o seu nicho, o tráfego pago é o oxigênio de qualquer negócio que quer crescer."
          </p>
          <p className="mt-4 text-muted-foreground">
            Já ajudei centenas de empresários a saírem do zero e atingirem resultados expressivos.
          </p>
        </div>
        <div className="mt-8 text-center">
          <CTAButton label="QUERO VENDER MUITO 🤩" className="bg-green-600 hover:bg-green-700" />
        </div>
      </Section>

      {/* Video Close */}
      <Section title="ASSISTA ESSE VÍDEO AQUI PRA VOCÊ ENTENDER:" className="max-w-4xl">
        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl relative group">
          <img 
            src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1200" 
            alt="Aula do curso"
            className="h-full w-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl mb-4 group-hover:scale-110 transition-transform">
              <Play className="h-10 w-10 fill-current ml-1" />
            </div>
            <span className="font-bold text-lg tracking-widest uppercase">Ver aula exclusiva</span>
          </div>
        </div>
        <div className="mt-10 text-center space-y-4">
          <h3 className="text-2xl font-bold">Você está pronto!</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em menos de 24hrs, você já pode estar fazendo anúncios do jeito certo, atraindo novos clientes e vendendo muito mais do que já vende hoje.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto italic">
            Tudo isso com estratégias testadas e validadas por centenas de alunos que venderam pela internet.
          </p>
          <div className="pt-6">
            <CTAButton label="Quero garantir essa oportunidade" className="bg-green-600 hover:bg-green-700 px-12" />
          </div>
        </div>
      </Section>

      {/* Objective */}
      <div className="mx-auto mt-20 max-w-2xl px-5 text-center">
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-4">🎯 Seu Objetivo:</h3>
          <p className="text-lg leading-relaxed italic">
            "Hoje você vai começar a fazer anúncios que realmente trazem clientes, usando as estratégias que eu aplico pra vender todo dia!"
          </p>
        </div>
      </div>

      {/* Bonus Card */}
      <Section title="🎁 Bônus que você recebe na STARFLIX:">
        <div className="bg-green-50 border border-green-100 rounded-3xl p-8 shadow-sm max-w-2xl mx-auto">
          <ul className="space-y-4">
            {BONUS.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-xl shrink-0">🎁</span>
                <span className="text-base font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Final Offer */}
      <section className="mx-auto mt-24 max-w-2xl px-5 text-center">
        <div className="surface-card relative overflow-hidden rounded-[2.5rem] border-2 border-primary/20 bg-zinc-50 p-10 shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary px-6 py-2 rounded-b-2xl shadow-lg">
             <span className="text-xs font-black text-white tracking-[0.2em] uppercase">⚡ OFERTA RELÂMPAGO</span>
          </div>
          
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-xl text-zinc-400 line-through">De R$ 497,00</span>
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">POR APENAS</span>
            <div className="flex flex-col items-center">
              <span className="text-7xl font-black text-primary leading-tight">R$ 197,00</span>
              <span className="text-xl font-bold text-zinc-900 mt-1">NO PIX</span>
            </div>
            <p className="text-lg font-medium text-muted-foreground mt-2">
              Ou 12x de R$ 20,35 no cartão
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              55% de DESCONTO para os próximos 50 alunos
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Clica no link e aproveita o desconto 👇
            </p>
            <CTAButton label="Garantir meu desconto" className="w-full sm:w-auto px-16 py-6 text-xl bg-green-600 hover:bg-green-700" />
          </div>
          
          <p className="mt-6 text-xs text-muted-foreground/60">
            Acesso imediato • Pagamento seguro • Vitalício
          </p>
        </div>
      </section>

      {/* WhatsApp Support */}
      <section className="mx-auto mt-20 max-w-2xl px-5 text-center">
        <h3 className="text-xl font-bold mb-6">AINDA ESTÁ COM DÚVIDAS?</h3>
        <a 
          href={whatsappLink("Olá! Tenho dúvidas sobre o Dono que Anuncia.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-5 transition-transform hover:scale-105 shadow-lg shadow-orange-500/20"
        >
          <MessageCircle className="h-6 w-6" />
          Fale comigo no WhatsApp
        </a>
      </section>
      
      {/* FAQ */}
      <Section title="Perguntas frequentes">
        <div className="grid gap-3 max-w-3xl mx-auto">
          {FAQ.map((item) => (
            <details key={item.q} className="surface-card group rounded-2xl px-5 py-4 border border-zinc-100 shadow-sm bg-zinc-50">
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

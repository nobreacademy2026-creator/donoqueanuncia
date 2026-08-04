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
    <main className="animate-rise-in bg-white pb-24 text-zinc-900 selection:bg-black selection:text-white">
      {/* Top Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-3 text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase sm:text-sm">
          ⚡ OPORTUNIDADE ÚNICA: VAISER A PAGINA DA PROMOÇÃO
        </p>
      </div>

      {/* Hero / Video Section */}
      <section className="mx-auto max-w-4xl px-5 pt-16 text-center">
        <h2 className="text-2xl font-black text-red-600 uppercase mb-8 sm:text-3xl leading-tight">
          ASSISTE ESSE VÍDEO AQUI PRA VOCÊ ENTENDER:
        </h2>

        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl relative group mb-10">
          <img 
            src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1200" 
            alt="Vídeo explicativo DONO QUE ANUNCIA"
            className="h-full w-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl mb-4 group-hover:scale-110 transition-transform">
              <Play className="h-10 w-10 fill-current ml-1" />
            </div>
            <span className="font-bold text-lg tracking-widest uppercase">Ver aula exclusiva</span>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-3xl font-black text-zinc-900 leading-tight">Você está pronto!</h3>
          <p className="text-lg text-zinc-800 leading-relaxed max-w-2xl mx-auto">
            Em <span className="text-red-600 font-bold">menos de 24hrs</span>, você já pode <span className="text-red-600 font-bold">estar fazendo anúncios</span> do jeito certo, atraindo novos clientes e vendendo muito mais do que já vende hoje.
          </p>
          <div className="bg-yellow-400 p-2 rounded-lg inline-block transform -rotate-1">
            <p className="text-sm font-black text-zinc-900 uppercase">
              Tudo isso com estratégias testadas e validadas por centenas de alunos que estão vendendo todos os dias!
            </p>
          </div>
        </div>

        <div className="mt-10">
          <CTAButton label="Quero garantir essa Oportunidade" className="bg-[#22c55e] hover:bg-[#16a34a] shadow-green-600/20 px-12 py-6 text-xl rounded-2xl" />
        </div>
      </section>

      {/* Objective */}
      <div className="mx-auto mt-20 max-w-2xl px-5 text-center">
        <div className="rounded-3xl p-8 border border-zinc-100 bg-white">
          <h3 className="text-xl font-black mb-4 flex items-center justify-center gap-2 uppercase">
            🎯 Seu Objetivo:
          </h3>
          <p className="text-lg leading-relaxed text-zinc-800 font-medium">
            Hoje você vai começar a fazer anúncios que realmente trazem clientes, <span className="text-red-600 font-bold italic">usando as estratégias que eu aplico pra vender todo dia!</span>
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
            <li key={item} className="flex items-start gap-3 rounded-2xl bg-zinc-50 px-5 py-4 shadow-sm border border-zinc-100">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#22c55e]" />
              <span className="text-sm font-medium">{item}</span>
            </li>
          ))}
        </ul>
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
          O método <span className="text-primary font-black">DONO QUE ANUNCIA</span> é a sua ponte para o próximo nível.
        </p>
        <div className="mt-8 aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden shadow-xl border border-zinc-100">
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-muted-foreground">
            Foto/Prova Social do Aluno
          </div>
        </div>
        <div className="mt-8 text-center">
          <CTAButton label="Eu quero isso também" className="bg-[#22c55e] hover:bg-[#16a34a] shadow-green-600/20" />
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
          <CTAButton label="QUERO VENDER MUITO 🤩" className="bg-[#22c55e] hover:bg-[#16a34a] shadow-green-600/20" />
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
                Todas as <strong>aulas adicionadas</strong> durante o ano você <strong>não pagará</strong> nada.
              </span>
            </li>
          </ul>
          <p className="mt-8 text-sm text-zinc-700 font-medium">
            Tudo pensado para você <strong>Impulsionar as vendas</strong> do seu negócio usando a Internet.
          </p>
        </div>
      </Section>

      {/* Final Offer */}
      <section className="mx-auto mt-24 max-w-2xl px-5 text-center">
        <div className="surface-card relative overflow-hidden rounded-[2.5rem] border-2 border-zinc-200 bg-white p-10 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>
          <div className="mb-4 flex justify-center">
            <img 
              src="https://img.freepik.com/vector-premium/oferta-relampago-etiqueta-venda-relampago_624938-1036.jpg" 
              alt="Oferta Relâmpago" 
              className="h-28 object-contain"
            />
          </div>
          
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-xl text-zinc-400 line-through">De R$ 497,00</span>
            <span className="text-red-600 font-black text-2xl uppercase">POR APENAS</span>
            <div className="flex flex-col items-center bg-white border-2 border-[#22c55e] rounded-3xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] transform scale-110 my-4">
               <span className="text-7xl font-black text-[#22c55e] leading-tight">R$ 197,00</span>
               <span className="text-xl font-bold text-zinc-900 mt-1 flex items-center gap-1 uppercase">No pix <img src="https://logopng.com.br/logos/pix-106.png" className="h-5 object-contain" alt="Pix" /></span>
            </div>
            <p className="text-lg font-medium text-muted-foreground mt-2">
              Ou 12x de R$ 20,35 no cartão
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              55% de DESCONTO para os próximos 50 alunos
            </div>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-2">
              Isso aqui não é gatilho mental, olhe no link da minha bio e veja que o treinamento tem valor de 497,00.
            </p>
            <p className="text-sm font-black text-green-600 animate-bounce">
              Clica no link e aproveita o desconto 👇
            </p>
            <CTAButton label="Garantir com desconto" className="w-full sm:w-auto px-16 py-6 text-xl bg-[#00a34c] hover:bg-[#008f42] border-b-4 border-[#006b31] active:border-b-0 active:translate-y-1" />
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
          className="inline-flex items-center gap-3 rounded-2xl bg-[#ffb900] hover:bg-[#e6a600] text-white font-black px-12 py-5 transition-transform hover:scale-105 shadow-lg shadow-yellow-500/20 uppercase"
        >
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

import {
  Award,
  BadgeCheck,
  Check,
  ChevronDown,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Star,
  Target,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { CHECKOUT_URL, trackCheckoutClick } from "@/lib/tracking";
import professorImg from "@/assets/rogerio-nobre.jpg";

const BENEFITS = [
  { icon: Megaphone, title: "Anúncios que vendem", text: "Crie campanhas que trazem clientes reais, não apenas curtidas." },
  { icon: Target, title: "Público certo", text: "Aprenda a segmentar quem realmente compra do seu negócio." },
  { icon: Wallet, title: "Menos desperdício", text: "Pare de queimar orçamento com impulsionamentos aleatórios." },
  { icon: MessageCircle, title: "WhatsApp cheio", text: "Transforme anúncios em conversas e conversas em vendas." },
];

const LEARN = [
  "Estrutura de campanha do zero no Gerenciador de Anúncios",
  "Como escrever criativos e copys que param o dedo",
  "Segmentação prática por bairro, interesse e comportamento",
  "Construção de oferta irresistível para o seu segmento",
  "Métricas que importam: CPL, CPA, ROAS sem complicação",
  "Rotina semanal de otimização em 30 minutos",
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

function CTAButton({ label = "QUERO ME TORNAR UM DONO QUE ANUNCIA" }: { label?: string }) {
  return (
    <a
      href={CHECKOUT_URL}
      onClick={() => trackCheckoutClick({ origem: "pagina_vendas" })}
      className="gradient-primary glow-primary inline-flex items-center justify-center rounded-2xl px-8 py-4 text-center text-sm font-bold tracking-wide text-primary-foreground transition-transform duration-200 hover:scale-[1.02] sm:text-base"
    >
      {label}
    </a>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-20 w-full max-w-5xl px-5">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function SalesPage() {
  return (
    <main className="animate-rise-in pb-24">
      {/* Top Banner / Auto Top */}
      <div className="bg-primary/10 border-b border-primary/20 py-3 text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase sm:text-sm">
          ⚡ OPORTUNIDADE ÚNICA: {firstName || "DONO"}, SEU DIAGNÓSTICO ESTÁ PRONTO!
        </p>
      </div>

      <section className="mx-auto max-w-3xl px-5 pt-16 text-center">
        {firstName ? (
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            {firstName}, seu plano está a caminho
          </p>
        ) : null}
        <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Aprenda o método que ensina empresários a anunciar e{" "}
          <span className="text-gradient-primary">conquistar clientes todos os dias.</span>
        </h1>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          Mesmo que você nunca tenha criado um anúncio.
        </p>
        
        <div className="surface-card mt-8 rounded-3xl border-primary/20 p-8 text-center sm:p-10">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase opacity-60">
            OFERTA EXCLUSIVA
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <span className="text-xl text-muted-foreground line-through opacity-50">De R$ 399,00</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">Por apenas</span>
              <span className="text-5xl font-black text-primary">R$ 197,00</span>
            </div>
          </div>
          <div className="mt-8">
            <CTAButton label="QUERO APROVEITAR O DESCONTO E IR PARA O CHECKOUT" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            *Pagamento único, acesso imediato e vitalício.
          </p>
        </div>
      </section>

      <Section title="Benefícios do curso">
        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="surface-card rounded-2xl p-6">
              <b.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="O que você vai aprender">
        <ul className="grid gap-3 sm:grid-cols-2">
          {LEARN.map((item) => (
            <li key={item} className="surface-card flex items-start gap-3 rounded-2xl px-5 py-4">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Para quem é">
        <ul className="grid gap-3 sm:grid-cols-2">
          {FOR_WHO.map((item) => (
            <li key={item} className="surface-card flex items-start gap-3 rounded-2xl px-5 py-4">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Diferenciais">
        <div className="grid gap-4 sm:grid-cols-3">
          {DIFFERENTIALS.map((d) => (
            <div key={d.title} className="surface-card rounded-2xl p-6">
              <d.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-base font-semibold">{d.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Sobre o professor">
        <div className="surface-card grid gap-6 rounded-3xl p-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:p-8">
          <img
            src={professorImg}
            alt="Rogério Nobre, professor do curso Dono que Anuncia"
            loading="lazy"
            className="h-48 w-full rounded-2xl object-cover sm:h-52"
          />
          <div className="min-w-0">
            <h3 className="text-xl font-semibold">Rogério Nobre</h3>
            <p className="mt-1 text-sm text-primary">Fundador da Nobre Academy</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Especialista em tráfego pago para pequenos negócios, Rogério já ajudou centenas de
              empresários a transformar anúncios em clientes reais. Sua missão é simples: tirar o dono do
              negócio da dependência de agências e colocar o controle das vendas nas mãos de quem mais
              se importa com o resultado.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Depoimentos">
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="surface-card rounded-2xl p-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-current text-primary" />
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{t.text}</p>
              <p className="mt-5 text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Garantia">
        <div className="surface-card flex flex-col items-start gap-4 rounded-3xl p-8 sm:flex-row sm:items-center">
          <ShieldCheck className="h-10 w-10 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">7 dias de garantia incondicional.</strong> Assista às
            aulas, aplique o método e, se por qualquer motivo você achar que não é para você, devolvemos
            100% do seu investimento. O risco é todo nosso.
          </p>
        </div>
      </Section>

      <Section title="Perguntas frequentes">
        <div className="grid gap-3">
          {FAQ.map((item) => (
            <details key={item.q} className="surface-card group rounded-2xl px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <section className="mx-auto mt-24 max-w-3xl px-5 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">
          Seus concorrentes já estão anunciando. <span className="text-gradient-primary">E você?</span>
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Assista ao vídeo abaixo e veja como começar hoje mesmo.
        </p>

        {/* Video Placeholder */}
        <div className="mt-10 aspect-video w-full overflow-hidden rounded-3xl bg-muted ring-1 ring-white/10">
          <div className="flex h-full w-full items-center justify-center bg-zinc-900/50">
            <p className="text-sm text-muted-foreground">Vídeo de vendas aqui</p>
          </div>
        </div>

        <div className="mt-12">
          <CTAButton label="IR PARA O CHECKOUT E GARANTIR MINHA VAGA" />
        </div>
      </section>
    </main>
  );
}
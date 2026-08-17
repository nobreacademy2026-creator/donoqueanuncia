import type { FunnelDraft } from "./funnel-content";

export type FunnelTemplate = {
  id: string;
  name: string;
  category: string;
  icon: string;
  coverImage: string;
  description: string;
  draft: Pick<FunnelDraft, "steps" | "sales">;
};

function template(
  id: string,
  name: string,
  category: string,
  icon: string,
  description: string,
  content: {
    intro: [string, string];
    pain: [string, string[]];
    motivation: [string, string[]];
    objection: string;
    benefits: string;
    audio: string;
    niche: string;
    video: string;
    prices: [string, string];
  },
): FunnelTemplate {
  const coverImage = `/templates/${id}.png`;

  return {
    id,
    name,
    category,
    icon,
    coverImage,
    description,
    draft: {
      steps: {
        intro: { title: content.intro[0], description: content.intro[1], image: coverImage },
        dor: { title: content.pain[0], options: content.pain[1], image: coverImage },
        motivacao: {
          title: content.motivation[0],
          options: content.motivation[1],
          image: coverImage,
        },
        objecao: { title: content.objection, image: coverImage },
        beneficios: { title: content.benefits, image: coverImage },
        audio: {
          title: content.audio,
          image: coverImage,
          options: ["Nome do cliente", "Resultado alcançado", "Antes", "Depois"],
        },
        niche: { title: content.niche, image: coverImage, images: [coverImage] },
        sales_vsl: { title: content.video },
        sales_vsl_video: { image: coverImage },
        sales_offer: { options: [content.prices[0], content.prices[1], ""] },
        sales_testimonial: {
          image: coverImage,
          title: "Veja o que aconteceu com quem decidiu começar",
          options: ["Nome do cliente", "Segmento / resultado"],
        },
        sales_instagram: { title: "Veja mais um resultado real", image: coverImage },
      },
      sales: {
        videoHeadline: content.video,
        videoThumb: coverImage,
        promoPrice: content.prices[0],
        fullPrice: content.prices[1],
      },
    },
  };
}

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  template(
    "local-business",
    "Negócios locais",
    "Lojas e comércio",
    "🏪",
    "Para lojas, mercados e empresas que precisam atrair clientes da própria região.",
    {
      intro: [
        "Descubra como atrair mais clientes para o seu negócio local",
        "Responda a duas perguntas e veja o caminho mais rápido para aumentar seu movimento.",
      ],
      pain: [
        "Qual é o maior desafio do seu negócio hoje?",
        [
          "Poucas pessoas entram em contato.",
          "Até tenho movimento, mas vendo pouco.",
          "Dependo demais de indicação.",
        ],
      ],
      motivation: [
        "O que você mais deseja conquistar?",
        [
          "Mais clientes todos os dias.",
          "Vendas previsíveis todo mês.",
          "Ser conhecido na minha cidade.",
        ],
      ],
      objection: "Você não precisa depender apenas de indicação para vender",
      benefits: "Existe uma forma simples de aparecer para as pessoas certas da sua região",
      audio: "Ouça o resultado de quem começou a anunciar do jeito certo",
      niche: "Funciona para o seu tipo de negócio local?",
      video: "Assista e descubra como transformar anúncios em clientes reais",
      prices: ["R$ 197,00", "R$ 399,00"],
    },
  ),
  template(
    "beauty",
    "Estética e beleza",
    "Salões e profissionais",
    "✨",
    "Para salões, clínicas de estética, manicures e profissionais da beleza.",
    {
      intro: [
        "Descubra como lotar sua agenda de clientes",
        "Faça o diagnóstico rápido e veja o que está impedindo sua agenda de crescer.",
      ],
      pain: [
        "O que mais atrapalha sua agenda?",
        [
          "Tenho muitos horários vazios.",
          "Clientes não voltam com frequência.",
          "As pessoas pedem preço e somem.",
        ],
      ],
      motivation: [
        "Qual resultado faria mais diferença agora?",
        ["Agenda cheia toda semana.", "Clientes recorrentes.", "Vender serviços de maior valor."],
      ],
      objection: "Agenda vazia não significa falta de clientes na sua cidade",
      benefits: "Você pode atrair pessoas prontas para agendar, sem viver de promoções",
      audio: "Escute quem transformou seguidores em horários preenchidos",
      niche: "Esse método também funciona para o seu procedimento",
      video: "Veja como criar uma agenda previsível usando a internet",
      prices: ["R$ 147,00", "R$ 297,00"],
    },
  ),
  template(
    "food",
    "Restaurante e delivery",
    "Alimentação",
    "🍽️",
    "Para restaurantes, lanchonetes, pizzarias, cafeterias e delivery.",
    {
      intro: [
        "Descubra como aumentar seus pedidos ainda esta semana",
        "Responda ao diagnóstico e veja como trazer mais clientes nos dias de pouco movimento.",
      ],
      pain: [
        "Qual é seu maior problema atualmente?",
        [
          "Poucos pedidos durante a semana.",
          "Dependo dos aplicativos.",
          "Meus clientes compram só em promoção.",
        ],
      ],
      motivation: [
        "Qual é sua prioridade?",
        ["Aumentar pedidos no WhatsApp.", "Encher o salão.", "Fidelizar quem já comprou."],
      ],
      objection: "Você não precisa entregar toda a sua margem para os aplicativos",
      benefits: "É possível gerar pedidos diretos e trazer clientes de volta com frequência",
      audio: "Ouça o resultado de quem aumentou os pedidos diretos",
      niche: "Serve para restaurante, lanchonete, pizzaria e muito mais",
      video: "Assista e veja como vender mais sem depender apenas dos aplicativos",
      prices: ["R$ 197,00", "R$ 397,00"],
    },
  ),
  template(
    "health",
    "Clínicas e saúde",
    "Saúde e bem-estar",
    "🩺",
    "Para clínicas, consultórios e profissionais que trabalham com agendamento.",
    {
      intro: [
        "Descubra como atrair mais pacientes para sua clínica",
        "Faça um diagnóstico rápido da sua captação e identifique sua maior oportunidade.",
      ],
      pain: [
        "Qual cenário mais parece com sua clínica?",
        ["Agenda com muitos espaços.", "Poucos pacientes novos.", "Muitos contatos não agendam."],
      ],
      motivation: [
        "Qual objetivo você quer alcançar?",
        ["Mais avaliações agendadas.", "Agenda previsível.", "Atrair o paciente ideal."],
      ],
      objection: "Uma boa estrutura sozinha não garante uma agenda cheia",
      benefits: "Com a comunicação certa, sua clínica pode atrair pacientes mais preparados",
      audio: "Escute o depoimento de quem passou a receber novos agendamentos",
      niche: "A estratégia se adapta à sua especialidade",
      video: "Entenda como transformar interesse em agendamentos qualificados",
      prices: ["R$ 297,00", "R$ 597,00"],
    },
  ),
  template(
    "services",
    "Prestadores de serviço",
    "Serviços profissionais",
    "🛠️",
    "Para profissionais autônomos, empresas de serviço e especialistas locais.",
    {
      intro: [
        "Descubra como receber mais pedidos de orçamento",
        "Responda rapidamente e veja como conquistar clientes sem depender só de indicação.",
      ],
      pain: [
        "Qual é sua maior dificuldade para vender?",
        [
          "Recebo poucos pedidos de orçamento.",
          "As pessoas só procuram menor preço.",
          "Meu faturamento é instável.",
        ],
      ],
      motivation: [
        "O que você busca para seu serviço?",
        [
          "Mais contratos fechados.",
          "Clientes que valorizam qualidade.",
          "Previsibilidade de faturamento.",
        ],
      ],
      objection: "Seu serviço pode ser excelente e ainda assim passar despercebido",
      benefits: "A estratégia certa posiciona seu valor antes mesmo do orçamento",
      audio: "Ouça quem deixou de depender apenas de indicação",
      niche: "Funciona para diferentes tipos de serviço",
      video: "Veja como atrair e converter clientes que valorizam seu trabalho",
      prices: ["R$ 197,00", "R$ 497,00"],
    },
  ),
  template(
    "education",
    "Cursos e mentorias",
    "Produtos digitais",
    "🎓",
    "Para especialistas que vendem cursos, consultorias, mentorias ou comunidades.",
    {
      intro: [
        "Descubra o próximo passo para acelerar seu resultado",
        "Responda ao diagnóstico e receba uma recomendação de acordo com seu momento.",
      ],
      pain: [
        "O que mais impede você de avançar?",
        [
          "Não sei qual estratégia seguir.",
          "Já tentei sozinho e não funcionou.",
          "Falta tempo para organizar tudo.",
        ],
      ],
      motivation: [
        "Por que você quer resolver isso agora?",
        [
          "Quero resultados mais rápidos.",
          "Preciso de um método comprovado.",
          "Quero acompanhamento especializado.",
        ],
      ],
      objection: "Você não precisa continuar tentando descobrir tudo sozinho",
      benefits: "Um método organizado encurta o caminho e evita os erros mais caros",
      audio: "Escute a experiência de quem aplicou o método",
      niche: "O método funciona mesmo para quem está começando?",
      video: "Assista à apresentação e veja como alcançar seu próximo nível",
      prices: ["R$ 297,00", "R$ 697,00"],
    },
  ),
];

export function applyFunnelTemplate(current: FunnelDraft, selected: FunnelTemplate): FunnelDraft {
  const steps = { ...current.steps };

  for (const [id, templateStep] of Object.entries(selected.draft.steps)) {
    steps[id] = {
      ...templateStep,
    };
  }

  const currentCheckout =
    current.sales.checkoutUrl || current.steps["sales_offer"]?.options?.[2] || "";
  const offerStep = steps["sales_offer"];
  if (offerStep?.options) {
    steps["sales_offer"] = {
      ...offerStep,
      options: [offerStep.options[0] ?? "", offerStep.options[1] ?? "", currentCheckout],
    };
  }

  const protectedSales = {
    checkoutUrl: current.sales.checkoutUrl,
    whatsappNumber: current.sales.whatsappNumber,
    whatsappMessage: current.sales.whatsappMessage,
    vslUrl: current.sales.vslUrl,
  };

  return {
    steps,
    sales: {
      ...current.sales,
      ...selected.draft.sales,
      ...Object.fromEntries(Object.entries(protectedSales).filter(([, value]) => value)),
    },
    tracking: { ...current.tracking },
  };
}

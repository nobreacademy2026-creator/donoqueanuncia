export type Question = {
  id: string;
  title: string;
  image?: string;
  options: { label: string; value: string; score: number }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "dor",
    title: "O que mais te impede de vender todos os dias usando anúncios hoje?",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Não sei configurar as ferramentas.", value: "configuracao", score: 30 },
      { label: "Meus anúncios não trazem clientes qualificados.", value: "qualificacao", score: 45 },
    ],
  },
  {
    id: "dor_2",
    title: "Qual é o seu maior medo ao investir em tráfego pago?",
    image: "https://images.unsplash.com/photo-1554224155-16974a4ea2bf?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Gastar dinheiro e não ter retorno.", value: "perda", score: 35 },
      { label: "Ficar dependente de agências.", value: "dependencia", score: 50 },
    ],
  },
  {
    id: "motivacao",
    title: "Qual é o seu maior objetivo com o tráfego pago hoje?",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Escalar meu faturamento atual.", value: "escala", score: 85 },
      { label: "Parar de depender de indicações.", value: "independencia", score: 75 },
    ],
  },
  {
    id: "motivacao_2",
    title: "Como você imagina seu negócio daqui a 6 meses?",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Com uma máquina de vendas automática.", value: "automatizacao", score: 90 },
      { label: "Com mais seguidores e marca forte.", value: "branding", score: 65 },
    ],
  },
  {
    id: "perfil",
    title: "Atualmente, você já faz algum tipo de anúncio?",
    image: "https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Sim, eu mesmo faço ou tenho agência.", value: "sim", score: 70 },
      { label: "Não, ainda não comecei.", value: "nao", score: 40 },
    ],
  },
  {
    id: "perfil_2",
    title: "Quanto você estaria disposto a investir para escalar?",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Menos de R$ 1.000 / mês", value: "baixo", score: 50 },
      { label: "Acima de R$ 1.000 / mês", value: "alto", score: 80 },
    ],
  },
];

export type Answers = Record<string, string>;

export function calculateScore(answers: Answers) {
  const scores = QUESTIONS.map((q) => {
    const chosen = q.options.find((o) => o.value === answers[q.id]);
    return chosen?.score ?? 50;
  });
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.max(28, Math.min(96, Math.round(avg)));
}

export function calculatePillars(answers: Answers, score: number) {
  const jitter = (n: number) => Math.max(15, Math.min(95, Math.round(score + n)));
  const obj = answers["objetivo"];
  return [
    { pilar: "Criativo", valor: jitter(obj === "paradas" ? -15 : -6) },
    { pilar: "Segmentação", valor: jitter(obj === "clientes" ? -10 : -5) },
    { pilar: "Oferta", valor: jitter(answers["desanima"] === "resultado" ? -20 : -4) },
    { pilar: "Estratégia", valor: jitter(answers["como"] === "gerenciador" ? 2 : -18) },
  ];
}

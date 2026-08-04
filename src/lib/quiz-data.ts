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
      { label: "Sinto que estou jogando dinheiro fora.", value: "dinheiro", score: 35 },
      { label: "Não tenho tempo para gerenciar.", value: "tempo", score: 50 },
    ],
  },
  {
    id: "motivacao",
    title: "Qual é o seu maior objetivo com o tráfego pago hoje?",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Escalar meu faturamento atual.", value: "escala", score: 85 },
      { label: "Parar de depender de indicações.", value: "independencia", score: 75 },
      { label: "Criar uma máquina de vendas automática.", value: "automatizacao", score: 90 },
      { label: "Apenas começar do jeito certo.", value: "comecar", score: 60 },
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
  return [
    { pilar: "Criativo", valor: jitter(answers["dor"] === "dinheiro" ? -15 : -5) },
    { pilar: "Segmentação", valor: jitter(answers["motivacao"] === "escala" ? 10 : -8) },
    { pilar: "Oferta", valor: jitter(answers["dor"] === "qualificacao" ? -20 : -4) },
    { pilar: "Estratégia", valor: jitter(answers["motivacao"] === "automatizacao" ? 15 : -12) },
  ];
}

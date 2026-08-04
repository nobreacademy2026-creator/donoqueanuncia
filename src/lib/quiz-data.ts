export type Question = {
  id: string;
  title: string;
  image?: string;
  options: { label: string; value: string; score: number }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "dor",
    title: "Na hora de fazer seus anúncios patrocinados, o que mais te desanima?",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Não saber por onde começar.", value: "comecar", score: 30 },
      { label: "Gastar e não ver resultado.", value: "resultado", score: 45 },
    ],
  },
  {
    id: "motivacao",
    title: "Porque você sente que precisa fazer anúncios?",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Porque preciso de mais clientes todos os dias.", value: "clientes", score: 70 },
      { label: "Porque minhas vendas estão paradas.", value: "paradas", score: 60 },
      { label: "Porque quero fazer meu negócio crescer de verdade.", value: "crescer", score: 85 },
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
    { pilar: "Criativo", valor: jitter(answers["dor"] === "resultado" ? -15 : 5) },
    { pilar: "Segmentação", valor: jitter(answers["motivacao"] === "clientes" ? -10 : 8) },
    { pilar: "Oferta", valor: jitter(answers["motivacao"] === "crescer" ? 10 : -5) },
    { pilar: "Estratégia", valor: jitter(answers["dor"] === "comecar" ? -20 : 12) },
  ];
}

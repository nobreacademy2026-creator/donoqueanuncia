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
    id: "objetivo",
    title: "Por que você sente que precisa fazer anúncios?",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Porque preciso de mais clientes todos os dias.", value: "clientes", score: 70 },
      { label: "Porque minhas vendas estão paradas.", value: "paradas", score: 60 },
      { label: "Porque quero fazer meu negócio crescer de verdade.", value: "crescer", score: 85 },
    ],
  },
  {
    id: "segmento",
    title: "Qual é o seu segmento?",
    image: "https://images.unsplash.com/photo-1556740734-7f9a2b77098c?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Loja Física", value: "loja_fisica", score: 60 },
      { label: "Loja Online", value: "loja_online", score: 70 },
      { label: "Prestador de Serviço", value: "servico", score: 65 },
      { label: "Clínica", value: "clinica", score: 72 },
      { label: "Restaurante", value: "restaurante", score: 62 },
      { label: "Outro", value: "outro", score: 58 },
    ],
  },
  {
    id: "anuncia",
    title: "Você anuncia atualmente?",
    image: "https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Sim", value: "sim", score: 78 },
      { label: "Não", value: "nao", score: 40 },
    ],
  },
  {
    id: "como",
    title: "Como você anuncia?",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Impulsiono publicações", value: "impulsiono", score: 45 },
      { label: "Gerenciador de Anúncios", value: "gerenciador", score: 82 },
      { label: "Agência", value: "agencia", score: 70 },
      { label: "Nunca anunciei", value: "nunca", score: 30 },
    ],
  },
  {
    id: "investimento",
    title: "Quanto você investe por mês?",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Até R$300", value: "ate_300", score: 45 },
      { label: "R$300 a R$1.000", value: "300_1000", score: 62 },
      { label: "R$1.000 a R$5.000", value: "1000_5000", score: 78 },
      { label: "Acima de R$5.000", value: "acima_5000", score: 88 },
    ],
  },
  {
    id: "tempo_empresa",
    title: "Há quanto tempo sua empresa existe?",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Menos de 1 ano", value: "menos_1", score: 50 },
      { label: "1 a 3 anos", value: "1_3", score: 65 },
      { label: "3 a 10 anos", value: "3_10", score: 76 },
      { label: "Mais de 10 anos", value: "mais_10", score: 84 },
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
    { pilar: "Segmentação", valor: jitter(answers["objetivo"] === "clientes" ? -10 : 8) },
    { pilar: "Oferta", valor: jitter(answers["como"] === "impulsiono" ? -20 : 10) },
    { pilar: "Estratégia", valor: jitter(answers["anuncia"] === "nao" ? -25 : 12) },
  ];
}

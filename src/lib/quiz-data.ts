export type Question = {
  id: string;
  title: string;
  image?: string;
  options: { label: string; value: string; score: number }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "segmento",
    title: "Qual é o seu segmento?",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Sim", value: "sim", score: 78 },
      { label: "Não", value: "nao", score: 40 },
    ],
  },
  {
    id: "como",
    title: "Como você anuncia?",
    image: "https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Impulsiono publicações", value: "impulsiono", score: 45 },
      { label: "Gerenciador de Anúncios", value: "gerenciador", score: 82 },
      { label: "Agência", value: "agencia", score: 70 },
      { label: "Nunca anunciei", value: "nunca", score: 30 },
    ],
  },
  {
    id: "objetivo",
    title: "Qual seu maior objetivo?",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    options: [
      { label: "Mais clientes", value: "clientes", score: 65 },
      { label: "Mais vendas", value: "vendas", score: 68 },
      { label: "Mais mensagens no WhatsApp", value: "whatsapp", score: 72 },
      { label: "Mais visitas à loja", value: "visitas", score: 64 },
    ],
  },
  {
    id: "investimento",
    title: "Quanto você investe por mês?",
    options: [
      { label: "Até R$300", value: "ate_300", score: 45 },
      { label: "R$300 a R$1.000", value: "300_1000", score: 62 },
      { label: "R$1.000 a R$5.000", value: "1000_5000", score: 78 },
      { label: "Acima de R$5.000", value: "acima_5000", score: 88 },
    ],
  },
  {
    id: "dificuldade",
    title: "Qual é sua maior dificuldade?",
    options: [
      { label: "Não sei criar anúncios", value: "criar", score: 40 },
      { label: "Não sei para quem anunciar", value: "publico", score: 45 },
      { label: "Gasto dinheiro e não vendo", value: "gasto", score: 50 },
      { label: "Não tenho tempo", value: "tempo", score: 58 },
    ],
  },
  {
    id: "tempo_empresa",
    title: "Há quanto tempo sua empresa existe?",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800",
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
  const d = answers["dificuldade"];
  return [
    { pilar: "Criativo", valor: jitter(d === "criar" ? -22 : -6) },
    { pilar: "Segmentação", valor: jitter(d === "publico" ? -25 : -10) },
    { pilar: "Oferta", valor: jitter(d === "gasto" ? -20 : -4) },
    { pilar: "Estratégia", valor: jitter(answers["como"] === "gerenciador" ? 2 : -18) },
  ];
}
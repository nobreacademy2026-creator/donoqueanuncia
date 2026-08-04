import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { QUESTIONS, calculatePillars, calculateScore, type Answers } from "@/lib/quiz-data";
import { trackEvent } from "@/lib/tracking";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizIntro } from "@/components/quiz/QuizIntro";
import { QuestionStep } from "@/components/quiz/QuestionStep";
import { AnalyzingStep } from "@/components/quiz/AnalyzingStep";
import { ResultStep } from "@/components/quiz/ResultStep";
import { SalesPage } from "@/components/sales/SalesPage";

const TITLE = "Dono que Anuncia — Diagnóstico gratuito de anúncios";
const DESCRIPTION =
  "Descubra em 2 minutos por que seus anúncios não trazem clientes. Faça o diagnóstico gratuito e receba um plano personalizado para o seu negócio.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Dono que Anuncia",
          description: DESCRIPTION,
          provider: { "@type": "Organization", name: "Dono que Anuncia" },
        }),
      },
    ],
  }),
  component: Index,
});

type Stage = "intro" | "quiz" | "analyzing" | "result" | "sales";

function Index() {
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const score = useMemo(() => calculateScore(answers), [answers]);
  const pillars = useMemo(() => calculatePillars(answers, score), [answers, score]);

  const progress =
    stage === "intro" ? 0 : stage === "quiz" ? (step / QUESTIONS.length) * 100 : 100;

  function handleSelect(value: string) {
    const question = QUESTIONS[step]!;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    trackEvent("quiz_resposta", { pergunta: question.id, resposta: value });
    setTimeout(() => {
      if (step + 1 >= QUESTIONS.length) {
        setStage("analyzing");
        trackEvent("quiz_concluido");
      } else {
        setStep(step + 1);
      }
    }, 220);
  }

  function handleBack() {
    if (step === 0) setStage("intro");
    else setStep(step - 1);
  }

  if (stage === "sales") {
    return (
      <div className="min-h-screen bg-white">
        <SalesPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-primary selection:text-white">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-zinc-100">
        <div className="mx-auto max-w-2xl px-5 py-4">
          <QuizProgress value={progress} />
        </div>
      </div>

      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center px-5 py-10">
        {stage === "intro" ? (
          <QuizIntro
            onStart={() => {
              trackEvent("quiz_iniciado");
              setStage("quiz");
            }}
          />
        ) : null}

        {stage === "quiz" ? (
          <QuestionStep
            question={QUESTIONS[step]!}
            index={step}
            total={QUESTIONS.length}
            {...(answers[QUESTIONS[step]!.id] ? { selected: answers[QUESTIONS[step]!.id] } : {})}
            onSelect={handleSelect}
            onBack={handleBack}
          />
        ) : null}

        {stage === "analyzing" ? <AnalyzingStep onDone={() => setStage("result")} /> : null}

        {stage === "result" ? (
          <div className="w-full">
            <ResultStep score={score} pillars={pillars} />
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => {
                  setStage("sales");
                  window.scrollTo({ top: 0 });
                }}
                className="bg-green-600 hover:bg-green-700 glow-primary inline-flex items-center gap-2 rounded-2xl px-12 py-5 text-xl font-bold text-white transition-transform duration-200 hover:scale-[1.03] shadow-lg shadow-green-600/20"
              >
                Vou dominar isso agora
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

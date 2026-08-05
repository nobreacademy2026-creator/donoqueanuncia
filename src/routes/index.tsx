import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { QUESTIONS, calculatePillars, calculateScore, type Answers } from "@/lib/quiz-data";
import { trackEvent } from "@/lib/tracking";
import { useFunnelDraft } from "@/lib/funnel-content";
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
  const draft = useFunnelDraft();

  const questions = useMemo(
    () =>
      QUESTIONS.map((q) => {
        const override = draft.steps[q.id];
        if (!override) return q;
        return {
          ...q,
          ...(override.title ? { title: override.title } : {}),
          ...(override.image ? { image: override.image } : {}),
          options: q.options.map((option, i) => {
            const label = override.options?.[i];
            return label ? { ...option, label } : option;
          }),
        };
      }),
    [draft],
  );

  // Mantém o passo válido caso as perguntas mudem durante a edição ao vivo
  useEffect(() => {
    if (step > questions.length - 1) setStep(Math.max(0, questions.length - 1));
  }, [questions.length, step]);

  const score = useMemo(() => calculateScore(answers), [answers]);
  const pillars = useMemo(() => calculatePillars(answers, score), [answers, score]);

  const progress =
    stage === "intro"
      ? 0
      : stage === "quiz"
        ? ((step + (answers[questions[step]!.id] ? 1 : 0)) / questions.length) * 100
        : 100;

  function handleSelect(value: string) {
    const question = questions[step]!;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    trackEvent("quiz_resposta", { pergunta: question.id, resposta: value });
    setTimeout(() => {
      if (step + 1 >= questions.length) {
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
    return <SalesPage draft={draft.sales} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-primary selection:text-white">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-zinc-100">
        <div className="mx-auto max-w-2xl px-5 py-4 flex items-center justify-center">
          <div className="flex-1 max-w-md">
            <QuizProgress value={progress} />
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-start justify-center px-5 pt-0 pb-6">
        {stage === "intro" ? (
          <QuizIntro
            draft={draft.steps['intro']}
            onStart={() => {
              trackEvent("quiz_iniciado");
              setStage("quiz");
            }}
          />
        ) : null}

        {stage === "quiz" ? (
          <QuestionStep
            question={questions[step]!}
            index={step}
            total={questions.length}
            {...(answers[questions[step]!.id] ? { selected: answers[questions[step]!.id] } : {})}
            onSelect={handleSelect}
            onBack={handleBack}
          />
        ) : null}

        {stage === "analyzing" ? <AnalyzingStep onDone={() => setStage("result")} /> : null}

        {stage === "result" ? (
          <div className="w-full">
            <ResultStep 
              onNext={() => {
                setStage("sales");
                window.scrollTo({ top: 0 });
              }} 
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
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
        const base = {
          ...q,
          ...(override?.title ? { title: override.title } : {}),
          options: q.options.map((option, i) => {
            const label = override?.options?.[i];
            return label ? { ...option, label } : option;
          }),
        };

        // If draft has an image (even empty string to remove), use it.
        // If draft is missing this step entirely, use the original question image.
        if (override && override.image !== undefined) {
          return { ...base, image: override.image };
        }

        return base;
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
    const metaPixelId = draft.tracking?.metaPixelId;
    const ga4Id = draft.tracking?.ga4Id;
    const gtmId = draft.tracking?.gtmId;

    return (
      <>
        {metaPixelId && (
          <script id="fb-pixel">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </script>
        )}
        {ga4Id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>
            <script id="ga4">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}');
              `}
            </script>
          </>
        )}
        {gtmId && (
          <script id="gtm">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </script>
        )}
        <SalesPage
          draft={{
            ...draft.sales,
            ...(draft.steps["sales_vsl"]?.title ? { videoHeadline: draft.steps["sales_vsl"].title } : {}),
            ...(draft.steps["sales_vsl_video"]?.image
              ? /\.(mp4|webm|ogg|mov)(?:\?|$)/i.test(draft.steps["sales_vsl_video"].image)
                ? { vslUrl: draft.steps["sales_vsl_video"].image }
                : { videoThumb: draft.steps["sales_vsl_video"].image }
              : {}),
            ...(draft.steps["sales_offer"]?.options?.[0] ? { promoPrice: draft.steps["sales_offer"].options[0] } : {}),
            ...(draft.steps["sales_offer"]?.options?.[1] ? { fullPrice: draft.steps["sales_offer"].options[1] } : {}),
            ...(draft.steps["sales_offer"]?.options?.[2] ? { checkoutUrl: draft.steps["sales_offer"].options[2] } : {}),
          }}
          tracking={draft.tracking}
          steps={draft.steps}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Fallback visual sutil para dados em carregamento ou erro */}
      {!draft.steps["intro"] && stage === "intro" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-zinc-900 p-6 text-center">
          <div className="mb-6 flex flex-col items-center animate-pulse">
            <div className="h-20 w-48 bg-zinc-100 rounded-lg mb-4"></div>
            <div className="h-4 w-64 bg-zinc-100 rounded mb-2"></div>
            <div className="h-4 w-48 bg-zinc-100 rounded"></div>
          </div>
          <p className="text-zinc-500 text-sm">Sincronizando diagnóstico...</p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                localStorage.removeItem("dqa_funnel_draft");
                window.location.reload();
              }}
              className="rounded-full bg-zinc-100 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:bg-zinc-200 transition-all border border-zinc-200"
            >
              Limpar Cache e Recarregar
            </button>
            <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400">
              Status: Conectando ao Servidor
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-5 py-4 flex items-center justify-center">
        <div className="flex-1 max-w-md">
          <QuizProgress value={progress} />
        </div>
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-5 pt-0 pb-6">
        {stage === "intro" ? (
          <QuizIntro
            draft={draft.steps["intro"] || undefined}
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
              steps={draft.steps}
              onNext={() => {
                trackEvent("pagina_vendas_visualizada");
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

import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import type { Question } from "@/lib/quiz-data";
import { optimizedImageSrcSet, optimizedImageUrl } from "@/lib/image-optimization";

type Props = {
  question: Question;
  index: number;
  total: number;
  selected?: string;
  onSelect: (value: string) => void;
  onBack: () => void;
};

export function QuestionStep({ question, index, total, selected, onSelect, onBack }: Props) {
  return (
    <div key={question.id} className="animate-rise-in mx-auto w-full max-w-2xl px-4 sm:px-0">
      <div className="flex items-center justify-between gap-4 mt-2 sm:mt-0">
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Questão {index + 1}/{total}
        </div>
        {index > 0 && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:bg-zinc-100 border border-zinc-100 shadow-sm"
          >
            <ArrowLeft className="h-3 w-3" /> Voltar
          </button>
        )}
      </div>

      <h2 className="mt-4 sm:mt-8 text-2xl font-black tracking-tight sm:text-4xl text-center text-zinc-950 uppercase leading-tight">
        {question.title}
      </h2>

      {question.image ? (
        <div className="mt-4 sm:mt-8 aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-100 bg-zinc-50 shadow-lg sm:shadow-xl shadow-zinc-950/5">
          <img
            key={question.image}
            src={optimizedImageUrl(question.image, 960)}
            srcSet={optimizedImageSrcSet(question.image)}
            sizes="(max-width: 672px) 100vw, 672px"
            alt={question.title}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      ) : null}

      <div className="mt-6 sm:mt-10 grid gap-3 sm:gap-4">
        {question.options.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`group relative flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-2.5 sm:py-4 text-left transition-all duration-300 ${
                active
                  ? "bg-zinc-950 text-white shadow-xl shadow-zinc-950/20 translate-y-[-1px] border border-zinc-950"
                  : "bg-zinc-900 text-white hover:bg-zinc-950 border border-zinc-900 shadow-sm"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                  active
                    ? "bg-white border-white scale-110"
                    : "border-white/40 group-hover:border-white/70"
                }`}
              >
                {active ? <Check className="h-3 w-3 text-zinc-950" /> : null}
              </div>
              <span className="min-w-0 text-base font-bold uppercase tracking-tight">
                {option.label}
              </span>

              {!active && (
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white/60" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

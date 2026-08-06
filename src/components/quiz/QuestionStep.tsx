import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import type { Question } from "@/lib/quiz-data";

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
    <div key={question.id} className="animate-rise-in mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:bg-zinc-100 border border-zinc-100 shadow-sm"
        >
          <ArrowLeft className="h-3 w-3" /> Voltar
        </button>
      </div>

      <h2 className="mt-8 text-3xl font-black tracking-tight sm:text-4xl text-center text-zinc-950 uppercase leading-tight">
        {question.title}
      </h2>

      {question.image ? (
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50 shadow-xl shadow-zinc-950/5">
          <img
            key={question.image}
            src={question.image}
            alt={question.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="mt-10 grid gap-4">
        {question.options.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`group relative flex items-center gap-4 rounded-2xl px-6 py-4 text-left transition-all duration-300 ${
                active
                  ? "bg-red-600 text-white shadow-xl shadow-red-600/20 translate-y-[-1px] border-red-600"
                  : "bg-white text-zinc-950 hover:bg-zinc-50 border border-zinc-200 shadow-sm"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                   active
                    ? "bg-white border-white scale-110"
                    : "border-zinc-200 group-hover:border-zinc-300"
                }`}
              >
                {active ? <Check className="h-3 w-3 text-red-600" /> : null}
              </div>
              <span className="min-w-0 text-base font-bold uppercase tracking-tight">
                {option.label}
              </span>

              {!active && (
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-6 w-6 rounded-full bg-zinc-50 flex items-center justify-center">
                    <Check className="h-3 w-3 text-zinc-300" />
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

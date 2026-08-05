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
    <div key={question.id} className="animate-rise-in mx-auto w-full max-w-2xl py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-12 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
          <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
            Passo {index + 1}/{total}
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/10 border border-white/10 shadow-sm"
        >
          <ArrowLeft className="h-3 w-3" /> Voltar
        </button>
      </div>

      <h2 className="mt-8 text-3xl font-black tracking-tight sm:text-4xl text-center text-white uppercase leading-tight">
        {question.title}
      </h2>

      {question.image ? (
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50">
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
                  ? "bg-white text-black shadow-xl shadow-white/5 translate-y-[-1px]"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5 shadow-sm"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                  active
                    ? "bg-red-600 border-red-600 scale-110"
                    : "border-white/20 group-hover:border-white/30"
                }`}
              >
                {active ? <Check className="h-3 w-3 text-white" /> : null}
              </div>
              <span className="min-w-0 text-base font-bold uppercase tracking-tight">
                {option.label}
              </span>

              {!active && (
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center">
                    <Check className="h-3 w-3 text-zinc-500" />
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

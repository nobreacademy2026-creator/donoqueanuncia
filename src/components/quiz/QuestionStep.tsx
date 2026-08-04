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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <p className="min-w-0 truncate text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Pergunta {index + 1} de {total}
        </p>
        <button
          onClick={onBack}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
      </div>

      <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl text-center">{question.title}</h2>

      {question.image ? (
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-secondary/30">
          <img
            src={question.image}
            alt={question.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="mt-7 grid gap-4">
        {question.options.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`group relative flex items-center gap-4 rounded-2xl px-6 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                active 
                  ? "bg-zinc-900 text-white shadow-xl ring-2 ring-[#22c55e]" 
                  : "bg-zinc-900/90 text-zinc-100 hover:bg-zinc-900"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  active ? "bg-primary border-primary" : "border-zinc-700"
                }`}
              >
                {active ? <Check className="h-3.5 w-3.5 text-white" /> : null}
              </div>
              <span className="min-w-0 text-base sm:text-lg font-bold">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

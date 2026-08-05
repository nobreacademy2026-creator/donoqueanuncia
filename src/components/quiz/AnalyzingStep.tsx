import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const MESSAGES = [
  "Analisando suas respostas...",
  "Estamos comparando suas respostas com milhares de empresários...",
  "Seu diagnóstico está pronto.",
];

export function AnalyzingStep({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 1));
    }, 45);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 45 && step === 0) setStep(1);
    if (progress >= 90 && step === 1) setStep(2);
    if (progress >= 100) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [progress, step, onDone]);

  return (
    <div className="animate-rise-in mx-auto max-w-xl text-center">
      <Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" />
      <p className="mt-6 min-h-14 text-lg font-medium">{MESSAGES[step]}</p>
      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="gradient-primary h-full rounded-full transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{progress}%</p>
    </div>
  );
}

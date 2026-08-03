import { useState } from "react";
import { z } from "zod";
import { ArrowRight, Lock } from "lucide-react";
import { trackLead } from "@/lib/tracking";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo").max(100, "Nome muito longo"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/, "Informe um WhatsApp válido com DDD"),
  email: z.string().trim().email("Informe um e-mail válido").max(255, "E-mail muito longo"),
});

export type Lead = z.infer<typeof schema>;

export function LeadForm({ onSubmit, score }: { onSubmit: (lead: Lead) => void; score: number }) {
  const [values, setValues] = useState<Lead>({ nome: "", whatsapp: "", email: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Lead, string>>>({});

  const fields: { name: keyof Lead; label: string; type: string; placeholder: string }[] = [
    { name: "nome", label: "Nome", type: "text", placeholder: "Seu nome completo" },
    { name: "whatsapp", label: "WhatsApp", type: "tel", placeholder: "(11) 91234-5678" },
    { name: "email", label: "E-mail", type: "email", placeholder: "voce@empresa.com" },
  ];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<keyof Lead, string>> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof Lead] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    trackLead({ score });
    onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card mx-auto mt-6 w-full max-w-2xl rounded-3xl p-6 sm:p-8">
      <h3 className="text-xl font-semibold tracking-tight">Receba seu plano personalizado</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Enviamos o passo a passo para corrigir os pontos fracos do seu diagnóstico.
      </p>

      <div className="mt-6 grid gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </label>
            <input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              className="mt-2 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-base outline-none transition-colors focus:border-primary"
            />
            {errors[field.name] ? (
              <p className="mt-1.5 text-sm text-destructive">{errors[field.name]}</p>
            ) : null}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="gradient-primary glow-primary mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.01]"
      >
        Quero Receber Meu Plano <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> Seus dados estão seguros e não serão compartilhados.
      </p>
    </form>
  );
}
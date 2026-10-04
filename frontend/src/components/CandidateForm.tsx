import type { ReactNode } from "react";
import type { CandidateFormData, FieldErrors } from "../types/candidate";

type CandidateFormProps = {
  values: CandidateFormData;
  errors: FieldErrors;
  submitting: boolean;
  onChange: (field: keyof CandidateFormData, value: string) => void;
  onSubmit: () => void;
};

export function CandidateForm({
  values,
  errors,
  submitting,
  onChange,
  onSubmit,
}: CandidateFormProps) {
  return (
    <form
      className="card form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Field id="fullName" label="Nome completo *" error={errors.fullName?.[0]}>
        <input
          id="fullName"
          value={values.fullName}
          maxLength={200}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          onChange={(event) => onChange("fullName", event.target.value)}
        />
      </Field>

      <Field id="email" label="E-mail *" error={errors.email?.[0]}>
        <input
          id="email"
          type="email"
          value={values.email}
          maxLength={255}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          onChange={(event) => onChange("email", event.target.value)}
        />
      </Field>

      <Field id="phone" label="Telefone" error={errors.phone?.[0]}>
        <input
          id="phone"
          type="tel"
          value={values.phone}
          maxLength={30}
          placeholder="(41) 99999-0000"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          onChange={(event) => onChange("phone", event.target.value)}
        />
      </Field>

      <Field
        id="area"
        label="Área ou cargo de interesse"
        error={errors.area?.[0]}
      >
        <input
          id="area"
          value={values.area}
          maxLength={150}
          aria-invalid={Boolean(errors.area)}
          aria-describedby={errors.area ? "area-error" : undefined}
          onChange={(event) => onChange("area", event.target.value)}
        />
      </Field>

      <Field
        id="summary"
        label="Resumo profissional"
        error={errors.summary?.[0]}
      >
        <textarea
          id="summary"
          rows={5}
          value={values.summary}
          maxLength={4000}
          aria-invalid={Boolean(errors.summary)}
          aria-describedby={errors.summary ? "summary-error" : undefined}
          onChange={(event) => onChange("summary", event.target.value)}
        />
      </Field>

      <button type="submit" className="button" disabled={submitting}>
        {submitting ? "Salvando..." : "Salvar cadastro"}
      </button>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

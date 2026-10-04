import { useState } from "react";
import { useNavigate } from "react-router";
import { api, ApiError } from "../api/client";
import { Alert } from "../components/Alert";
import { CandidateForm } from "../components/CandidateForm";
import { validateCandidate } from "../validation/candidate";
import type { CandidateFormData, FieldErrors } from "../types/candidate";

const emptyForm: CandidateFormData = {
  fullName: "",
  email: "",
  phone: "",
  area: "",
  summary: "",
};

export function NewCandidatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<CandidateFormData>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field: keyof CandidateFormData, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit() {
    setSubmitError(null);

    const validationErrors = validateCandidate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createCandidate(values);
      navigate(`/candidatos/${created.id}`, {
        state: { message: "Cadastro salvo com sucesso." },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ email: [error.message] });
      } else if (error instanceof ApiError) {
        setErrors(error.fieldErrors);
        setSubmitError(error.message);
      } else {
        setSubmitError("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Novo cadastro</h2>
      {submitError && <Alert type="error">{submitError}</Alert>}
      <CandidateForm
        values={values}
        errors={errors}
        submitting={submitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

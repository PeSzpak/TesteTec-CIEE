import type { CandidateFormData, FieldErrors } from "../types/candidate";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCandidate(values: CandidateFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = ["Nome completo é obrigatório"];
  }

  if (!values.email.trim()) {
    errors.email = ["E-mail é obrigatório"];
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = ["Formato de e-mail inválido"];
  }
  return errors;
}

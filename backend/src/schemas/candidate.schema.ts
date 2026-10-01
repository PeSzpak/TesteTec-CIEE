import z from "zod";

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} deve ter no máximo ${max} caracteres`)
    .optional()
    .transform((value) => value || null);

export const candidateSchema = z.object({
  fullName: z
    .string({ error: "Nome completo é obrigatório" })
    .trim()
    .min(1, "Nome completo é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  email: z
    .string({ error: "E-mail é obrigatório" })
    .trim()
    .toLowerCase()
    .min(1, "E-mail é obrigatório")
    .pipe(z.email("Formato de e-mail inválido")),
  phone: optionalText(30, "Telefone").refine(
    (value) => value === null || /^[\d\s()+\-]+$/.test(value),
    "Telefone deve conter apenas números, espaços e () + -",
  ),
  area: optionalText(150, "Área de interesse"),
  summary: optionalText(4000, "Resumo"),
});

export type CandidateInput = z.infer<typeof candidateSchema>;

import type {
  Candidate,
  CandidateFormData,
  CandidateListItem,
  ExtractedCandidate,
  FieldErrors,
} from "../types/candidate";

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldErrors;

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, init);
  } catch {
    throw new ApiError(
      0,
      "Não foi possivel conectar ao servidor. verifique se a API está rodando.",
    );
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.message ?? "Ocorreu um erro inesperado. Tente novamente.",
      body?.errors ?? {},
    );
  }
  return body as T;
}

export const api = {
  listCandidates: () => request<CandidateListItem[]>("/candidates"),
  getCandidate: (id: string) => request<Candidate>(`/candidates/${id}`),

  createCandidate: (data: CandidateFormData) =>
    request<Candidate>("/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  parseResume: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<ExtractedCandidate>("/resumes/parse", {
      method: "POST",
      body: formData,
    });
  },
};

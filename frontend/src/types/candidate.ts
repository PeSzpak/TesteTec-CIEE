export type Candidate = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  area: string | null;
  summary: string | null;
  createdAt: string;
};

export type CandidateListItem = Pick<
  Candidate,
  "id" | "fullName" | "email" | "area" | "createdAt"
>;

export type CandidateFormData = {
  fullName: string;
  email: string;
  phone: string;
  area: string;
  summary: string;
};

export type ExtractedCandidate = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
};

export type FieldErrors = Partial<Record<keyof CandidateFormData, string[]>>;

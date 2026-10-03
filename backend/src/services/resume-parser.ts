import { PDFParse } from "pdf-parse";

export type ExtractedCandidate = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
};

const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_REGEX = /(?:\+?55[\s-]?)?\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}/;
const NAME_REGEX = /^[A-Za-zÀ-ÿ'.-]+(?:\s+[A-Za-zÀ-ÿ'.-]+){1,5}$/;
const IGNORED_HEADERS = [
  "curriculo",
  "currículo",
  "curriculum",
  "resume",
  "perfil",
  "dados pessoais",
];
const LOWERCASE_PARTICLES = ["da", "de", "do", "das", "dos", "e"];
const NAME_SEARCH_LINES = 5;
const PAGE_SEPARATOR = /^-- \d+ of \d+ --$/gm;

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.replace(PAGE_SEPARATOR, "");
  } finally {
    await parser.destroy();
  }
}

export function extractCandidateData(text: string): ExtractedCandidate {
  const email = text.match(EMAIL_REGEX)?.[0].toLowerCase() ?? null;
  const phone = text.match(PHONE_REGEX)?.[0].trim() ?? null;

  return { fullName: findName(text), email, phone };
}

function findName(text: string): string | null {
  const firstLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, NAME_SEARCH_LINES);

  for (const line of firstLines) {
    const lower = line.toLowerCase();
    if (IGNORED_HEADERS.some((header) => lower.includes(header))) continue;
    if (NAME_REGEX.test(line)) return formatName(line);
  }

  return null;
}

function formatName(name: string): string {
  const singleSpaced = name.replace(/\s+/g, " ");
  if (singleSpaced !== singleSpaced.toUpperCase()) return singleSpaced;

  return singleSpaced
    .toLowerCase()
    .split(" ")
    .map((word) =>
      LOWERCASE_PARTICLES.includes(word)
        ? word
        : word[0].toUpperCase() + word.slice(1),
    )
    .join(" ");
}

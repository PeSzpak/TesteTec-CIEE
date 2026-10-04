import { useState } from "react";
import type { ChangeEvent } from "react";
import { api, ApiError } from "../api/client";
import { Alert } from "./Alert";
import type { ExtractedCandidate } from "../types/candidate";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const FIELD_LABELS: Record<keyof ExtractedCandidate, string> = {
  fullName: "nome",
  email: "e-mail",
  phone: "telefone",
};

type Status = { type: "error" | "success" | "info"; message: string } | null;

type PdfImportProps = {
  onExtracted: (data: ExtractedCandidate) => void;
};

export function PdfImport({ onExtracted }: PdfImportProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      setStatus({ type: "error", message: "Selecione um arquivo PDF." });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatus({
        type: "error",
        message: "O arquivo deve ter no máximo 5 MB.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const data = await api.parseResume(file);
      onExtracted(data);
      setStatus(describeResult(data));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível ler o PDF.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card import">
      <label htmlFor="resume" className="import-label">
        Importar currículo em PDF (opcional)
      </label>
      <p className="import-hint">
        Até 5 MB. Os dados encontrados preenchem o formulário abaixo e podem ser
        corrigidos antes de salvar. Se a leitura falhar, preencha manualmente.
      </p>
      <input
        id="resume"
        type="file"
        accept="application/pdf,.pdf"
        disabled={loading}
        onChange={handleFileChange}
      />
      {loading && (
        <p className="import-hint" role="status">
          Lendo o currículo...
        </p>
      )}
      {status && <Alert type={status.type}>{status.message}</Alert>}
    </div>
  );
}

function describeResult(data: ExtractedCandidate): Status {
  const fields = Object.keys(FIELD_LABELS) as (keyof ExtractedCandidate)[];
  const found = fields
    .filter((field) => data[field])
    .map((field) => FIELD_LABELS[field]);
  const missing = fields
    .filter((field) => !data[field])
    .map((field) => FIELD_LABELS[field]);

  if (found.length === 0) {
    return {
      type: "info",
      message:
        "Nenhum dado foi identificado automaticamente. Preencha o formulário manualmente.",
    };
  }

  const missingText =
    missing.length > 0 ? ` Não identificados: ${missing.join(", ")}.` : "";

  return {
    type: "success",
    message: `Preenchidos a partir do PDF: ${found.join(", ")}.${missingText} Confira os dados antes de salvar.`,
  };
}

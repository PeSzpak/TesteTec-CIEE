import { Router } from "express";
import { uploadPdf } from "../middlewares/upload";
import { AppError } from "../errors/app-error";
import { string } from "zod";
import { extractCandidateData, extractTextFromPdf } from "../services/resume-parser";

export const resumesRouter = Router();

resumesRouter.post("/parse", uploadPdf, async (req, res) => {
  if (!req.file) {
    throw new AppError(400, "Envie um arquivo PDF");
  }

  if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
    throw new AppError(400, "O arquivo enviado não é um PDF válido");
  }

  let text;
  string;
  try {
    text = await extractTextFromPdf(req.file.buffer);
  } catch {
    throw new AppError(
      422,
      "Não foi possível ler o PDF. Preencha os dados manualmente");
  }

  if (!text.trim()) {
    throw new AppError(
      422,
      "O PDF não contém texto selecionável (pode ser uma imagem escaneada). Preencha os dados manualmente");
  }

  res.json(extractCandidateData(text));
});

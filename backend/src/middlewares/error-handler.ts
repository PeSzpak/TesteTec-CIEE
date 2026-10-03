import { ErrorRequestHandler } from "express";
import { ZodError, z } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/app-error";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Dados inválidos",
      errors: z.flattenError(err).fieldErrors,
    });
    return;
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    res.status(409).json({ message: "Já existe um candidato com este e-mail" });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ message: "O arquivo deve ter no máximo 5 MB" });
      return;
    }
    res
      .status(400)
      .json({
        message: "Envio inválido. Envie um único arquivo PDF no campo file",
      });
  }

  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor" });
};

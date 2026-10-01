import { Router } from "express";
import { candidateSchema } from "../schemas/candidate.schema";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/app-error";

export const candidatesRouter = Router();

candidatesRouter.post("/", async (req, res) => {
  const data = candidateSchema.parse(req.body);
  const candidate = await prisma.candidate.create({ data });
  res.status(201).json(candidate);
});

candidatesRouter.get("/", async (_req, res) => {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      area: true,
      createdAt: true,
    },
  });
  res.json(candidates);
});

candidatesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "ID inválido");
  }

  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) {
    throw new AppError(404, "Candidato não encontrado");
  }

  res.json(candidate);
});

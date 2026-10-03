import { beforeEach, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/lib/prisma";

const validCandidate = {
  fullName: "Isabelle da Cruz",
  email: "belle@email.com",
  phone: "(41) 99999-0000",
  area: "Backend",
  summary: "Desenvolvedora com experiência em Node.js",
};

beforeEach(async () => {
  await prisma.candidate.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/candidates", () => {
  it("cadastra um candidato válido", async () => {
    const response = await request(app)
      .post("/api/candidates")
      .send(validCandidate);

    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.email).toBe("belle@email.com");
    expect(await prisma.candidate.count()).toBe(1);
  });

  it("retorna 400 com erros por campo quando os dados são inválidos", async () => {
    const response = await request(app).post("/api/candidates").send({
      fullName: "",
      email: "nao-e-email",
    });
    expect(response.status).toBe(400);
    expect(response.body.errors.fullName).toBeDefined();
    expect(response.body.errors.email).toBeDefined();
    expect(await prisma.candidate.count()).toBe(0);
  });

  it("retorna 409 para e-mail já cadastrado, mesmo com maiúsculo", async () => {
    await request(app).post("/api/candidates").send(validCandidate);

    const response = await request(app)
      .post("/api/candidates")
      .send({ ...validCandidate, email: "BELLE@EMAIL.COM" });

    expect(response.status).toBe(409);
    expect(await prisma.candidate.count()).toBe(1);
  });
});

describe("GET /api/candidates", () => {
  it("lista os candidatos sem o resumo", async () => {
    await request(app).post("/api/candidates").send(validCandidate);

    const response = await request(app).get("/api/candidates");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].fullName).toBe("Isabelle da Cruz");
    expect(response.body[0].summary).toBeUndefined();
  });
});

describe("GET /api/candidates/:id", () => {
  it("retorna os detalhes completos", async () => {
    const created = await request(app)
      .post("/api/candidates")
      .send(validCandidate);

    const response = await request(app).get(
      `/api/candidates/${created.body.id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.summary).toBe(validCandidate.summary);
  });

  it("retorna 404 para candidato inexistente", async () => {
    const response = await request(app).get("/api/candidates/999999");

    expect(response.status).toBe(404);
  });

  it("retorna 400 para ID inválido", async () => {
    const response = await request(app).get("/api/candidates/abc");

    expect(response.status).toBe(400);
  });
});

import path from "node:path";
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { MAX_FILE_SIZE } from "../src/middlewares/upload";

const fixture = (name: string) => path.resolve(__dirname, "fixtures", name);
const deliveryResume = path.resolve(__dirname, "../../docs/curriculo-ficticio.pdf");

const parse = () => request(app).post("/api/resumes/parse");

describe("POST /api/resumes/parse", () => {
  it("extrai os dados do currículo fictício da entrega", async () => {
    const response = await parse().attach("file", deliveryResume);

    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body).toEqual({
      fullName: "Isabelle da Cruz",
      email: "isabelle.cruz@email.com",
      phone: "(41) 99876-5432",
    });
  });

  it("extrai nome em maiúsculas depois do cabeçalho", async () => {
    const response = await parse().attach("file", fixture("curriculo-nome-maiusculo.pdf"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      fullName: "Rafael dos Santos Oliveira",
      email: "rafael.oliveira@exemplo.com.br",
      phone: "+55 41 3333-4444",
    });
  });

  it("retorna null nos campos ausentes sem tratar como erro", async () => {
    const response = await parse().attach("file", fixture("curriculo-sem-contato.pdf"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ fullName: "Marina Costa Ribeiro", email: null, phone: null });
  });

  it("retorna 422 para PDF escaneado, sem texto", async () => {
    const response = await parse().attach("file", fixture("curriculo-escaneado.pdf"));

    expect(response.status).toBe(422);
    expect(response.body.message).toContain("escaneada");
  });

  it("retorna 422 para PDF corrompido", async () => {
    const response = await parse().attach("file", fixture("curriculo-corrompido.pdf"));

    expect(response.status).toBe(422);
  });

  it("retorna 400 sem arquivo", async () => {
    const response = await parse();

    expect(response.status).toBe(400);
  });

  it("retorna 400 para arquivo que não é PDF", async () => {
    const response = await parse().attach("file", Buffer.from("texto"), {
      filename: "notas.txt",
      contentType: "text/plain",
    });

    expect(response.status).toBe(400);
  });

  it("retorna 400 para arquivo disfarçado de PDF", async () => {
    const response = await parse().attach("file", Buffer.from("não sou um pdf"), {
      filename: "falso.pdf",
      contentType: "application/pdf",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("não é um PDF válido");
  });

  it("retorna 413 para arquivo acima de 5 MB", async () => {
    const response = await parse().attach("file", Buffer.alloc(MAX_FILE_SIZE + 1), {
      filename: "grande.pdf",
      contentType: "application/pdf",
    });

    expect(response.status).toBe(413);
  });
});
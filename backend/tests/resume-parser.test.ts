import { describe, it, expect } from "vitest";
import { extractCandidateData } from "../src/services/resume-parser";

describe("extractCandidateData", () => {
  it("extrai nome, e-mail e telefone de um currículo típico", () => {
    const text = [
      "Isabelle da Cruz",
      "Desenvolvedora Backend | Curitiba, PR",
      "isabelle.cruz@email.com | (41) 99876-5432",
    ].join("\n");

    expect(extractCandidateData(text)).toEqual({
      fullName: "Isabelle da Cruz",
      email: "isabelle.cruz@email.com",
      phone: "(41) 99876-5432",
    });
  });

  it("pula o cabeçalho e formata nome em maiúsculas", () => {
    const text = ["CURRÍCULO", "RAFAEL DOS SANTOS OLIVEIRA", "Analista de Dados"].join("\n");

    expect(extractCandidateData(text).fullName).toBe("Rafael dos Santos Oliveira");
  });

  it("pula linhas com números antes do nome", () => {
    const text = ["Rua Exemplo, 123", "Marina Costa Ribeiro"].join("\n");

    expect(extractCandidateData(text).fullName).toBe("Marina Costa Ribeiro");
  });

  it("normaliza o e-mail para minúsculas", () => {
    expect(extractCandidateData("Contato: Ana.Souza@Exemplo.COM.br").email).toBe(
      "ana.souza@exemplo.com.br"
    );
  });

  it.each(["(41) 99876-5432", "41 99876-5432", "(41)998765432", "+55 41 3333-4444"])(
    "reconhece o telefone no formato %s",
    (phone) => {
      expect(extractCandidateData(`Telefone: ${phone}`).phone).toBe(phone);
    }
  );

  it("não confunde períodos de datas com telefone", () => {
    expect(extractCandidateData("Experiência: 2019 a 2023 e 2023 - 2026").phone).toBeNull();
  });

  it("retorna null quando não há e-mail nem telefone", () => {
    const result = extractCandidateData("Experiência com React e Node.js desde 2020");

    expect(result.email).toBeNull();
    expect(result.phone).toBeNull();
  });
});
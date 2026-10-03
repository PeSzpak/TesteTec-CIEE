import { describe, expect, it } from "vitest";
import { candidateSchema } from "../src/schemas/candidate.schema";
describe("candidateSchema", () => {
  it("normaliza o e-mail e remove espaço nas pontas", () => {
    const result = candidateSchema.parse({
      fullName: " Isabelle da Cruz ",
      email: " BELLE@email.com ",
    });

    expect(result.fullName).toBe("Isabelle da Cruz");
    expect(result.email).toBe("belle@email.com");
  });

  it("converte campos opcionais vazios e null", () => {
    const result = candidateSchema.parse({
      fullName: "Isabelle da Cruz",
      email: "belle@email.com",
      phone: "",
      area: "    ",
      summary: "",
    });

    expect(result.phone).toBeNull();
    expect(result.area).toBeNull();
    expect(result.summary).toBeNull();
  });

  it("rejeita nome só com espaços e e-mail mal formatado", () => {
    const result = candidateSchema.safeParse({
      fullName: "   ",
      email: "nao-e-email",
    });

    expect(result.success).toBe(false);
  });

  it("aceita telefone com parênteses, espaço e hífen", () => {
    const result = candidateSchema.safeParse({
      fullName: "Isabelle da Cruz",
      email: "belle@email.com",
      phone: "(41) 99999-0000",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita telefone com letras", () => {
    const result = candidateSchema.safeParse({
      fullName: "Isabelle da Cruz",
      email: "belle@email.com",
      phone: "42 abcd",
    });
    expect(result.success).toBe(false);
  });
});

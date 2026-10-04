export function formatDateTime(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

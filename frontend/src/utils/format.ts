export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
/** Valores em reais — sem centavos, que é como a demo trabalha (valor por plantão/hora). */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** Média de avaliação com uma casa decimal (ex.: "4,7"). */
export function formatRating(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Máscara de CPF conforme a digitação (000.000.000-00). Dados fictícios, sem validação de dígito. */
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

/** CPF preenchido por completo — a demo só confere a quantidade de dígitos. */
export function isCpfComplete(value: string): boolean {
  return value.replace(/\D/g, "").length === 11;
}

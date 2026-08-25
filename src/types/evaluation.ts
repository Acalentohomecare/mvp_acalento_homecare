/**
 * Avaliação de um atendimento concluído, sempre **da empresa sobre o cuidador**.
 *
 * A direção é única de propósito: não existe avaliação do cuidador sobre a empresa. Enquanto
 * existiu um campo `from`, `caregiverId` carregava dois sentidos — "quem foi avaliado" numa
 * linha, "quem escreveu" na outra —, e todo consumidor precisava lembrar de filtrar a direção
 * antes de somar nota. Quem esquecesse fazia o cuidador se auto-avaliar para cima.
 *
 * Com uma direção só, `caregiverId` é sem ambiguidade **quem recebeu a avaliação**.
 */
export interface Evaluation {
  id: string;
  attendanceId: string;
  /** O cuidador avaliado. */
  caregiverId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}

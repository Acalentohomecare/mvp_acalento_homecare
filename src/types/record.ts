export interface RecordObservation {
  id: string;
  text: string;
  createdAt: string;
  /** R7: correção feita depois do check-out entra como observação nova, não como edição. */
  afterCheckout: boolean;
}

/** Sinais vitais só se aplicam a cuidador com formação (técnico/superior). */
export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
}

/** Registro preenchido pelo cuidador durante o atendimento (tela 13). */
export interface AttendanceRecord {
  attendanceId: string;
  completedActivityIds: string[];
  observations: RecordObservation[];
  vitals?: VitalSigns;
  /** Fotos simuladas — só o rótulo, sem upload real (CLAUDE.md §35). */
  photos: string[];
  /** Preenchido no check-out; a partir daí o registro fica travado (R7). */
  closedAt?: string;
}

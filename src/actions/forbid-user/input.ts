/**
 * ForbidUser - Input (Argumento)
 */

export type ForbidUserInput = {
  operation: number;   // 0=query, 1=forbid, 2=unforbid
  gmuserid?: number;   // ID do GM (default: -1)
  source?: number;     // Fonte (default: -1)
  userid: number;      // ID da conta
  time: number;        // Tempo em segundos
  reason: string;      // Motivo
};


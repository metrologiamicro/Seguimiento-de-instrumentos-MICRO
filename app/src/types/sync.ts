export interface SyncResult {
  ok: boolean;
  totalInstrumentos: number;
  mensaje: string;
  error?: string;
}

export type SyncProgressCallback = (processed: number, total: number) => void;

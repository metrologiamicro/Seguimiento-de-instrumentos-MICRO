export interface Instrument {
  codigo: string;
  nombre: string;
  sector: string;
  calibrado: string;
  vto: string;
  aviso: string;
}

export type StatusKey = 'ok' | 'warn' | 'danger' | 'none';

export interface InstrumentStatus {
  key: StatusKey;
  label: string;
  diasRemaining: number | null;
}

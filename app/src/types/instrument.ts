export interface Instrument {
  codigo: string;
  nombre: string;
  sector: string;
  calibrado: string;
  vto: string;
  aviso: string;
  operarioMarca?: string;
  disponibilidad?: string;
  identificacion?: string;
  tipoInstrumento?: string;
  maquina?: string;
  retiradoPor?: string;
  fechaRetiro?: string;
}

export type StatusKey = 'ok' | 'warn' | 'danger' | 'none';

export interface InstrumentStatus {
  key: StatusKey;
  label: string;
  diasRemaining: number | null;
}

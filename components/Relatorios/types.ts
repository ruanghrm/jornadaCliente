// components/Relatorios/types.ts

export interface VinculoSolarman {
  id: string;
  cliente_id: number;
  solarman_device_id: string;
  solarman_plant_id: string;
  solarman_email: string;
  created_at: string;
}

export interface Cliente {
  id: number;
  nome_completo: string;
  email: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
  cidade: string;
  estado: string;
}

export interface DeviceMetrics {
  power_W: number;
  daily_energy_kWh: number;
  total_energy_kWh: number;
  dc_voltage_pv1_V: number;
  dc_current_pv1_A: number;
  ac_voltage_V: number;
  ac_current_A: number;
}

export interface DeviceRealtime {
  deviceId: number;
  deviceSn: string;
  measured_at: string;
  system_time_str: string;
  metrics: DeviceMetrics;
}

export interface StationRealtime {
  stationId: number;
  summary: {
    total_power_W: number;
    device_count: number;
    last_update: string;
  };
  devices: DeviceRealtime[];
}

export interface HistoryPoint {
  timestamp: string;
  generation_kwh: number;
  full_power_hours: number;
}

export interface StationHistory {
  stationId: number;
  granularity: string;
  start: string;
  end: string;
  points: HistoryPoint[];
  summary: {
    total_generation_kwh: number;
    average_generation_kwh: number;
    best_timestamp: string;
    best_generation_kwh: number;
    worst_timestamp: string;
    worst_generation_kwh: number;
  };
}

export interface RelatorioData {
  id: string;
  usina_id: string;
  usina_nome: string;
  cliente_id: number;
  cliente_nome: string;
  cliente_email: string;
  geradora: string;
  status: 'ok' | 'alerta' | 'falha' | 'incompleto';
  producao_hoje: number;
  producao_15d: number;
  producao_30d: number;
  producao_ano: number;
  ultima_atualizacao: string;
  total_dispositivos: number;
}

export type FiltroStatus = 
  | 'todos'
  | 'ok'
  | 'falha'
  | 'alerta'
  | 'incompleto';
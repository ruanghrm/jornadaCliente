// components/Usinas/types.ts

// Tipos para histórico de geração da usina
export interface StationHistoryItem {
  timestamp: string;
  generation_kwh: number;
  specific_yield_kwh_kwp: number;
  performance_ratio_percent: number;
}

// Resumo do histórico da usina
export interface StationSummary {
  total_generation_kwh: number;
  average_generation_kwh: number;
  best_timestamp: string;
  best_generation_kwh: number;
  worst_timestamp: string;
  worst_generation_kwh: number;
}

// No seu arquivo types.ts, adicione na interface StationInfo:
export interface StationInfo {
  id: string;
  name: string;
  installedCapacity?: number;
  generationPower?: number;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  networkStatus?: "NORMAL" | "OFFLINE" | "ALERT";
  devices?: DeviceSummary[];
  fonte?: "Solplanet" | "Solarman";
  
  // Campos específicos para cada integradora
  solarmanDeviceId?: string;
  solarmanPlantId?: string;
  solarmanEmail?: string;
  
  // Campos para histórico
  history?: StationHistoryItem[];
  summary?: StationSummary;
}

// Tipos de granularidade
export type Granularity = "day" | "month" | "year" | "period"; 

// Informações de cada dispositivo/inversor
export interface DeviceSummary {
  deviceId: number;
  deviceSn: string;
  name: string;
  metrics?: DeviceMetrics;
  installedPowerKw?: number;
  model?: string;
  manufacturer?: string;
  active?: boolean;
  lastUpdate?: string;
}

export interface SolplanetPlant {
  apikey: string;
  name: string;
  position?: string;
  totalpower_kw?: number;
  status?: number;
}

// Métricas do dispositivo
export interface DeviceMetrics {
  power_W: number;
  daily_energy_kWh: number;
  total_energy_kWh: number;
  dc_voltage_pv1_V: number;
  dc_current_pv1_A: number;
  ac_voltage_V: number;
  ac_current_A: number;
}

// Tipos usados para dados em tempo real da usina
export interface StationRealtime {
  stationId: number;
  summary: {
    total_power_W: number;
    device_count: number;
    last_update: string;
  };
  devices: DeviceSummary[];
}

export interface DeviceRealtime {
  timestamp: string;
  active_power_kw: number;
  daily_generation_kwh: number;
  total_generation_kwh: number;
  performance_ratio_percent?: number;
  efficiency_percent?: number;
  temperature_c?: number;
  voltage_v?: number;
  current_a?: number;
}

// Histórico de cada dispositivo
export interface DeviceHistoryItem {
  timestamp: string;
  energy_kwh: number;
  active_power_kw: number;
  performance_ratio_percent?: number;
}

// components/Usinas/types.ts
export interface GraphPoint {
  timestamp: string
  generation_kwh: number
  full_power_hours?: number  // baseado no seu JSON da API
}

// Ou pode estar como:
export interface HistoryPoint {
  timestamp: string
  generation_kwh: number
  full_power_hours?: number
}

// Ou se não existir, crie:
export interface ChartDataPoint {
  timestamp: string
  generation_kwh: number
}

// Tipos para consumo da API (opcional)
export interface ApiDeviceSummary {
  device_sn: string;
  name: string;
  model?: string;
  manufacturer?: string;
  installed_power_kw?: number;
  active?: boolean;
  last_update?: string;
}

export interface SolarmanStation {
  id: number;
  name: string;
  installedCapacity?: number;
  generationPower?: number;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  networkStatus?: string; // A API retorna string, mas vamos converter
}
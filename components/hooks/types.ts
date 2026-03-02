// components/hooks/types.ts
import {
  StationInfo,
  StationRealtime,
  DeviceSummary,
  StationHistoryItem,
  Granularity,
} from "../Usinas/types"

// Tipos para Integrações
export type IntegrationType = 'solarman' | 'solplanet' | 'sungrow'

// Interface unificada para estação
export interface UnifiedStation extends StationInfo {
  integration: IntegrationType
  apikey?: string // Para Solplanet
  solplanetStatus?: number // Status específico da Solplanet
}

// Tipos específicos da Solplanet
export interface SolplanetPlant {
  apikey: string
  name: string
  status: number
  totalpower_kw: number
  etoday_kwh: number
  etotal_kwh: number
  ludt: string
  wd: number
  jd: number
  position: string
}

export interface SolplanetRealtime {
  apikey: string
  summary: {
    total_power_W: number
    device_count: number
    last_update: string
  }
  devices: Array<{
    apikey: string
    inverterSn: string
    measured_at: string
    metrics: {
      power_W: number
      daily_energy_kWh: number
      total_energy_kWh: number
    }
  }>
}

export interface SolplanetInverter {
  apikey: string
  isn: string
  istate: number
  ludt: string
  psn: string
}

export interface SolplanetInverterRealtime {
  apikey: string
  inverterSn: string
  measured_at: string
  metrics: {
    power_W: number
    daily_energy_kWh: number
    total_energy_kWh: number
  }
}

// Tipos para histórico
export interface GraphPoint {
  timestamp: string
  generation_kwh: number
}

export interface HistoryResponse {
  points: StationHistoryItem[]
  summary: {
    total_generation_kwh: number
    average_generation_kwh: number
    best_timestamp: string
    best_generation_kwh: number
    worst_timestamp: string
    worst_generation_kwh: number
  }
}

// Interface para cache
export interface CachedHistory {
  data: GraphPoint[]
  timestamp: number
  dateRange?: string
}

export interface StationCache {
  [stationId: string]: {
    integration?: IntegrationType
    realtime?: StationRealtime & { _timestamp?: number }
    devices?: DeviceSummary[]
    history: {
      [granularity in Granularity]?: {
        [dateRange: string]: CachedHistory
      }
    }
    solplanetInverters?: SolplanetInverter[]
  }
}

// Constantes
export const CACHE_DURATION = {
  realtime: 30 * 1000, // 30 segundos
  history: 5 * 60 * 1000, // 5 minutos
}

export const EMPTY_HISTORY_RESPONSE: HistoryResponse = {
  points: [],
  summary: {
    total_generation_kwh: 0,
    average_generation_kwh: 0,
    best_timestamp: '',
    best_generation_kwh: 0,
    worst_timestamp: '',
    worst_generation_kwh: 0
  }
}



// Funções utilitárias
export async function safeJsonParse<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
    throw new Error("API retornou HTML ao invés de JSON")
  }
  return JSON.parse(text) as T
}
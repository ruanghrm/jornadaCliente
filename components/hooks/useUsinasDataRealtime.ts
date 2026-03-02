// components/hooks/useUsinasDataRealtime.ts
import { useCallback } from "react"
import { 
  UnifiedStation, 
  SolplanetRealtime,
  safeJsonParse
} from "./types"
import { StationRealtime } from "../Usinas/types"
import { useUsinasDataCache } from "./useUsinasDataCache"

// Funções de mapeamento para Solplanet
const mapSolplanetRealtimeToUnified = (
  data: SolplanetRealtime,
  apikey: string
): StationRealtime => {
  const totalPower = data.summary.total_power_W
  const lastUpdate = data.devices.length > 0 
    ? data.devices[0].measured_at 
    : data.summary.last_update

  const devices = data.devices.map(d => ({
    deviceId: parseInt(d.inverterSn.replace(/\D/g, '').slice(0, 8)) || 0,
    deviceSn: d.inverterSn,
    name: `Inversor ${d.inverterSn.slice(-4)}`,
    metrics: {
      power_W: d.metrics.power_W,
      daily_energy_kWh: d.metrics.daily_energy_kWh,
      total_energy_kWh: d.metrics.total_energy_kWh,
      dc_voltage_pv1_V: 0,
      dc_current_pv1_A: 0,
      ac_voltage_V: 0,
      ac_current_A: 0
    },
    lastUpdate: d.measured_at
  }))

  const stationId = parseInt(apikey.replace(/\D/g, '').slice(0, 8)) || 0

  return {
    stationId: stationId,
    summary: {
      total_power_W: totalPower,
      device_count: data.devices.length,
      last_update: lastUpdate
    },
    devices: devices
  }
}

export function useUsinasDataRealtime() {
  const { getFromCache, saveToCache } = useUsinasDataCache()

  const carregarRealtime = useCallback(async (
    station: UnifiedStation
  ): Promise<StationRealtime | null> => {
    const stationId = String(station.id)

    // Tenta buscar do cache
    const cached = getFromCache<StationRealtime>(stationId, 'realtime')
    if (cached) {
      return cached
    }

    try {
      if (station.integration === 'solarman') {
        const baseUrl = 'https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman'
        const response = await fetch(`${baseUrl}/stations/${stationId}/realtime`)
        
        if (response.ok) {
          const data = await safeJsonParse<StationRealtime>(response)
          saveToCache(stationId, 'realtime', data)
          return data
        }
      } 
      else if (station.integration === 'solplanet' && station.apikey) {
        const baseUrl = 'https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solplanet'
        const response = await fetch(`${baseUrl}/plants/${station.apikey}/realtime`)
        
        if (response.ok) {
          const data = await safeJsonParse<SolplanetRealtime>(response)
          const unified = mapSolplanetRealtimeToUnified(data, station.apikey)
          saveToCache(stationId, 'realtime', unified)
          return unified
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados em tempo real:', error)
    }

    return null
  }, [getFromCache, saveToCache])

  return { carregarRealtime }
}
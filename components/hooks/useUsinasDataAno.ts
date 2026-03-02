// components/hooks/useUsinasDataAno.ts
import { useCallback } from "react"
import { 
  UnifiedStation, 
  GraphPoint,
  HistoryResponse // ← IMPORTAR HistoryResponse
} from "./types"
import { StationRealtime } from "../Usinas/types"
import { useUsinasDataCache } from "./useUsinasDataCache"
import { useUsinasDataRealtime } from "./useUsinasDataRealtime"

interface UseUsinasDataAnoReturn {
  carregarDadosAnuais: (
    station: UnifiedStation,
    ano: string // Formato: YYYY
  ) => Promise<{
    history: GraphPoint[]
    realtime: StationRealtime | null
  }>
}

export function useUsinasDataAno(): UseUsinasDataAnoReturn {
  const { getFromCache, saveToCache } = useUsinasDataCache()
  const { carregarRealtime } = useUsinasDataRealtime()

  const carregarDadosAnuais = useCallback(async (
    station: UnifiedStation,
    ano: string // YYYY
  ) => {
    const stationId = String(station.id)
    
    const dateRangeKey = `${ano}-01-01_${ano}-12-31`

    console.log(`📅 Carregando dados anuais para ${station.name} - Ano: ${ano}`)

    // Tenta buscar do cache
    const cached = getFromCache<GraphPoint[]>(
      stationId, 
      'history', 
      'year', 
      dateRangeKey
    )

    if (cached) {
      return {
        history: cached,
        realtime: await carregarRealtime(station)
      }
    }

    // Busca da API - Mês a mês
    let historyData: GraphPoint[] = []

    if (station.integration === 'solarman') {
      const baseUrl = 'https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman'
      
      // Array para armazenar as promises
      const promises: Promise<GraphPoint | null>[] = []
      
      // Para cada mês do ano, faz uma requisição
      for (let mes = 1; mes <= 12; mes++) {
        const mesStr = String(mes).padStart(2, '0')
        const startDate = `${ano}-${mesStr}-01`
        const lastDay = new Date(parseInt(ano), mes, 0).getDate()
        const endDate = `${ano}-${mesStr}-${lastDay}`
        
        const promise = fetch(
          `${baseUrl}/stations/${stationId}/history?granularity=month&start=${startDate}&end=${endDate}`
        )
        .then(res => res.ok ? res.json() : null)
        .then((data: HistoryResponse | null) => { // ← TIPADO CORRETAMENTE
          if (data && data.points && data.points.length > 0) {
            // Soma toda a geração do mês
            const totalMes = data.points.reduce((sum, point) => {
              return sum + (point.generation_kwh || 0)
            }, 0)
            
            return {
              timestamp: `${ano}-${mesStr}`, // Formato YYYY-MM
              generation_kwh: totalMes
            }
          }
          return null
        })
        .catch(err => {
          console.error(`Erro ao buscar mês ${mes}/${ano}:`, err)
          return null
        })
        
        promises.push(promise)
      }
      
      // Aguarda todas as requisições
      const results = await Promise.all(promises)
      
      // Filtra apenas os resultados válidos
      historyData = results.filter((r): r is GraphPoint => r !== null)
      
      console.log(`📊 Dados processados para o ano ${ano}:`, {
        quantidade: historyData.length,
        meses: historyData.map(m => m.timestamp)
      })
      
    } else if (station.integration === 'solplanet') {
      // Se a Solplanet tiver endpoint de histórico mensal
      // Implementar aqui
      historyData = []
    }

    // Salva no cache
    saveToCache(stationId, 'history', historyData, 'year', dateRangeKey)

    return {
      history: historyData,
      realtime: await carregarRealtime(station)
    }
  }, [getFromCache, saveToCache, carregarRealtime])

  return { carregarDadosAnuais }
}
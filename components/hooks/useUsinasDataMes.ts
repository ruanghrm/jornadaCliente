// components/hooks/useUsinasDataMes.ts
import { useCallback } from "react"
import { 
  UnifiedStation, 
  HistoryResponse,
  GraphPoint,
} from "./types"
import { StationRealtime } from "../Usinas/types"
import { useUsinasDataCache } from "./useUsinasDataCache"
import { useUsinasDataRealtime } from "./useUsinasDataRealtime"

interface UseUsinasDataMesReturn {
  carregarDadosMensais: (
    station: UnifiedStation,
    mes: string // Formato: YYYY-MM
  ) => Promise<{
    history: GraphPoint[]
    realtime: StationRealtime | null
  }>
}

export function useUsinasDataMes(): UseUsinasDataMesReturn {
  const { getFromCache, saveToCache } = useUsinasDataCache()
  const { carregarRealtime } = useUsinasDataRealtime()

  const carregarDadosMensais = useCallback(async (
    station: UnifiedStation,
    mes: string // YYYY-MM
  ) => {
    const stationId = String(station.id)
    
    const [year, month] = mes.split('-')
    const startDate = `${year}-${month}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const endDate = `${year}-${month}-${lastDay}`
    const dateRangeKey = `${startDate}_${endDate}`

    console.log(`📅 Carregando dados mensais para ${station.name} - Mês: ${mes}`)

    // Tenta buscar do cache
    const cached = getFromCache<GraphPoint[]>(
      stationId, 
      'history', 
      'month', 
      dateRangeKey
    )

    if (cached) {
      return {
        history: cached,
        realtime: await carregarRealtime(station)
      }
    }

    // Busca da API - Dia a dia
    let historyData: GraphPoint[] = []

    if (station.integration === 'solarman') {
      const baseUrl = 'https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman'
      
      // Array para armazenar as promises
      const promises: Promise<GraphPoint | null>[] = []
      
      // Para cada dia do mês, faz uma requisição
      for (let dia = 1; dia <= lastDay; dia++) {
        const diaStr = String(dia).padStart(2, '0')
        const data = `${year}-${month}-${diaStr}`
        
        const promise = fetch(
          `${baseUrl}/stations/${stationId}/history?granularity=day&start=${data}&end=${data}`
        )
        .then(res => res.ok ? res.json() : null)
        .then((data: HistoryResponse | null) => {
          if (data && data.points && data.points.length > 0) {
            // Soma toda a geração do dia (pode ter múltiplos pontos se for horário)
            const totalDia = data.points.reduce((sum, point) => {
              return sum + (point.generation_kwh || 0)
            }, 0)
            
            return {
              timestamp: `${year}-${month}-${diaStr}`, // Formato YYYY-MM-DD
              generation_kwh: totalDia
            }
          }
          return null
        })
        .catch(err => {
          console.error(`Erro ao buscar dia ${dia}/${month}/${year}:`, err)
          return null
        })
        
        promises.push(promise)
      }
      
      // Aguarda todas as requisições
      const results = await Promise.all(promises)
      
      // Filtra apenas os resultados válidos
      historyData = results.filter((r): r is GraphPoint => r !== null)
      
      console.log(`📊 Dados processados para o mês ${mes}:`, {
        quantidade: historyData.length,
        dias: historyData.map(d => d.timestamp)
      })
      
    } else if (station.integration === 'solplanet') {
      // Se a Solplanet tiver endpoint de histórico diário
      // Implementar aqui
      historyData = []
    }

    // Salva no cache
    saveToCache(stationId, 'history', historyData, 'month', dateRangeKey)

    return {
      history: historyData,
      realtime: await carregarRealtime(station)
    }
  }, [getFromCache, saveToCache, carregarRealtime])

  return { carregarDadosMensais }
}
// components/hooks/useUsinasDataDia.ts
import { useCallback } from "react"
import { 
  UnifiedStation, 
  GraphPoint,
  safeJsonParse
} from "./types"
import { StationRealtime } from "../Usinas/types"
import { useUsinasDataCache } from "./useUsinasDataCache"
import { useUsinasDataRealtime } from "./useUsinasDataRealtime"

interface FrameResponse {
  stationId: number
  granularity: string
  start: string
  end: string
  points: Array<{
    timestamp: string
    generationPower: number
  }>
  summary: {
    total_generation_kwh: number | null
    average_generation_kwh: number | null
    best_timestamp: string
    best_generation_kwh: number | null
    best_generation_power: number
    worst_timestamp: string
    worst_generation_kwh: number | null
    worst_generation_power: number
  }
}

interface UseUsinasDataDiaReturn {
  carregarDadosDiarios: (
    station: UnifiedStation,
    data: string // Formato: YYYY-MM-DD
  ) => Promise<{
    history: GraphPoint[]
    realtime: StationRealtime | null
    fullData?: FrameResponse['points'] // Dados completos de 5 em 5 minutos (opcional)
  }>
}

export function useUsinasDataDia(): UseUsinasDataDiaReturn {
  const { getFromCache, saveToCache } = useUsinasDataCache()
  const { carregarRealtime } = useUsinasDataRealtime()

  // Função para filtrar apenas os horários cheios
  const filterFullHours = (points: FrameResponse['points']): GraphPoint[] => {
    // Primeiro, encontra o primeiro e último horário com geração
    const pontosComGeracao = points.filter(p => p.generationPower > 0)
    
    if (pontosComGeracao.length === 0) {
      return []
    }

    const primeiroHorario = pontosComGeracao[0].timestamp
    const ultimoHorario = pontosComGeracao[pontosComGeracao.length - 1].timestamp

    console.log(`📅 Período com geração: ${primeiroHorario} - ${ultimoHorario}`)

    // Extrai a hora do primeiro e último horário
    const primeiraHora = parseInt(primeiroHorario.split(':')[0])
    const ultimaHora = parseInt(ultimoHorario.split(':')[0])

    // Filtra apenas os pontos que são horas cheias (minutos = 00)
    // E que estão dentro do período de geração
    const horasCheias = points.filter(point => {
      const [hora, minuto] = point.timestamp.split(':').map(Number)
      const horaNum = hora
      
      // Verifica se é hora cheia e se está dentro do período de geração
      return minuto === 0 && 
             horaNum >= primeiraHora && 
             horaNum <= ultimaHora &&
             point.generationPower > 0
    })

    console.log(`⏰ Horas cheias encontradas:`, horasCheias.map(h => h.timestamp))

    // Converte para o formato GraphPoint
    return horasCheias.map(point => ({
      timestamp: point.timestamp,
      generation_kwh: point.generationPower / 1000 // Converte de W para kW
    }))
  }

  const carregarDadosDiarios = useCallback(async (
    station: UnifiedStation,
    data: string // YYYY-MM-DD
  ) => {
    const stationId = String(station.id)
    const dateRangeKey = `${data}_${data}_frame`

    console.log(`📅 Carregando dados diários para ${station.name} - Data: ${data}`)

    // Tenta buscar do cache
    const cached = getFromCache<GraphPoint[]>(
      stationId, 
      'history', 
      'day', 
      dateRangeKey
    )

    if (cached) {
      return {
        history: cached,
        realtime: await carregarRealtime(station)
      }
    }

    // Busca da API
    let historyData: GraphPoint[] = []
    let fullFrameData: FrameResponse['points'] = []

    if (station.integration === 'solarman') {
      const baseUrl = 'https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman'
      
      // Usa o endpoint correto com granularidade 'frame'
      const response = await fetch(
        `${baseUrl}/stations/${stationId}/history?granularity=frame&start=${data}&end=${data}`
      )
      
      if (response.ok) {
        const json = await safeJsonParse<FrameResponse>(response)
        fullFrameData = json.points
        
        console.log(`📊 Dados de 5 em 5 minutos recebidos para ${data}:`, {
          totalPontos: fullFrameData.length,
          primeiro: fullFrameData[0],
          ultimo: fullFrameData[fullFrameData.length - 1]
        })

        // Filtra apenas as horas cheias
        historyData = filterFullHours(fullFrameData)
        
        console.log(`📊 Dados filtrados (horas cheias) para ${data}:`, {
          quantidade: historyData.length,
          horas: historyData.map(h => h.timestamp)
        })
      } else {
        console.error(`❌ Erro ao buscar dados da API:`, response.status)
        historyData = []
      }
    } else if (station.integration === 'solplanet') {
      // Se a Solplanet tiver endpoint de histórico horário
      // Implementar aqui
      historyData = []
    }

    // Salva no cache
    saveToCache(stationId, 'history', historyData, 'day', dateRangeKey)

    return {
      history: historyData,
      realtime: await carregarRealtime(station),
      fullData: fullFrameData // Opcional: retorna também os dados completos se precisar
    }
  }, [getFromCache, saveToCache, carregarRealtime])

  return { carregarDadosDiarios }
}
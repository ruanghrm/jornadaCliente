// components/hooks/useUsinasDataPeriodo.ts
import { useCallback } from "react"
import { 
  UnifiedStation, 
  HistoryResponse,
  GraphPoint,
} from "./types"
import { StationRealtime } from "../Usinas/types"
import { useUsinasDataCache } from "./useUsinasDataCache"
import { useUsinasDataRealtime } from "./useUsinasDataRealtime"

interface UseUsinasDataPeriodoReturn {
  carregarDadosPeriodo: (
    station: UnifiedStation,
    dataInicio: string, // Formato: YYYY-MM-DD
    dataFim: string     // Formato: YYYY-MM-DD
  ) => Promise<{
    history: GraphPoint[]
    realtime: StationRealtime | null
    diasComDados: number
    totalGeracao: number
  }>
}

export function useUsinasDataPeriodo(): UseUsinasDataPeriodoReturn {
  const { getFromCache, saveToCache } = useUsinasDataCache()
  const { carregarRealtime } = useUsinasDataRealtime()

  // Função para calcular o número de dias entre duas datas
  const calcularDiasNoPeriodo = (inicio: string, fim: string): number => {
    const dataInicio = new Date(inicio)
    const dataFim = new Date(fim)
    const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // +1 para incluir o dia inicial
  }

  // Função para gerar array com todas as datas do período
  const gerarArrayDeDatas = (inicio: string, fim: string): string[] => {
    const datas: string[] = []
    const dataAtual = new Date(inicio)
    const dataFim = new Date(fim)

    while (dataAtual <= dataFim) {
      const ano = dataAtual.getFullYear()
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0')
      const dia = String(dataAtual.getDate()).padStart(2, '0')
      
      datas.push(`${ano}-${mes}-${dia}`)
      
      // Avança um dia
      dataAtual.setDate(dataAtual.getDate() + 1)
    }

    return datas
  }

  // Função para validar o período
  const validarPeriodo = (inicio: string, fim: string): { valido: boolean; erro?: string } => {
    const dataInicio = new Date(inicio)
    const dataFim = new Date(fim)
    
    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      return { valido: false, erro: "Datas inválidas" }
    }
    
    if (dataInicio > dataFim) {
      return { valido: false, erro: "Data inicial não pode ser maior que data final" }
    }
    
    const diffDays = calcularDiasNoPeriodo(inicio, fim)
    if (diffDays > 366) {
      return { valido: false, erro: "Período muito grande (máximo 366 dias)" }
    }
    
    return { valido: true }
  }

  const carregarDadosPeriodo = useCallback(async (
    station: UnifiedStation,
    dataInicio: string, // YYYY-MM-DD
    dataFim: string     // YYYY-MM-DD
  ) => {
    const stationId = String(station.id)
    const dateRangeKey = `${dataInicio}_${dataFim}`

    // Valida o período
    const validacao = validarPeriodo(dataInicio, dataFim)
    if (!validacao.valido) {
      console.error(`❌ Período inválido: ${validacao.erro}`)
      return {
        history: [],
        realtime: await carregarRealtime(station),
        diasComDados: 0,
        totalGeracao: 0
      }
    }

    console.log(`📅 Carregando dados para período ${station.name}: ${dataInicio} até ${dataFim}`)

    // Tenta buscar do cache
    const cached = getFromCache<GraphPoint[]>(
      stationId, 
      'history', 
      'period', 
      dateRangeKey
    )

    if (cached) {
      const totalGeracao = cached.reduce((sum, point) => sum + point.generation_kwh, 0)
      return {
        history: cached,
        realtime: await carregarRealtime(station),
        diasComDados: cached.length,
        totalGeracao
      }
    }

    // Busca da API - Dia a dia no período
    let historyData: GraphPoint[] = []

    if (station.integration === 'solarman') {
      const baseUrl = 'https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman'
      
      // Gera todas as datas do período
      const datas = gerarArrayDeDatas(dataInicio, dataFim)
      
      console.log(`📆 Período com ${datas.length} dias para buscar`)
      
      // Array para armazenar as promises
      const promises: Promise<GraphPoint | null>[] = datas.map(data => {
        return fetch(
          `${baseUrl}/stations/${stationId}/history?granularity=day&start=${data}&end=${data}`
        )
        .then(res => res.ok ? res.json() : null)
        .then((response: HistoryResponse | null) => {
          if (response && response.points && response.points.length > 0) {
            // Soma toda a geração do dia
            const totalDia = response.points.reduce((sum, point) => {
              return sum + (point.generation_kwh || 0)
            }, 0)
            
            return {
              timestamp: data, // Formato YYYY-MM-DD
              generation_kwh: totalDia
            }
          }
          return null
        })
        .catch(err => {
          console.error(`Erro ao buscar dia ${data}:`, err)
          return null
        })
      })
      
      // Aguarda todas as requisições
      const results = await Promise.all(promises)
      
      // Filtra apenas os resultados válidos
      historyData = results.filter((r): r is GraphPoint => r !== null)
      
      console.log(`📊 Dados processados para o período:`, {
        diasSolicitados: datas.length,
        diasComDados: historyData.length,
        datas: historyData.map(d => d.timestamp)
      })
      
    } else if (station.integration === 'solplanet') {
      // Se a Solplanet tiver endpoint de histórico diário
      // Implementar aqui
      historyData = []
    }

    // Calcula total de geração no período
    const totalGeracao = historyData.reduce((sum, point) => sum + point.generation_kwh, 0)

    // Salva no cache
    saveToCache(stationId, 'history', historyData, 'period', dateRangeKey)

    return {
      history: historyData,
      realtime: await carregarRealtime(station),
      diasComDados: historyData.length,
      totalGeracao
    }
  }, [getFromCache, saveToCache, carregarRealtime])

  return { carregarDadosPeriodo }
}
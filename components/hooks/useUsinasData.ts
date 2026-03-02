// components/hooks/useUsinasData.ts
import { useEffect, useState, useCallback } from "react"
import { 
  StationRealtime,
  DeviceSummary,
  GraphPoint,
  SolplanetPlant,
  StationInfo,
} from "../Usinas/types"
import { UnifiedStation, safeJsonParse } from "./types"
import { useUsinasDataCache } from "./useUsinasDataCache"
import { useUsinasDataRealtime } from "./useUsinasDataRealtime"
import { useUsinasDataDia } from "./useUsinasDataDia"
import { useUsinasDataMes } from "./useUsinasDataMes"
import { useUsinasDataAno } from "./useUsinasDataAno"
import { useUsinasDataPeriodo } from "./useUsinasDataPeriodo" // Importe o novo hook

// Funções de mapeamento para Solplanet
const mapSolplanetToUnifiedStation = (plant: SolplanetPlant): UnifiedStation => {
  return {
    id: plant.apikey,
    name: plant.name,
    integration: 'solplanet',
    apikey: plant.apikey,
    solplanetStatus: plant.status,
    locationAddress: plant.position,
    installedCapacity: plant.totalpower_kw,
    generationPower: plant.totalpower_kw,
    networkStatus: plant.status === 1 ? "NORMAL" : plant.status === 0 ? "OFFLINE" : "ALERT",
    fonte: "Solplanet" as const
  }
}

interface UseUsinasDataReturn {
  stations: UnifiedStation[]
  selectedStation: UnifiedStation | null
  realtime: StationRealtime | null
  devices: DeviceSummary[]
  history: GraphPoint[]
  loadingStations: boolean
  loadingDetails: boolean
  error: string | null
  selectStation: (station: UnifiedStation) => Promise<void>
  carregarDadosPorPeriodo: (
    station: UnifiedStation,
    tipo: 'dia' | 'mes' | 'ano' | 'period',
    data: string
  ) => Promise<void>
  limparSelecao: () => void
}

export function useUsinasData(): UseUsinasDataReturn {
  const [stations, setStations] = useState<UnifiedStation[]>([])
  const [selectedStation, setSelectedStation] = useState<UnifiedStation | null>(null)
  const [realtime, setRealtime] = useState<StationRealtime | null>(null)
  const [devices, setDevices] = useState<DeviceSummary[]>([])
  const [history, setHistory] = useState<GraphPoint[]>([])
  const [loadingStations, setLoadingStations] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hooks especializados
  const { clearCache } = useUsinasDataCache()
  const { carregarRealtime } = useUsinasDataRealtime()
  const { carregarDadosDiarios } = useUsinasDataDia()
  const { carregarDadosMensais } = useUsinasDataMes()
  const { carregarDadosAnuais } = useUsinasDataAno()
  const { carregarDadosPeriodo } = useUsinasDataPeriodo() // Adicione esta linha

  // Buscar estações disponíveis
  useEffect(() => {
    const controller = new AbortController()

    async function fetchAllStations() {
      try {
        setLoadingStations(true)
        setError(null)

        const [solarmanResponse, solplanetResponse] = await Promise.allSettled([
          fetch(
            "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman/stations",
            { signal: controller.signal }
          ),
          fetch(
            "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solplanet/plants",
            { signal: controller.signal }
          )
        ])

        let solarmanStations: StationInfo[] = []
        if (solarmanResponse.status === 'fulfilled' && solarmanResponse.value.ok) {
          solarmanStations = await safeJsonParse<StationInfo[]>(solarmanResponse.value)
        }

        let solplanetPlants: SolplanetPlant[] = []
        if (solplanetResponse.status === 'fulfilled' && solplanetResponse.value.ok) {
          solplanetPlants = await safeJsonParse<SolplanetPlant[]>(solplanetResponse.value)
        }

        const unifiedStations: UnifiedStation[] = [
          ...solarmanStations.map(s => ({ 
            ...s, 
            integration: 'solarman' as const,
            fonte: 'Solarman' as const
          })),
          ...solplanetPlants.map(mapSolplanetToUnifiedStation)
        ]

        setStations(unifiedStations)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        console.error("Erro ao buscar stations:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoadingStations(false)
      }
    }

    fetchAllStations()
    return () => controller.abort()
  }, [])

  // Selecionar estação (carrega apenas dados em tempo real)
  const selectStation = useCallback(async (station: UnifiedStation) => {
    setSelectedStation(station)
    setLoadingDetails(true)
    setError(null)
    setHistory([]) // Limpa histórico anterior

    try {
      const realtimeData = await carregarRealtime(station)
      setRealtime(realtimeData)
      
      // Para Solplanet, também carrega devices
      if (station.integration === 'solplanet') {
        // Implementar busca de devices da Solplanet
        setDevices(realtimeData?.devices || [])
      } else {
        setDevices(realtimeData?.devices || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados")
    } finally {
      setLoadingDetails(false)
    }
  }, [carregarRealtime])

  // Carregar dados por período específico
  const carregarDadosPorPeriodo = useCallback(async (
    station: UnifiedStation,
    tipo: 'dia' | 'mes' | 'ano' | 'period',
    data: string
  ) => {
    if (!station) return

    setLoadingDetails(true)
    setError(null)

    try {
      let resultado;

      if (tipo === 'dia') {
        resultado = await carregarDadosDiarios(station, data)
      } else if (tipo === 'mes') {
        resultado = await carregarDadosMensais(station, data)
      } else if (tipo === 'ano') {
        resultado = await carregarDadosAnuais(station, data)
      } else if (tipo === 'period') {
        // Para período, a data vem como "inicio_fim"
        const [inicio, fim] = data.split('_')
        if (!inicio || !fim) {
          throw new Error("Formato de período inválido")
        }
        resultado = await carregarDadosPeriodo(station, inicio, fim)
      } else {
        throw new Error(`Tipo de período inválido: ${tipo}`)
      }

      setHistory(resultado.history)
      if (resultado.realtime) {
        setRealtime(resultado.realtime)
        setDevices(resultado.realtime.devices || [])
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar dados")
    } finally {
      setLoadingDetails(false)
    }
  }, [carregarDadosDiarios, carregarDadosMensais, carregarDadosAnuais, carregarDadosPeriodo])

  const limparSelecao = useCallback(() => {
    setSelectedStation(null)
    setRealtime(null)
    setDevices([])
    setHistory([])
    setError(null)
    clearCache()
  }, [clearCache])

  return {
    stations,
    selectedStation,
    realtime,
    devices,
    history,
    loadingStations,
    loadingDetails,
    error,
    selectStation,
    carregarDadosPorPeriodo,
    limparSelecao
  }
}
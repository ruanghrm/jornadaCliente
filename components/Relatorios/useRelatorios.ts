// components/Relatorios/hooks/useRelatorios.ts

import { useState, useEffect, useCallback } from 'react';
import { 
  VinculoSolarman, 
  Cliente, 
  StationRealtime, 
  StationHistory,
  RelatorioData,
  FiltroStatus 
} from './types';

const API_BASE_URL = 'https://backend.sansolenergiasolar.com.br/api/v1';

interface UseRelatoriosReturn {
  relatorios: RelatorioData[];
  loading: boolean;
  error: string | null;
  filtro: FiltroStatus;
  setFiltro: (filtro: FiltroStatus) => void;
  buscarDados: () => Promise<void>;
}

export const useRelatorios = (): UseRelatoriosReturn => {
  const [relatorios, setRelatorios] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroStatus>('todos');

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, []);

  const buscarCliente = useCallback(async (clienteId: number): Promise<Cliente | null> => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/jclientes/${clienteId}`);
    } catch (err) {
      console.error(`Erro ao buscar cliente ${clienteId}:`, err);
      return null;
    }
  }, [fetchWithAuth]);

  const buscarRealtime = useCallback(async (stationId: string): Promise<StationRealtime | null> => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/integracoes/solarman/stations/${stationId}/realtime`);
    } catch (err) {
      console.error(`Erro ao buscar realtime da estação ${stationId}:`, err);
      return null;
    }
  }, [fetchWithAuth]);

  const buscarHistory = useCallback(async (
    stationId: string, 
    start: string, 
    end: string
  ): Promise<StationHistory | null> => {
    try {
      return await fetchWithAuth(
        `${API_BASE_URL}/integracoes/solarman/stations/${stationId}/history?granularity=day&start=${start}&end=${end}`
      );
    } catch (err) {
      console.error(`Erro ao buscar history da estação ${stationId}:`, err);
      return null;
    }
  }, [fetchWithAuth]);

  // Funções auxiliares movidas para dentro do useCallback do buscarDados
  // para evitar problemas de dependências

  const buscarDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Busca todos os vínculos
      const vinculos: VinculoSolarman[] = await fetchWithAuth(
        `${API_BASE_URL}/integracoes/solarman/vinculos`
      );

      // Funções auxiliares definidas dentro do escopo
      const calcularGeracaoPorPeriodo = (history: StationHistory | null, dias: number): number => {
        if (!history?.points?.length) return 0;
        
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);
        
        const pontosPeriodo = history.points.filter(point => {
          const dataPonto = new Date(point.timestamp);
          return dataPonto >= dataLimite;
        });
        
        return pontosPeriodo.reduce((total, point) => total + point.generation_kwh, 0);
      };

      const determinarStatus = (
        realtime: StationRealtime | null, 
        history: StationHistory | null
      ): RelatorioData['status'] => {
        if (!realtime && !history) return 'falha';
        if (!realtime?.devices?.length) return 'falha';
        
        const hasPower = realtime.devices.some(device => device.metrics.power_W > 0);
        if (!hasPower) return 'alerta';
        
        if (history?.points?.length) {
          const ultimos7dias = calcularGeracaoPorPeriodo(history, 7);
          if (ultimos7dias === 0) return 'incompleto';
        }
        
        return 'ok';
      };

      // Para cada vínculo, busca os dados completos
      const dadosCompletos = await Promise.all(
        vinculos.map(async (vinculo) => {
          try {
            // Busca dados do cliente
            const cliente = await buscarCliente(vinculo.cliente_id);
            
            // Busca dados em tempo real
            const realtime = await buscarRealtime(vinculo.solarman_plant_id);
            
            // Calcula datas para histórico
            const hoje = new Date();
            const umAnoAtras = new Date();
            umAnoAtras.setFullYear(hoje.getFullYear() - 1);
            
            const inicio = umAnoAtras.toISOString().split('T')[0];
            const fim = hoje.toISOString().split('T')[0];
            
            // Busca histórico do último ano
            const history = await buscarHistory(vinculo.solarman_plant_id, inicio, fim);
            
            // Calcula produções com verificação de segurança
            const producaoHoje = history?.points?.length 
              ? history.points[history.points.length - 1]?.generation_kwh ?? 0
              : 0;
            
            const producao15d = calcularGeracaoPorPeriodo(history, 15);
            const producao30d = calcularGeracaoPorPeriodo(history, 30);
            const producaoAno = history?.summary?.total_generation_kwh ?? 0;
            
            const status = determinarStatus(realtime, history);
            
            return {
              id: vinculo.id,
              usina_id: vinculo.solarman_device_id,
              usina_nome: `Usina ${vinculo.solarman_device_id}`,
              cliente_id: vinculo.cliente_id,
              cliente_nome: cliente?.nome_completo || 'Cliente não encontrado',
              cliente_email: cliente?.email || '',
              geradora: 'Solarman',
              status,
              producao_hoje: producaoHoje,
              producao_15d: producao15d,
              producao_30d: producao30d,
              producao_ano: producaoAno,
              ultima_atualizacao: realtime?.summary?.last_update || vinculo.created_at,
              total_dispositivos: realtime?.summary?.device_count || 0
            } as RelatorioData;
          } catch (err) {
            console.error(`Erro ao processar vínculo ${vinculo.id}:`, err);
            return null;
          }
        })
      );

      // Filtra os dados válidos
      const relatoriosValidos = dadosCompletos.filter((item): item is RelatorioData => item !== null);
      setRelatorios(relatoriosValidos);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, buscarCliente, buscarRealtime, buscarHistory]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  // Aplica filtro
  const relatoriosFiltrados = filtro === 'todos' 
    ? relatorios 
    : relatorios.filter(r => r.status === filtro);

  return {
    relatorios: relatoriosFiltrados,
    loading,
    error,
    filtro,
    setFiltro,
    buscarDados
  };
};
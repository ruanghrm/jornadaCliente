import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Zap, Activity, X, RefreshCw, AlertCircle } from "lucide-react";
import { useUsinasData } from "./hooks/useUsinasData";
import type { UnifiedStation } from "./hooks/types"; // ← Importa do arquivo types
import type { IntegrationType } from "./hooks/types"; // ← Importa do arquivo types
import UsinaView from "../components/Usinas/UsinaView";
import { DeviceView } from "../components/Usinas/DeviceView";
import { UsinaButton } from "../components/Usinas/UsinasButton";
import { CardGeneric } from "../components/CardGeneric";
import { Badge } from "../components/Badge";
import "../components/Usinas/usinasView.css";
import type { DeviceSummary, Granularity } from "../components/Usinas/types";

// Interface para o tipo de usina vindo do cache (com apikey)
interface Unidade {
  id: number;
  cliente: string;
  capacidade: string;
  endereco: string;
  status: string;
  geracao: string;
  apikey?: string;
}

// Tipo para o status da estação
type NetworkStatus = "NORMAL" | "OFFLINE" | "ALERT" | undefined;

// Função para converter status string para o tipo esperado
const mapStatusToNetworkStatus = (status: string): NetworkStatus => {
  const statusUpper = status?.toUpperCase() || "";
  
  if (statusUpper.includes("ONLINE") || statusUpper === "ONLINE") {
    return "NORMAL";
  }
  if (statusUpper.includes("OFFLINE") || statusUpper === "OFFLINE") {
    return "OFFLINE";
  }
  if (statusUpper.includes("ALERT") || statusUpper === "ALERT") {
    return "ALERT";
  }
  
  return undefined;
};

// Função para criar uma UnifiedStation a partir do cache
const createStationFromCache = (usinaCache: Unidade, integracaoAtual: IntegrationType): UnifiedStation => {
    const geracaoStr = usinaCache.geracao?.replace(/[^0-9.,]/g, '') || "0";
    const geracaoNum = parseFloat(geracaoStr.replace(',', '.')) || 0;
    
    // Log para debug
    console.log('📦 createStationFromCache - usinaCache:', {
      id: usinaCache.id,
      cliente: usinaCache.cliente,
      apikey: usinaCache.apikey,
      integracao: integracaoAtual
    });
    
    return {
      id: String(usinaCache.id),
      name: usinaCache.cliente,
      locationAddress: usinaCache.endereco,
      networkStatus: mapStatusToNetworkStatus(usinaCache.status),
      installedCapacity: parseFloat(usinaCache.capacidade.replace(/[^0-9.,]/g, '')) || 0,
      generationPower: geracaoNum,
      integration: integracaoAtual,
      fonte: integracaoAtual === 'solplanet' ? 'Solplanet' : 
             integracaoAtual === 'sungrow' ? undefined : 'Solarman',
      apikey: integracaoAtual === 'solplanet' ? usinaCache.apikey : undefined,
      solplanetStatus: integracaoAtual === 'solplanet' ? 
                       (usinaCache.status === "Online" ? 1 : 0) : undefined,
      locationLat: undefined,
      locationLng: undefined,
      devices: [],
      history: [],
      summary: undefined,
      solarmanDeviceId: undefined,
      solarmanPlantId: undefined,
      solarmanEmail: undefined
    };
  };

interface Props {
  unidade: Unidade;
  onClose: () => void;
  unidadesCache?: Unidade[];
  integracao: IntegrationType;
}

// Tipo para o histórico formatado
interface FormattedHistory {
  points: Array<{
    timestamp: string;
    generation_kwh: number;
  }>;
  summary: {
    total_generation_kwh: number;
    average_generation_kwh: number;
    best_timestamp: string;
    best_generation_kwh: number;
    worst_timestamp: string;
    worst_generation_kwh: number;
  };
}

const ModalUsinas: React.FC<Props> = ({ unidade, onClose, unidadesCache, integracao }) => {
  const {
    stations,
    selectedStation,
    realtime,
    devices,
    history,
    selectStation,        // Agora aceita apenas 1 argumento (station)
    carregarDadosPorPeriodo, // ← NOVO: função para carregar dados por período
    error
  } = useUsinasData();

  const [selectedDevice, setSelectedDevice] = useState<DeviceSummary | null>(null);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [dadosIniciaisCarregados, setDadosIniciaisCarregados] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<string>(""); // Data no formato apropriado

  // Log da unidade recebida
  useEffect(() => {
    console.log('📦 ModalUsinas - unidade recebida:', {
      id: unidade.id,
      cliente: unidade.cliente,
      apikey: unidade.apikey,
      integracao: integracao
    });
  }, [unidade, integracao]);

  // USA OS DADOS DO CACHE PRIMEIRO
  useEffect(() => {
    if (unidadesCache && unidadesCache.length > 0 && !dadosIniciaisCarregados) {
      const usinaCache = unidadesCache.find(u => u.id === unidade.id);
      if (usinaCache) {
        console.log('🔍 Usina encontrada no cache:', {
          id: usinaCache.id,
          cliente: usinaCache.cliente,
          apikey: usinaCache.apikey
        });
        
        const stationFromHook = stations.find(s => 
          s.name.toLowerCase().trim() === usinaCache.cliente.toLowerCase().trim()
        );
        
        if (stationFromHook) {
          console.log('✅ Estação encontrada pelo nome:', stationFromHook.name, 'Integração:', stationFromHook.integration);
          selectStation(stationFromHook); // ← Agora só passa a station
        } else {
          const stationById = stations.find(s => String(s.id) === String(usinaCache.id));
          
          if (stationById) {
            console.log('✅ Estação encontrada pelo ID:', stationById.name, 'Integração:', stationById.integration);
            selectStation(stationById); // ← Agora só passa a station
          } else {
            console.log('⚠️ Estação não encontrada, criando temporária com integração:', integracao);
            const estacaoTemp = createStationFromCache(usinaCache, integracao);
            console.log('🏗️ Estação temporária criada:', {
              name: estacaoTemp.name,
              integration: estacaoTemp.integration,
              apikey: estacaoTemp.apikey
            });
            selectStation(estacaoTemp); // ← Agora só passa a station
          }
        }
        
        setDadosIniciaisCarregados(true);
      }
    }
  }, [unidade.id, unidadesCache, stations, selectStation, dadosIniciaisCarregados, integracao]);

  // Carrega dados detalhados apenas se necessário
  const loadStationData = useCallback(() => {
    if (!unidade.id || stations.length === 0 || dadosIniciaisCarregados) return;

    const usinaCache = unidadesCache?.find(u => u.id === unidade.id);
    if (usinaCache) {
      const stationByName = stations.find(s => 
        s.name.toLowerCase().trim() === usinaCache.cliente.toLowerCase().trim()
      );
      if (stationByName) {
        console.log('✅ LoadStationData - encontrada pelo nome:', stationByName.name);
        selectStation(stationByName); // ← Agora só passa a station
        setSelectedDevice(null);
        return;
      }
    }

    // Fallback: tenta pelo ID
    const stationById = stations.find((s) => String(s.id) === String(unidade.id));
    if (stationById) {
      console.log('✅ LoadStationData - encontrada pelo ID:', stationById.name);
      selectStation(stationById); // ← Agora só passa a station
      setSelectedDevice(null);
    } else if (usinaCache) {
      // Se não encontrou de nenhuma forma, cria temporária com a integração correta
      console.log('⚠️ LoadStationData - criando temporária com integração:', integracao);
      const estacaoTemp = createStationFromCache(usinaCache, integracao);
      console.log('🏗️ Estação temporária criada no loadStationData:', {
        name: estacaoTemp.name,
        integration: estacaoTemp.integration,
        apikey: estacaoTemp.apikey
      });
      selectStation(estacaoTemp); // ← Agora só passa a station
    }
  }, [unidade.id, stations, unidadesCache, selectStation, dadosIniciaisCarregados, integracao]);

  useEffect(() => {
    loadStationData();
  }, [loadStationData]);

  // Função para lidar com a mudança de período
  const handlePeriodChange = useCallback((tipo: 'dia' | 'mes' | 'ano', data: string) => {
    if (selectedStation) {
      setDataSelecionada(data);
      carregarDadosPorPeriodo(selectedStation, tipo, data);
    }
  }, [selectedStation, carregarDadosPorPeriodo]);

  // Função para lidar com a mudança de granularidade (botões Dia/Mês/Ano)
  const handleGranularityChange = useCallback((novaGranularidade: Granularity) => {
    setGranularity(novaGranularidade);
    setDataSelecionada(""); // Limpa data selecionada ao mudar granularidade
    
    // Se tiver estação selecionada, recarrega com a nova granularidade (sem data específica)
    if (selectedStation) {
      carregarDadosPorPeriodo(
        selectedStation, 
        novaGranularidade === 'day' ? 'dia' : 
        novaGranularidade === 'month' ? 'mes' : 'ano',
        "" // Vazio para pegar o período padrão (últimos 30 dias, 12 meses, 5 anos)
      );
    }
  }, [selectedStation, carregarDadosPorPeriodo]);

  // Transformar o array de history para o formato que UsinaView espera
  const historyData: FormattedHistory | null = history && history.length > 0 ? {
    points: history.map(point => ({
      timestamp: point.timestamp,
      generation_kwh: point.generation_kwh
    })),
    summary: {
      total_generation_kwh: history.reduce((sum, point) => sum + point.generation_kwh, 0),
      average_generation_kwh: history.reduce((sum, point) => sum + point.generation_kwh, 0) / history.length,
      best_timestamp: history.reduce((best, current) => 
        current.generation_kwh > best.generation_kwh ? current : best
      ).timestamp,
      best_generation_kwh: Math.max(...history.map(p => p.generation_kwh)),
      worst_timestamp: history.reduce((worst, current) => 
        current.generation_kwh < worst.generation_kwh ? current : worst
      ).timestamp,
      worst_generation_kwh: Math.min(...history.map(p => p.generation_kwh))
    }
  } : null;

  const carregarDevice = (device: DeviceSummary) => setSelectedDevice(device);
  const carregarUsina = () => setSelectedDevice(null);
  
  const getStatusBadge = (status: string) => {
    const normalized = status?.toUpperCase() || "";
    if (normalized === "NORMAL" || normalized.includes("ONLINE")) {
      return <Badge status="online">Online</Badge>;
    }
    if (normalized === "PARTIAL_OFFLINE") {
      return <Badge status="warning">Parcialmente offline</Badge>;
    }
    if (normalized === "ALL_OFFLINE" || normalized.includes("OFFLINE")) {
      return <Badge status="offline">Offline</Badge>;
    }
    return <Badge status="warning">{status || "Desconhecido"}</Badge>;
  };

  const handleRetry = () => {
    if (selectedStation) {
      selectStation(selectedStation);
      if (dataSelecionada) {
        carregarDadosPorPeriodo(
          selectedStation, 
          granularity === 'day' ? 'dia' : granularity === 'month' ? 'mes' : 'ano',
          dataSelecionada
        );
      }
    } else {
      loadStationData();
    }
  };

  // Se não tem dados ainda, mostra um placeholder simples
  if (!selectedStation && !error) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <div className="modal-title-section">
              <h2>
                <Zap size={24} />
                Usina {unidade.cliente}
              </h2>
            </div>
            <UsinaButton onClick={onClose} variant="ghost" icon={<X size={20} />} className="close-btn" />
          </div>
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            <p>Preparando visualização...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* HEADER */}
        <div className="modal-header">
          <div className="modal-title-section">
            {!selectedDevice ? (
              <h2>
                <Zap size={24} />
                {selectedStation?.name || unidade.cliente}
              </h2>
            ) : (
              <div className="device-title-wrapper">
                <UsinaButton
                  onClick={carregarUsina}
                  variant="ghost"
                  icon={<ArrowLeft size={18} />}
                >
                  Voltar
                </UsinaButton>
                <h2>
                  <Activity size={24} />
                  Inversor {selectedDevice.deviceSn}
                </h2>
              </div>
            )}
            <div className="header-badges">
              {selectedStation?.networkStatus && getStatusBadge(selectedStation.networkStatus)}
              {selectedDevice && (
                <Badge status="online">Inversor</Badge>
              )}
            </div>
          </div>
          <UsinaButton onClick={onClose} variant="ghost" icon={<X size={20} />} className="close-btn" />
        </div>

        {/* ERROR */}
        {error && (
          <CardGeneric className="error-card">
            <AlertCircle size={24} />
            <div>
              <h4>Erro ao carregar dados</h4>
              <p>{error}</p>
            </div>
            <UsinaButton onClick={handleRetry} variant="secondary" icon={<RefreshCw size={16} />}>
              Tentar novamente
            </UsinaButton>
          </CardGeneric>
        )}

        {/* CONTEÚDO */}
        {!error && selectedStation && (
          <>
            {!selectedDevice ? (
              <UsinaView
                stationInfo={selectedStation}
                realtimeStation={realtime}
                devices={devices}
                history={historyData}
                granularity={granularity}
                setGranularity={handleGranularityChange} // ← Usa a nova função
                onDeviceClick={carregarDevice}
                onPeriodChange={handlePeriodChange} // ← NOVA PROP
                selectedDate={dataSelecionada} // ← NOVA PROP
              />
            ) : (
              <DeviceView
                device={selectedDevice}
                onBack={carregarUsina}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModalUsinas;
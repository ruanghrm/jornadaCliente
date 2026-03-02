// components/Usinas/DeviceView.tsx
import React, { useEffect, useState, useCallback } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {  
  Zap, 
  Calendar, 
  BarChart3,
  RefreshCw,
  AlertCircle,
  Thermometer,
  Sun,
  BatteryCharging
} from "lucide-react"
import { CardGeneric } from "../CardGeneric"
import { DeviceSummary } from "./types"
import "./usinasView.css"

// URL base da API
const BASE = "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman"

// Tipos - APENAS "day" e "month" conforme API
type DeviceGranularity = "day" | "month"

interface DeviceRealtimeData {
  deviceId: number
  deviceSn: string
  measured_at: string
  metrics: {
    power_W: number
    daily_energy_kWh: number
    total_energy_kWh: number
    dc_voltage_pv1_V?: number
    dc_current_pv1_A?: number
    ac_voltage_V?: number
    ac_current_A?: number
    frequency_Hz?: number
    temperature_C?: number
  }
}

interface DeviceHistoryData {
  deviceSn: string
  deviceId: number
  granularity: string
  timeType: number
  points: Array<{
    timestamp: string
    total_kwh: number
    pv1_kwh?: number
    pv2_kwh?: number
    pv3_kwh?: number
    pv4_kwh?: number
  }>
}

interface Props {
  device: DeviceSummary
  onBack: () => void
  stationName?: string
}

// Componente Button compatível com o estilo do código original
const Button: React.FC<{
  children?: React.ReactNode
  onClick: () => void
  variant?: "primary" | "secondary" | "ghost"
  icon?: React.ReactNode
  className?: string
}> = ({ children, onClick, variant = "primary", icon, className = "" }) => (
  <button
    className={`btn btn-${variant} ${className}`}
    onClick={onClick}
  >
    {icon && <span className="icon">{icon}</span>}
    {children}
  </button>
)

// Componente StatCard compatível
const StatCard: React.FC<{
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}> = ({ title, value, subtitle, icon }) => (
  <CardGeneric className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <span className="stat-title">{title}</span>
      <span className="stat-value">{value}</span>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
  </CardGeneric>
)

export const DeviceView: React.FC<Props> = ({ 
  device,  
}) => {
  const [realtimeDevice, setRealtimeDevice] = useState<DeviceRealtimeData | null>(null)
  const [historyDevice, setHistoryDevice] = useState<DeviceHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [granularity, setGranularity] = useState<DeviceGranularity>("day")
  const [lastUpdate, setLastUpdate] = useState<string>("")

  // Função para formatar datas para a API
  const formatDateForAPI = (date: Date, granularityParam: DeviceGranularity): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    switch (granularityParam) {
      case 'month':
        return `${year}-${month}`;
      case 'day':
        return `${year}-${month}-${day}`;
      default:
        return `${year}-${month}-${day}`;
    }
  };

  // Função para obter o range de datas baseado na granularidade
  const getDateRange = (granularityParam: DeviceGranularity) => {
    const hoje = new Date();
    
    if (granularityParam === "day") {
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - 30);
      return {
        start: formatDateForAPI(inicio, "day"),
        end: formatDateForAPI(hoje, "day"),
      };
    }

    if (granularityParam === "month") {
      // Para devices, vamos pegar os últimos 12 meses completos
      const dataFinalMensal = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1); // Mês anterior
      const inicioMensal = new Date(dataFinalMensal);
      inicioMensal.setMonth(dataFinalMensal.getMonth() - 11); // 12 meses atrás
      
      return {
        start: formatDateForAPI(inicioMensal, "month"),
        end: formatDateForAPI(dataFinalMensal, "month"),
      };
    }
    
    // Fallback para daily
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 30);
    return {
      start: formatDateForAPI(inicio, "day"),
      end: formatDateForAPI(hoje, "day"),
    };
  };

  // Função para formatar timestamp para exibição
  const formatTimestamp = (value: string) => {
    if (granularity === "day") {
      return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
    if (granularity === "month") {
      const [year, month] = value.split("-")
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
      return `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`
    }
    return value
  }

  // Formatter para o Tooltip que lida com undefined
  const tooltipFormatter = (value: number | undefined) => {
    if (value === undefined) return ["0 kWh", "Energia"]
    return [`${value.toFixed(2)} kWh`, "Energia"]
  }

  const carregarDevice = useCallback(async (granularityParam: DeviceGranularity = granularity) => {
    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "accept": "*/*",
      };

      // 1. Buscar dados em tempo real (sempre busca)
      const deviceRt = await fetch(`${BASE}/devices/${device.deviceSn}/realtime`, { 
        headers,
        credentials: 'omit'
      });
      
      if (!deviceRt.ok) throw new Error("Erro ao carregar dados do Inversor");
      const deviceRtJson = await deviceRt.json();
      setRealtimeDevice(deviceRtJson);
      setLastUpdate(new Date().toLocaleTimeString());

      // 2. Buscar histórico com granularidade selecionada
      const { start, end } = getDateRange(granularityParam);
      const url = `${BASE}/devices/${device.deviceSn}/history?granularity=${granularityParam}&start=${start}&end=${end}`;
      console.log('URL chamada:', url); // Para debug
      
      const deviceHist = await fetch(url, { 
        headers,
        credentials: 'omit'
      });
      
      if (!deviceHist.ok) {
        const errorText = await deviceHist.text();
        console.error('Erro na API:', errorText);
        throw new Error(`Erro ao carregar histórico: ${deviceHist.status}`);
      }
      
      const deviceHistJson = await deviceHist.json();
      setHistoryDevice(deviceHistJson);

    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [device.deviceSn, granularity]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    carregarDevice()
    
    // Atualizar dados em tempo real a cada 30 segundos (apenas realtime)
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "accept": "*/*",
      };

      fetch(`${BASE}/devices/${device.deviceSn}/realtime`, { 
        headers,
        credentials: 'omit'
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setRealtimeDevice(data);
            setLastUpdate(new Date().toLocaleTimeString());
          }
        })
        .catch(console.error);
    }, 30000);

    return () => clearInterval(interval)
  }, [carregarDevice, device.deviceSn])

  // Função para mudar granularidade
  const handleGranularityChange = (newGranularity: DeviceGranularity) => {
    setGranularity(newGranularity)
    carregarDevice(newGranularity)
  }

  // Calcular estatísticas do histórico
  const calculateStats = () => {
    if (!historyDevice || !historyDevice.points.length) {
      return null
    }

    const points = historyDevice.points
    const total = points.reduce((sum, point) => sum + point.total_kwh, 0)
    const average = total / points.length
    const best = Math.max(...points.map(p => p.total_kwh))
    const worst = Math.min(...points.map(p => p.total_kwh))
    const bestPoint = points.find(p => p.total_kwh === best)
    const worstPoint = points.find(p => p.total_kwh === worst)

    return {
      total_generation_kwh: total,
      average_generation_kwh: average,
      best_timestamp: bestPoint?.timestamp || "",
      best_generation_kwh: best,
      worst_timestamp: worstPoint?.timestamp || "",
      worst_generation_kwh: worst
    }
  }

  const stats = calculateStats()

  // Determinar qual tipo de gráfico usar
  const renderChart = () => {
    if (!historyDevice || historyDevice.points.length === 0) return null;

    const data = historyDevice.points;

    // Gráfico de barras para meses
    if (granularity === "month") {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'kWh',
              angle: -90,
              position: 'insideLeft',
              fill: '#6b7280'
            }}
          />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={tooltipFormatter}
            labelFormatter={(label) => `Mês: ${formatTimestamp(label)}`}
          />
          <Legend />
          <Bar
            dataKey="total_kwh"
            name="Energia Acumulada (kWh)"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      );
    }

    // Gráfico de linha para dias
    if (granularity === "day") {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'kWh',
              angle: -90,
              position: 'insideLeft',
              fill: '#6b7280'
            }}
          />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={tooltipFormatter}
            labelFormatter={(label) => `Dia: ${formatTimestamp(label)}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total_kwh"
            name="Energia Acumulada (kWh)"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 3 }}
            activeDot={{ r: 6, fill: '#059669' }}
          />
        </LineChart>
      );
    }

    return null;
  };

  return (
    <div className="usina-view">


      {/* LOADING & ERROR STATES */}
      {loading && (
        <div className="loading-state">
          <RefreshCw className="spinner" size={32} />
          <p>Carregando dados...</p>
        </div>
      )}

      {erro && (
        <CardGeneric className="error-card">
          <AlertCircle size={24} />
          <div>
            <h4>Erro ao carregar dados</h4>
            <p>{erro}</p>
          </div>
          <Button onClick={() => carregarDevice()} variant="secondary" icon={<RefreshCw size={16} />}>
            Tentar novamente
          </Button>
        </CardGeneric>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      {!loading && !erro && realtimeDevice && (
        <>
          {/* INFORMAÇÕES DO DISPOSITIVO */}
          <div className="section">
            <div className="info-grid">
              <div className="info-item">
                <label>Serial Number</label>
                <p className="highlight">{device.deviceSn}</p>
              </div>
              <div className="info-item">
                <label>Device ID</label>
                <p>{device.deviceId}</p>
              </div>
              {device.installedPowerKw && (
                <div className="info-item">
                  <label>Potência Instalada</label>
                  <p>{device.installedPowerKw} kW</p>
                </div>
              )}
              {device.model && (
                <div className="info-item">
                  <label>Modelo</label>
                  <p>{device.model}</p>
                </div>
              )}
              {device.lastUpdate && (
                <div className="info-item">
                  <label>Última Atualização</label>
                  <p>{new Date(device.lastUpdate).toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>
          </div>

          {/* MÉTRICAS EM TEMPO REAL */}
          <div className="section">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">
                <Zap size={20} />
                Dados em Tempo Real
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <RefreshCw size={14} className="mr-1" />
                Atualizado: {lastUpdate}
              </div>
            </div>
            
            <div className="stats-grid">
              <StatCard
                title="Potência Atual"
                value={`${realtimeDevice.metrics.power_W.toLocaleString()} W`}
                icon={<Zap size={24} />}
              />
              <StatCard
                title="Energia Hoje"
                value={`${realtimeDevice.metrics.daily_energy_kWh?.toLocaleString() || "0"} kWh`}
                icon={<Sun size={24} />}
              />
              <StatCard
                title="Energia Total"
                value={`${realtimeDevice.metrics.total_energy_kWh.toLocaleString()} kWh`}
                icon={<BatteryCharging size={24} />}
              />
            </div>

            {/* DETALHES TÉCNICOS COM LAYOUT COMPACTO */}
            {realtimeDevice.metrics.dc_voltage_pv1_V && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Thermometer size={18} />
                  Detalhes Técnicos
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="technical-detail-card">
                    <div className="technical-detail-label">Tensão DC (PV1)</div>
                    <div className="technical-detail-value">
                      {realtimeDevice.metrics.dc_voltage_pv1_V.toFixed(1)} V
                    </div>
                  </div>
                  {realtimeDevice.metrics.dc_current_pv1_A && (
                    <div className="technical-detail-card">
                      <div className="technical-detail-label">Corrente DC (PV1)</div>
                      <div className="technical-detail-value">
                        {realtimeDevice.metrics.dc_current_pv1_A.toFixed(2)} A
                      </div>
                    </div>
                  )}
                  {realtimeDevice.metrics.ac_voltage_V && (
                    <div className="technical-detail-card">
                      <div className="technical-detail-label">Tensão AC</div>
                      <div className="technical-detail-value">
                        {realtimeDevice.metrics.ac_voltage_V.toFixed(1)} V
                      </div>
                    </div>
                  )}
                  {realtimeDevice.metrics.ac_current_A && (
                    <div className="technical-detail-card">
                      <div className="technical-detail-label">Corrente AC</div>
                      <div className="technical-detail-value">
                        {realtimeDevice.metrics.ac_current_A.toFixed(2)} A
                      </div>
                    </div>
                  )}
                  {realtimeDevice.metrics.temperature_C && (
                    <div className="technical-detail-card">
                      <div className="technical-detail-label">Temperatura</div>
                      <div className="technical-detail-value">
                        {realtimeDevice.metrics.temperature_C.toFixed(1)} °C
                      </div>
                    </div>
                  )}
                  {realtimeDevice.metrics.frequency_Hz && (
                    <div className="technical-detail-card">
                      <div className="technical-detail-label">Frequência</div>
                      <div className="technical-detail-value">
                        {realtimeDevice.metrics.frequency_Hz.toFixed(1)} Hz
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SELETOR DE PERÍODO */}
          <div className="section">
            <div className="flex gap-4 mb-4">
              <Button
                onClick={() => handleGranularityChange("day")}
                variant={granularity === "day" ? "primary" : "secondary"}
                icon={<Calendar size={16} />}
              >
                Diário (30 dias)
              </Button>
              <Button
                onClick={() => handleGranularityChange("month")}
                variant={granularity === "month" ? "primary" : "secondary"}
                icon={<BarChart3 size={16} />}
              >
                Mensal (12 meses)
              </Button>
            </div>
          </div>

          {/* HISTÓRICO DO DISPOSITIVO */}
          <div className="section">
            <h3 className="section-title">
              <BarChart3 size={20} />
              Histórico do Inversor (
              {granularity === "day" && "Diário - Últimos 30 dias"}
              {granularity === "month" && "Mensal - Últimos 12 meses"}
              )
            </h3>

            {/* ESTATÍSTICAS DO HISTÓRICO */}
            {stats && (
              <div className="chart-stats mb-4">
                <div className="chart-stat">
                  <label>Total no Período</label>
                  <span>{stats.total_generation_kwh.toFixed(1)} kWh</span>
                </div>
                <div className="chart-stat">
                  <label>Média {granularity === "day" ? "Diária" : "Mensal"}</label>
                  <span>{stats.average_generation_kwh.toFixed(2)} kWh</span>
                </div>
                {stats.best_generation_kwh > 0 && (
                  <div className="chart-stat">
                    <label>Melhor {granularity === "day" ? "Dia" : "Mês"}</label>
                    <span>{stats.best_generation_kwh.toFixed(1)} kWh</span>
                    <small className="text-gray-500 block text-xs">
                      {formatTimestamp(stats.best_timestamp)}
                    </small>
                  </div>
                )}
              </div>
            )}

            {/* GRÁFICO */}
            <CardGeneric className="chart-card">
              {historyDevice && historyDevice.points.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  {renderChart()}
                </ResponsiveContainer>
              ) : (
                <div className="loading-state">
                  <AlertCircle size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum dado histórico disponível</p>
                  <p className="text-gray-400 text-sm">Tente selecionar outro período</p>
                </div>
              )}
            </CardGeneric>
          </div>
        </>
      )}
    </div>
  )
}
// components/Usinas/UsinaView.tsx
import React, { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import { 
  Zap, 
  Battery, 
  Calendar, 
  Activity, 
  MapPin, 
  BarChart3,
  ChevronDown,
  CalendarDays
} from "lucide-react"
import { CardGeneric } from "../CardGeneric"
import { UsinaButton } from "../Usinas/UsinasButton"
import { Badge } from "../Badge"
import { StatCard } from "../StatCard"
import { StationInfo, StationRealtime, DeviceSummary, Granularity } from "./types"
import "./usinasView.css"

interface Props {
  stationInfo: StationInfo | null
  realtimeStation: StationRealtime | null
  devices: DeviceSummary[]
  history: {
    points: { timestamp: string; generation_kwh: number }[]
    summary: {
      total_generation_kwh: number
      average_generation_kwh: number
      best_timestamp: string
      best_generation_kwh: number
      worst_timestamp: string
      worst_generation_kwh: number
    }
  } | null
  granularity: Granularity
  setGranularity: (g: Granularity) => void
  onDeviceClick: (device: DeviceSummary) => void
  onPeriodChange?: (tipo: 'dia' | 'mes' | 'ano' | 'period', data: string) => void
  selectedDate?: string
}

export function UsinaView({
  stationInfo,
  realtimeStation,
  devices,
  history,
  granularity,
  setGranularity,
  onDeviceClick,
  onPeriodChange,
  selectedDate
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDay, setCustomDay] = useState<string>("")
  const [customMonth, setCustomMonth] = useState<string>("")
  const [customYear, setCustomYear] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [inputError, setInputError] = useState<string>("")

  // Efeito para atualizar os inputs quando selectedDate mudar
  useEffect(() => {
    if (selectedDate) {
      if (granularity === 'day' && selectedDate.includes('-')) {
        const [ano, mes, dia] = selectedDate.split('-')
        setCustomYear(ano)
        setCustomMonth(mes)
        setCustomDay(dia)
      } else if (granularity === 'month' && selectedDate.includes('-')) {
        const [ano, mes] = selectedDate.split('-')
        setCustomYear(ano)
        setCustomMonth(mes)
      } else if (granularity === 'year') {
        setCustomYear(selectedDate)
      } else if (granularity === 'period' && selectedDate.includes('_')) {
        const [inicio, fim] = selectedDate.split('_')
        setStartDate(inicio)
        setEndDate(fim)
      }
    } else {
      setCustomDay("")
      setCustomMonth("")
      setCustomYear("")
      setStartDate("")
      setEndDate("")
    }
  }, [selectedDate, granularity])

  if (!stationInfo) return null

  const formatTimestamp = (value: string) => {
    if (granularity === "day") {
      const [hours, minutes] = value.split(':')
      return `${hours}:${minutes}`
    }

    if (granularity === "month" || granularity === "period") {
      const [year, month, day] = value.split("-")
      if (day) {
        return `${day}/${month}`
      } else {
        return `${month}/${year}`
      }
    }
    if (granularity === "year") {
      const [month] = value.split("-")
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      return meses[parseInt(month) - 1] || value
    }
    return value
  }

  const getStatusBadge = (status: string) => {
    const normalized = status.toUpperCase()

    if (normalized === "NORMAL" || normalized.includes("ONLINE")) {
      return <Badge status="online">Online</Badge>
    }
    if (normalized === "PARTIAL_OFFLINE") {
      return <Badge status="warning">Parcialmente offline</Badge>
    }
    if (normalized === "ALL_OFFLINE" || normalized.includes("OFFLINE")) {
      return <Badge status="offline">Offline</Badge>
    }
    return <Badge status="warning">{status}</Badge>
  }

  // Ano atual para validações
  const currentYear = new Date().getFullYear()

  // Validação de data
  const isValidDate = (year: string, month: string, day: string): boolean => {
    if (!year || !month || !day) return false
    
    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    const dayNum = parseInt(day)
    
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return false
    if (monthNum < 1 || monthNum > 12) return false
    
    const date = new Date(yearNum, monthNum - 1, dayNum)
    return date.getFullYear() === yearNum && 
           date.getMonth() === monthNum - 1 && 
           date.getDate() === dayNum
  }

  const handleCustomDaySubmit = () => {
    if (!customYear || !customMonth || !customDay) {
      setInputError("Preencha ano, mês e dia")
      return
    }

    if (!isValidDate(customYear, customMonth, customDay)) {
      setInputError("Data inválida")
      return
    }

    if (onPeriodChange) {
      const dataFormatada = `${customYear}-${customMonth.padStart(2, '0')}-${customDay.padStart(2, '0')}`
      onPeriodChange('dia', dataFormatada)
    }
    setInputError("")
    setShowDatePicker(false)
  }

  const handleCustomMonthSubmit = () => {
    if (!customYear || !customMonth) {
      setInputError("Preencha ano e mês")
      return
    }

    const monthNum = parseInt(customMonth)
    if (monthNum < 1 || monthNum > 12) {
      setInputError("Mês inválido (use 1-12)")
      return
    }

    if (onPeriodChange) {
      const dataFormatada = `${customYear}-${customMonth.padStart(2, '0')}`
      onPeriodChange('mes', dataFormatada)
    }
    setInputError("")
    setShowDatePicker(false)
  }

  const handleCustomYearSubmit = () => {
    if (!customYear) {
      setInputError("Preencha o ano")
      return
    }

    const yearNum = parseInt(customYear)
    if (yearNum < 2022 || yearNum > currentYear + 1) {
      setInputError(`Ano inválido (2022-${currentYear + 1})`)
      return
    }

    if (onPeriodChange) {
      onPeriodChange('ano', customYear)
    }
    setInputError("")
    setShowDatePicker(false)
  }

  const handlePeriodSubmit = () => {
    if (!startDate || !endDate) {
      setInputError("Preencha data inicial e final")
      return
    }

    // Validação básica das datas
    const dataInicio = new Date(startDate)
    const dataFim = new Date(endDate)
    
    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      setInputError("Datas inválidas")
      return
    }
    
    if (dataInicio > dataFim) {
      setInputError("Data inicial não pode ser maior que data final")
      return
    }

    // Calcula diferença em dias
    const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 366) {
      setInputError("Período muito grande (máximo 366 dias)")
      return
    }

    if (onPeriodChange) {
      onPeriodChange('period', `${startDate}_${endDate}`)
    }
    setInputError("")
    setShowDatePicker(false)
  }

  const renderPeriodPicker = () => {
    return (
      <div className="date-input-section">
        <h4 className="date-input-title">Selecione o período:</h4>
        <div className="date-input-grid">
          <div className="date-input-group">
            <label className="date-input-label">Data inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              min="2022-01-01"
              max={`${currentYear + 1}-12-31`}
              className="date-input"
            />
          </div>
          
          <div className="date-input-group">
            <label className="date-input-label">Data final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              min="2022-01-01"
              max={`${currentYear + 1}-12-31`}
              className="date-input"
            />
          </div>
          
          <UsinaButton
            onClick={handlePeriodSubmit}
            variant="primary"
            className="date-input-button"
          >
            Buscar
          </UsinaButton>
        </div>
        {inputError && <p className="date-input-error">{inputError}</p>}
      </div>
    )
  }

  const renderDatePicker = () => {
    if (!showDatePicker) return null

    return (
      <div className="date-picker-dropdown">
        <CardGeneric className="date-picker-card">
          {granularity === 'period' && renderPeriodPicker()}
          
          {granularity === 'day' && (
            <div className="date-input-section">
              <h4 className="date-input-title">Selecione uma data:</h4>
              <div className="date-input-grid">
                <div className="date-input-group">
                  <label className="date-input-label">Dia</label>
                  <input
                    type="number"
                    placeholder="Dia"
                    value={customDay}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomDay(e.target.value)}
                    min="1"
                    max="31"
                    className="date-input"
                  />
                </div>
                
                <div className="date-input-group">
                  <label className="date-input-label">Mês</label>
                  <input
                    type="number"
                    placeholder="Mês"
                    value={customMonth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomMonth(e.target.value)}
                    min="1"
                    max="12"
                    className="date-input"
                  />
                </div>
                
                <div className="date-input-group">
                  <label className="date-input-label">Ano</label>
                  <input
                    type="number"
                    placeholder="Ano"
                    value={customYear}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomYear(e.target.value)}
                    min="2022"
                    max={currentYear + 1}
                    className="date-input"
                  />
                </div>
                
                <UsinaButton
                  onClick={handleCustomDaySubmit}
                  variant="primary"
                  className="date-input-button"
                >
                  Buscar
                </UsinaButton>
              </div>
              {inputError && <p className="date-input-error">{inputError}</p>}
            </div>
          )}
          
          {granularity === 'month' && (
            <div className="date-input-section">
              <h4 className="date-input-title">Selecione mês e ano:</h4>
              <div className="date-input-grid">
                <div className="date-input-group">
                  <label className="date-input-label">Mês (1-12)</label>
                  <input
                    type="number"
                    placeholder="Mês"
                    value={customMonth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomMonth(e.target.value)}
                    min="1"
                    max="12"
                    className="date-input"
                  />
                </div>
                
                <div className="date-input-group">
                  <label className="date-input-label">Ano</label>
                  <input
                    type="number"
                    placeholder="Ano"
                    value={customYear}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomYear(e.target.value)}
                    min="2022"
                    max={currentYear + 1}
                    className="date-input"
                  />
                </div>
                
                <UsinaButton
                  onClick={handleCustomMonthSubmit}
                  variant="primary"
                  className="date-input-button"
                >
                  Buscar
                </UsinaButton>
              </div>
              {inputError && <p className="date-input-error">{inputError}</p>}
            </div>
          )}
          
          {granularity === 'year' && (
            <div className="date-input-section">
              <h4 className="date-input-title">Selecione o ano:</h4>
              <div className="date-input-grid">
                <div className="date-input-group">
                  <label className="date-input-label">Ano</label>
                  <input
                    type="number"
                    placeholder="Ano"
                    value={customYear}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomYear(e.target.value)}
                    min="2022"
                    max={currentYear + 1}
                    className="date-input"
                  />
                </div>
                
                <UsinaButton
                  onClick={handleCustomYearSubmit}
                  variant="primary"
                  className="date-input-button"
                >
                  Buscar
                </UsinaButton>
              </div>
              {inputError && <p className="date-input-error">{inputError}</p>}
            </div>
          )}
        </CardGeneric>
      </div>
    )
  }

  const getPeriodLabel = () => {
    if (selectedDate) {
      if (granularity === 'day') {
        const [ano, mes, dia] = selectedDate.split('-')
        return `${dia}/${mes}/${ano}`
      }
      if (granularity === 'month') {
        const [ano, mes] = selectedDate.split('-')
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        const mesNome = meses[parseInt(mes) - 1] || mes
        return `${mesNome}/${ano}`
      }
      if (granularity === 'period') {
        const [inicio, fim] = selectedDate.split('_')
        if (inicio && fim) {
          const [anoInicio, mesInicio, diaInicio] = inicio.split('-')
          const [anoFim, mesFim, diaFim] = fim.split('-')
          return `${diaInicio}/${mesInicio}/${anoInicio} - ${diaFim}/${mesFim}/${anoFim}`
        }
      }
      return selectedDate
    }
    
    if (granularity === 'day') return "Selecionar dia"
    if (granularity === 'month') return "Selecionar mês"
    if (granularity === 'year') return "Selecionar ano"
    if (granularity === 'period') return "Selecionar período"
    return "Selecionar"
  }

  // Função segura para formatar valor do tooltip
  const formatTooltipValue = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "0 kWh"
    return `${value.toFixed(2)} kWh`
  }

  const renderChart = () => {
    if (!history || !history.points || history.points.length === 0) {
      return (
        <div className="empty-chart-message">
          <p>Não há dados disponíveis para o período selecionado</p>
        </div>
      )
    }

    if (granularity === "day") {
      return (
        <LineChart data={history.points}>
          <defs>
            <linearGradient id="genGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="#e5e7eb" />

          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            tick={{ fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />

          <YAxis
            tick={{ fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={60}
          />

          <Tooltip
            contentStyle={{
              background: "white",
              borderRadius: 10,
              border: "1px solid #e5e7eb"
            }}
            formatter={(value: number | undefined) => [formatTooltipValue(value), "Geração"]}
            labelFormatter={(label) => {
              const [hours, minutes] = label.split(':')
              return `Horário: ${hours}:${minutes}`
            }}
          />

          <Line
            type="monotone"
            dataKey="generation_kwh"
            stroke="#3b82f6"
            fill="url(#genGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      )
    } else {
      return (
        <BarChart data={history.points}>
          <CartesianGrid vertical={false} stroke="#e5e7eb" />

          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            tick={{ fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            angle={granularity === "period" ? -45 : 0}
            textAnchor={granularity === "period" ? "end" : "middle"}
            height={granularity === "period" ? 60 : 30}
          />

          <YAxis
            tick={{ fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={60}
          />

          <Tooltip
            contentStyle={{
              background: "white",
              borderRadius: 10,
              border: "1px solid #e5e7eb"
            }}
            formatter={(value: number | undefined) => [formatTooltipValue(value), "Geração"]}
            labelFormatter={(label) => {
              if (granularity === "month" || granularity === "period") {
                const [year, month, day] = label.split("-")
                if (day) {
                  return `Dia: ${day}/${month}/${year}`
                }
                const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
                return `${meses[parseInt(month) - 1]}/${year}`
              }
              if (granularity === "year") {
                const [year, month] = label.split("-")
                const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
                return `${meses[parseInt(month) - 1]}/${year}`
              }
              return `Período: ${label}`
            }}
          />

          <Bar
            dataKey="generation_kwh"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            barSize={granularity === "year" ? 40 : granularity === "period" ? 20 : 30}
          />
        </BarChart>
      )
    }
  }

  return (
    <div className="usina-view">
      {/* INFORMAÇÕES DA USINA */}
      <div className="section">
        <h3 className="section-title">
          <MapPin size={20} />
          Informações da Usina
        </h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Endereço</label>
            <p>{stationInfo.locationAddress || "—"}</p>
          </div>
          <div className="info-item">
            <label>Capacidade Instalada</label>
            <p className="highlight">{stationInfo.installedCapacity} kWp</p>
          </div>
          <div className="info-item">
            <label>Status da Rede</label>
            {stationInfo.networkStatus && getStatusBadge(stationInfo.networkStatus)}
          </div>
        </div>
      </div>

      {/* RESUMO EM TEMPO REAL */}
      {realtimeStation && (
        <div className="section">
          <h3 className="section-title">
            <Activity size={20} />
            Resumo em Tempo Real
          </h3>
          <div className="stats-grid">
            <StatCard
              title="Potência Total"
              value={`${(realtimeStation.summary.total_power_W / 1000).toFixed(2)} kW`}
              icon={<Zap size={24} />}
              trend="up"
            />
            <StatCard
              title="Inversores"
              value={realtimeStation.summary.device_count}
              subtitle="conectados"
              icon={<Battery size={24} />}
            />
            <StatCard
              title="Última Atualização"
              value={new Date(realtimeStation.summary.last_update).toLocaleTimeString()}
              subtitle={new Date(realtimeStation.summary.last_update).toLocaleDateString()}
              icon={<Calendar size={24} />}
            />
          </div>
        </div>
      )}

      {/* DISPOSITIVOS */}
      <div className="section">
        <h3 className="section-title">
          <Battery size={20} />
          Inversores ({devices.length})
        </h3>
        <div className="devices-grid">
          {devices.map((device) => (
            <CardGeneric
              key={device.deviceId}
              className="device-card"
              onClick={() => onDeviceClick(device)}
            >
              <div className="device-card-header">
                <div className="device-icon-wrapper">
                  <Battery size={20} />
                </div>
                <span className="device-sn">{device.deviceSn}</span>
              </div>
              <div className="device-metrics-grid">
                <div className="device-metric">
                  <label>Potência</label>
                  <span className="device-metric-value">
                    {device.metrics?.power_W?.toLocaleString() || "0"} W
                  </span>
                </div>
                <div className="device-metric">
                  <label>Energia Diária</label>
                  <span className="device-metric-value">
                    {device.metrics?.daily_energy_kWh?.toLocaleString() || "—"} kWh
                  </span>
                </div>
                {device.metrics?.total_energy_kWh && (
                  <div className="device-metric">
                    <label>Total Acumulado</label>
                    <span className="device-metric-value">
                      {device.metrics.total_energy_kWh.toLocaleString()} kWh
                    </span>
                  </div>
                )}
              </div>
              <div className="device-card-footer">
                <span className="device-click-hint">Clique para detalhes →</span>
              </div>
            </CardGeneric>
          ))}
        </div>
      </div>

      {/* SELETOR DE PERÍODO */}
      <div className="section">
        <div className="period-selector-container">
          <div className="period-buttons">
            <UsinaButton
              onClick={() => {
                setGranularity("day")
                setShowDatePicker(false)
                setInputError("")
              }}
              variant={granularity === "day" ? "primary" : "secondary"}
              className={`period-btn ${granularity === "day" ? "period-btn-active" : ""}`}
            >
              Dia
            </UsinaButton>
            
            <UsinaButton
              onClick={() => {
                setGranularity("month")
                setShowDatePicker(false)
                setInputError("")
              }}
              variant={granularity === "month" ? "primary" : "secondary"}
              className={`period-btn ${granularity === "month" ? "period-btn-active" : ""}`}
            >
              Mês
            </UsinaButton>
            
            <UsinaButton
              onClick={() => {
                setGranularity("year")
                setShowDatePicker(false)
                setInputError("")
              }}
              variant={granularity === "year" ? "primary" : "secondary"}
              className={`period-btn ${granularity === "year" ? "period-btn-active" : ""}`}
            >
              Ano
            </UsinaButton>

            <UsinaButton
              onClick={() => {
                setGranularity("period")
                setShowDatePicker(false)
                setStartDate("")
                setEndDate("")
                setInputError("")
              }}
              variant={granularity === "period" ? "primary" : "secondary"}
              className={`period-btn ${granularity === "period" ? "period-btn-active" : ""}`}
            >
              Período
            </UsinaButton>
          </div>

          {onPeriodChange && (
            <div className="date-selector-wrapper">
              <UsinaButton
                onClick={() => setShowDatePicker(!showDatePicker)}
                variant="secondary"
                className="date-selector-button"
              >
                <CalendarDays size={16} />
                {getPeriodLabel()}
                <ChevronDown size={16} />
              </UsinaButton>
              {renderDatePicker()}
            </div>
          )}
        </div>
      </div>

      {/* HISTÓRICO DA USINA */}
      {history && (
        <div className="section">
          <h3 className="section-title">
            <BarChart3 size={20} />
            Histórico de Geração
          </h3>
          <CardGeneric className="chart-card">
            <div className="chart-header">
              <div className="chart-stats">
                <div className="chart-stat">
                  <label>Total no período</label>
                  <span>{history.summary.total_generation_kwh.toLocaleString()} kWh</span>
                </div>
                <div className="chart-stat">
                  <label>Média</label>
                  <span>{history.summary.average_generation_kwh.toFixed(2)} kWh</span>
                </div>
                <div className="chart-stat">
                  <label>Melhor dia</label>
                  <span>{history.summary.best_generation_kwh.toFixed(2)} kWh</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              {renderChart()}
            </ResponsiveContainer>
          </CardGeneric>
        </div>
      )}
    </div>
  )
}

export default UsinaView
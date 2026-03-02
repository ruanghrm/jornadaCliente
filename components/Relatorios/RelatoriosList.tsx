// components/Relatorios/RelatoriosList.tsx

import React from 'react';
import {
  FaSolarPanel,
  FaUser,
  FaBuilding,
  FaBolt,
  FaCalendarAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaSpinner,
  FaSync,
  FaFilter
} from 'react-icons/fa';
import { useRelatorios } from './useRelatorios';
import type { FiltroStatus } from './types';
import './Relatorios.css';

interface RelatoriosListProps {
  onError?: (error: string) => void;
}

const formatEnergy = (kWh: number): string => {
  if (kWh >= 1000) {
    return `${(kWh / 1000).toFixed(2)} MWh`;
  }
  return `${kWh.toFixed(2)} kWh`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const RelatoriosList: React.FC<RelatoriosListProps> = () => {
  const { 
    relatorios, 
    loading, 
    error, 
    filtro, 
    setFiltro, 
    buscarDados 
  } = useRelatorios();

  const filtros: { label: string; value: FiltroStatus; color: string }[] = [
    { label: 'Todos', value: 'todos', color: '#f36d2f' },
    { label: 'Ok', value: 'ok', color: '#4CAF50' },
    { label: 'Falha', value: 'falha', color: '#f44336' },
    { label: 'Alerta', value: 'alerta', color: '#ffb300' },
    { label: 'Incompletos', value: 'incompleto', color: '#795548' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <FaCheckCircle />;
      case 'falha':
        return <FaTimesCircle />;
      case 'alerta':
        return <FaExclamationTriangle />;
      case 'incompleto':
        return <FaInfoCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ok':
        return 'status-ok';
      case 'falha':
        return 'status-falha';
      case 'alerta':
        return 'status-alerta';
      case 'incompleto':
        return 'status-incompleto';
      default:
        return '';
    }
  };

  // Cards de resumo
  const totalUsinas = relatorios.length;
  const usinasMonitoradas = relatorios.filter(r => r.status !== 'falha').length;
  const usinasPro = relatorios.filter(r => r.total_dispositivos >= 4).length;
  const usinasArquivadas = relatorios.filter(r => r.status === 'falha').length;

  if (loading) {
    return (
      <div className="relatorios-loading">
        <FaSpinner className="spinning" />
        <p>Carregando relatórios das usinas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relatorios-error">
        <FaExclamationTriangle />
        <p>{error}</p>
        <button onClick={buscarDados} className="btn-retry">
          <FaSync /> Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="relatorios-container">
      {/* Header */}
      <div className="relatorios-header">
        <h2>
          <FaChartLine className="header-icon" />
          Gestão de Relatórios
        </h2>
        <button className="btn-refresh" onClick={buscarDados}>
          <FaSync /> Atualizar
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FaSolarPanel />
          </div>
          <div className="card-content">
            <span className="card-label">Total de usinas</span>
            <span className="card-value">{totalUsinas}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <FaCheckCircle style={{ color: '#4CAF50' }} />
          </div>
          <div className="card-content">
            <span className="card-label">Usinas monitoradas</span>
            <span className="card-value">{usinasMonitoradas}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <FaBolt style={{ color: '#F97316' }} />
          </div>
          <div className="card-content">
            <span className="card-label">Usinas Pro/Avançado</span>
            <span className="card-value">{usinasPro}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <FaTimesCircle style={{ color: '#f44336' }} />
          </div>
          <div className="card-content">
            <span className="card-label">Usinas arquivadas</span>
            <span className="card-value">{usinasArquivadas}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-header">
          <FaFilter className="filtros-icon" />
          <span>Filtrar por status:</span>
        </div>
        <div className="filtros-buttons">
          {filtros.map((f) => (
            <button
              key={f.value}
              className={`filtro-btn ${filtro === f.value ? 'active' : ''}`}
              style={{
                backgroundColor: filtro === f.value ? f.color : 'transparent',
                borderColor: f.color,
                color: filtro === f.value ? '#fff' : f.color,
              }}
              onClick={() => setFiltro(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Relatórios */}
      <div className="relatorios-table-container">
        <table className="relatorios-table">
          <thead>
            <tr>
              <th><FaSolarPanel /> Usina</th>
              <th><FaUser /> Cliente</th>
              <th><FaBuilding /> Geradora</th>
              <th>Produção Hoje</th>
              <th>Produção 15d</th>
              <th>Produção 30d</th>
              <th>Produção Ano</th>
              <th><FaCalendarAlt /> Última Atualização</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {relatorios.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-table">
                  <FaSolarPanel className="empty-icon" />
                  <p>Nenhum relatório encontrado</p>
                </td>
              </tr>
            ) : (
              relatorios.map((relatorio) => (
                <tr key={relatorio.id} className={`status-row ${getStatusClass(relatorio.status)}`}>
                  <td>
                    <div className="usina-info">
                      <FaSolarPanel className="usina-icon" />
                      <span>{relatorio.usina_nome}</span>
                      <small>ID: {relatorio.usina_id}</small>
                    </div>
                  </td>
                  <td>
                    <div className="cliente-info">
                      <strong>{relatorio.cliente_nome}</strong>
                      <small>{relatorio.cliente_email}</small>
                    </div>
                  </td>
                  <td>
                    <span className="geradora-badge">
                      {relatorio.geradora}
                    </span>
                  </td>
                  <td className="producao-cell">
                    <strong>{formatEnergy(relatorio.producao_hoje)}</strong>
                  </td>
                  <td className="producao-cell">
                    {formatEnergy(relatorio.producao_15d)}
                  </td>
                  <td className="producao-cell">
                    {formatEnergy(relatorio.producao_30d)}
                  </td>
                  <td className="producao-cell">
                    {formatEnergy(relatorio.producao_ano)}
                  </td>
                  <td>
                    <span className="data-cell">
                      <FaCalendarAlt />
                      {formatDate(relatorio.ultima_atualizacao)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(relatorio.status)}`}>
                      {getStatusIcon(relatorio.status)}
                      {relatorio.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="relatorios-footer">
        <div className="legenda">
          <span className="legenda-item">
            <FaCheckCircle style={{ color: '#4CAF50' }} /> Ok - Gerando normalmente
          </span>
          <span className="legenda-item">
            <FaExclamationTriangle style={{ color: '#ffb300' }} /> Alerta - Baixa geração
          </span>
          <span className="legenda-item">
            <FaTimesCircle style={{ color: '#f44336' }} /> Falha - Sem comunicação
          </span>
          <span className="legenda-item">
            <FaInfoCircle style={{ color: '#795548' }} /> Incompleto - Dados parciais
          </span>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosList;
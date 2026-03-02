import React, { useState } from 'react';
import { Assinatura, Plano } from './types';
import './SubComponentes.css';

interface AssinaturasListProps {
  assinaturas: Assinatura[];
  planos: Plano[];
  onRenovar: (assinaturaId: string, novoPlanoId: string) => void;
}

const AssinaturasList: React.FC<AssinaturasListProps> = ({ 
  assinaturas, 
  planos,
  onRenovar 
}) => {
  const [renovandoId, setRenovandoId] = useState<string | null>(null);
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'ativa': return 'status-active';
      case 'cancelada': return 'status-cancelled';
      case 'expirada': return 'status-expired';
      default: return '';
    }
  };

  const handleRenovar = (assinaturaId: string) => {
    if (planoSelecionado) {
      onRenovar(assinaturaId, planoSelecionado);
      setRenovandoId(null);
      setPlanoSelecionado('');
    }
  };

  return (
    <div className="assinaturas-list">
      <h2>Assinaturas Atuais</h2>
      
      {assinaturas.length === 0 ? (
        <p className="empty-message">Nenhuma assinatura encontrada</p>
      ) : (
        <div className="table-responsive">
          <table className="assinaturas-table">
            <thead>
              <tr>
                <th>Cliente ID</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {assinaturas.map((assinatura) => (
                <tr key={assinatura.assinatura_id}>
                  <td className="id-column">
                    <span className="id-truncate" title={assinatura.cliente_id}>
                      {assinatura.cliente_id.substring(0, 8)}...
                    </span>
                  </td>
                  <td>
                    <strong>{assinatura.plano_nome}</strong>
                    <br />
                    <small>{assinatura.duracao_dias} dias</small>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(assinatura.status)}`}>
                      {assinatura.status}
                    </span>
                  </td>
                  <td>{formatDate(assinatura.inicio)}</td>
                  <td>{formatDate(assinatura.fim)}</td>
                  <td>{formatCurrency(assinatura.valor)}</td>
                  <td>
                    {renovandoId === assinatura.assinatura_id ? (
                      <div className="renovacao-actions">
                        <select 
                          value={planoSelecionado}
                          onChange={(e) => setPlanoSelecionado(e.target.value)}
                          className="small-select"
                        >
                          <option value="">Selecione um plano</option>
                          {planos.filter(p => p.ativo).map(plano => (
                            <option key={plano.plano_id} value={plano.plano_id}>
                              {plano.nome} - {formatCurrency(plano.valor)}
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleRenovar(assinatura.assinatura_id)}
                          className="btn-confirm"
                          disabled={!planoSelecionado}
                        >
                          ✓
                        </button>
                        <button 
                          onClick={() => setRenovandoId(null)}
                          className="btn-cancel"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setRenovandoId(assinatura.assinatura_id)}
                        className="btn-renovar"
                        disabled={assinatura.status !== 'ativa'}
                      >
                        Renovar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssinaturasList;
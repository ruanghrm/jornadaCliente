// VinculosSolarman.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSync,
  FaPlus,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBolt,
  FaMicrochip,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaShieldAlt,
  FaBox,
  FaUser,
  FaSolarPanel,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaMinusCircle,
  FaTag,
  FaFileAlt,
  FaRegClock,
  FaExclamationCircle
} from 'react-icons/fa';
import type { VinculoSolarman, VinculoCompleto, ClienteBasico, DeviceRealtime, Assinatura } from './types';
import './Vinculos.css';

interface VinculosSolarmanProps {
  onError?: (error: string) => void;
}

interface GarantiaBase {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  tempo_duracao: number; // em dias
  condicoes: string;
  status: boolean;
}

interface GarantiaPayload {
  cliente_id: number;
  contrato_id: number;
  garantia_base_id: number;
  data_inicio: string;
  observacoes: string; // Vai conter apenas o ID da usina
  nome: string;
}

const API_BASE_URL = 'https://backend.sansolenergiasolar.com.br/api/v1';

const VinculosSolarman: React.FC<VinculosSolarmanProps> = ({ onError }) => {
  const [vinculos, setVinculos] = useState<VinculoCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para garantias
  const [garantiasBase, setGarantiasBase] = useState<GarantiaBase[]>([]);
  const [loadingGarantias, setLoadingGarantias] = useState(false);
  
  // Estados para o modal de garantia
  const [showGarantiaModal, setShowGarantiaModal] = useState(false);
  const [selectedVinculo, setSelectedVinculo] = useState<VinculoCompleto | null>(null);
  const [selectedGarantiaId, setSelectedGarantiaId] = useState<number | null>(null);
  const [garantiaLoading, setGarantiaLoading] = useState(false);
  const [garantiaSuccess, setGarantiaSuccess] = useState(false);
  const [garantiaError, setGarantiaError] = useState('');

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

  // Função para buscar garantias base
  const fetchGarantiasBase = useCallback(async () => {
    setLoadingGarantias(true);
    try {
      const data: GarantiaBase[] = await fetchWithAuth(`${API_BASE_URL}/garantias/base`);
      // Filtra apenas garantias ativas
      const garantiasAtivas = data.filter(g => g.status === true);
      setGarantiasBase(garantiasAtivas);
    } catch (err) {
      console.error('Erro ao buscar garantias base:', err);
      onError?.('Erro ao carregar garantias disponíveis');
    } finally {
      setLoadingGarantias(false);
    }
  }, [fetchWithAuth, onError]);

  // Função para calcular dias restantes
  const calcularDiasRestantes = (dataFim: string): string => {
    const hoje = new Date();
    const fim = new Date(dataFim);
    const diffTime = fim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expirada';
    if (diffDays === 0) return 'Último dia';
    if (diffDays <= 7) return `${diffDays} dias ⚠️`;
    return `${diffDays} dias`;
  };

  // Função para buscar assinatura do cliente
  const buscarAssinaturaCliente = useCallback(async (clienteId: number): Promise<Assinatura | null> => {
    try {
      const assinaturas: Assinatura[] = await fetchWithAuth(
        `${API_BASE_URL}/assinaturas/cliente/${clienteId}`
      );
      
      const assinaturaAtiva = assinaturas
        .filter(a => a.status === 'ativa')
        .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime())[0];
      
      return assinaturaAtiva || null;
    } catch (err) {
      console.error(`Erro ao buscar assinatura para cliente ${clienteId}:`, err);
      return null;
    }
  }, [fetchWithAuth]);

  const fetchVinculos = useCallback(async () => {
    setLoading(true);
    try {
      const vinculosData: VinculoSolarman[] = await fetchWithAuth(
        `${API_BASE_URL}/integracoes/solarman/vinculos`
      );

      const vinculosCompletos = await Promise.all(
        vinculosData.map(async (vinculo) => {
          const vinculoCompleto: VinculoCompleto = { vinculo };

          try {
            const clienteData: ClienteBasico = await fetchWithAuth(
              `${API_BASE_URL}/jclientes/${vinculo.cliente_id}`
            );
            vinculoCompleto.cliente = clienteData;

            const assinatura = await buscarAssinaturaCliente(vinculo.cliente_id);
            vinculoCompleto.assinatura = assinatura || undefined;

            const deviceData: DeviceRealtime = await fetchWithAuth(
              `${API_BASE_URL}/integracoes/solarman/devices/${vinculo.solarman_device_id}/realtime`
            );
            vinculoCompleto.dispositivo = deviceData;
          } catch (err) {
            console.error(`Erro ao buscar dados para vínculo ${vinculo.id}:`, err);
          }

          return vinculoCompleto;
        })
      );

      setVinculos(vinculosCompletos);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar vínculos';
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, buscarAssinaturaCliente, onError]);

  // Função para associar garantia
  const associarGarantia = async () => {
    if (!selectedVinculo || !selectedVinculo.cliente || !selectedGarantiaId) return;

    setGarantiaLoading(true);
    setGarantiaError('');
    setGarantiaSuccess(false);

    try {
      // Busca a garantia selecionada para obter o nome
      const garantiaSelecionada = garantiasBase.find(g => g.id === selectedGarantiaId);
      
      const payload: GarantiaPayload = {
        cliente_id: selectedVinculo.cliente.id,
        contrato_id: 1, // Fixo como 1
        garantia_base_id: selectedGarantiaId,
        data_inicio: new Date().toISOString(),
        observacoes: selectedVinculo.vinculo.solarman_device_id, // Apenas o ID da usina
        nome: `Garantia ${garantiaSelecionada?.nome || ''} - ${selectedVinculo.cliente.nome_completo}`
      };

      const result = await fetchWithAuth(`${API_BASE_URL}/garantias/emitir`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log('Garantia associada com sucesso:', result);
      setGarantiaSuccess(true);
      
      // Recarrega os dados após 2 segundos
      setTimeout(() => {
        fetchVinculos();
        setShowGarantiaModal(false);
        setSelectedVinculo(null);
        setSelectedGarantiaId(null);
      }, 2000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao associar garantia';
      setGarantiaError(errorMsg);
    } finally {
      setGarantiaLoading(false);
    }
  };

  const handleAssociarClick = async (vinculo: VinculoCompleto) => {
    setSelectedVinculo(vinculo);
    setSelectedGarantiaId(null);
    setGarantiaSuccess(false);
    setGarantiaError('');
    setShowGarantiaModal(true);
    
    // Carrega as garantias base ao abrir o modal
    await fetchGarantiasBase();
  };

  useEffect(() => {
    fetchVinculos();
  }, [fetchVinculos]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPower = (watts: number) => {
    if (watts >= 1000) {
      return `${(watts / 1000).toFixed(2)} kW`;
    }
    return `${watts} W`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="vinculos-loading">
        <div className="spinner"></div>
        <p>
          <FaSpinner className="spinning" />
          Carregando usinas...
        </p>
      </div>
    );
  }

  return (
    <div className="vinculos-container">
      <div className="vinculos-header">
        <h2>
          <FaSolarPanel className="header-icon" />
          Usinas Associadas
        </h2>
        <button 
          className="btn-refresh" 
          onClick={fetchVinculos}
          disabled={loading}
        >
          <FaSync className={loading ? 'spinning' : ''} />
          Atualizar
        </button>
      </div>

      {vinculos.length === 0 ? (
        <div className="empty-message">
          <FaSolarPanel className="empty-icon" />
          <p>Nenhuma usina encontrada</p>
        </div>
      ) : (
        <div className="vinculos-table-container">
          <table className="vinculos-table">
            <thead>
              <tr>
                <th><FaUser /> Cliente</th>
                <th><FaSolarPanel /> Usina</th>
                <th><FaMicrochip /> Status</th>
                <th><FaTag /> Assinatura</th>
                <th><FaRegClock /> Tempo Restante</th>
                <th><FaCalendarAlt /> Data do Vínculo</th>
                <th><FaShieldAlt /> Garantia</th>
              </tr>
            </thead>
            <tbody>
              {vinculos.map((item) => (
                <tr key={item.vinculo.id} className="vinculo-row">
                  <td>
                    <div className="cliente-info">
                      <strong>{item.cliente?.nome_completo || 'Carregando...'}</strong>
                      <small>
                        <FaEnvelope /> {item.cliente?.email}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className="device-info">
                      <span className="device-id">
                        <FaMicrochip /> {item.vinculo.solarman_device_id}
                      </span>
                      {item.dispositivo && (
                        <small>
                          <FaBolt /> {formatPower(item.dispositivo.metrics.power_W)}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    {item.dispositivo ? (
                      <span className="status-badge status-active">
                        <FaCheckCircle /> Online
                      </span>
                    ) : (
                      <span className="status-badge status-expired">
                        <FaMinusCircle /> Offline
                      </span>
                    )}
                  </td>
                  <td>
                    {item.assinatura ? (
                      <div className="assinatura-info">
                        <strong>{item.assinatura.plano_nome}</strong>
                        <small>
                          <FaCalendarAlt /> {formatDateShort(item.assinatura.inicio)} - {formatDateShort(item.assinatura.fim)}
                        </small>
                      </div>
                    ) : (
                      <span className="status-badge status-expired">
                        <FaTimesCircle /> Sem assinatura
                      </span>
                    )}
                  </td>
                  <td>
                    {item.assinatura ? (
                      <span className={`tempo-restante ${
                        calcularDiasRestantes(item.assinatura.fim).includes('⚠️') ? 'urgente' : ''
                      }`}>
                        {calcularDiasRestantes(item.assinatura.fim).includes('⚠️') && <FaExclamationTriangle />}
                        {calcularDiasRestantes(item.assinatura.fim)}
                      </span>
                    ) : (
                      <span className="tempo-restante-indisponivel">
                        <FaMinusCircle /> —
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="data-vinculo">
                      <FaClock /> {formatDate(item.vinculo.created_at)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn-associar ${item.assinatura ? 'disabled' : ''}`}
                      onClick={() => handleAssociarClick(item)}
                      disabled={!!item.assinatura}
                      title={item.assinatura ? 'Já possui assinatura' : 'Associar garantia'}
                    >
                      {item.assinatura ? (
                        <>
                          <FaCheck /> Garantia
                        </>
                      ) : (
                        <>
                          <FaPlus /> Garantia
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Garantia */}
      {showGarantiaModal && selectedVinculo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FaShieldAlt className="modal-icon" />
                Associar Garantia
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowGarantiaModal(false)}
                disabled={garantiaLoading}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-info">
                <p>
                  <FaUser className="info-icon" />
                  <strong>Cliente:</strong> {selectedVinculo.cliente?.nome_completo}
                </p>
                <p>
                  <FaEnvelope className="info-icon" />
                  <strong>Email:</strong> {selectedVinculo.cliente?.email}
                </p>
                <p>
                  <FaMicrochip className="info-icon" />
                  <strong>Dispositivo:</strong> {selectedVinculo.vinculo.solarman_device_id}
                </p>
                <p>
                  <FaBolt className="info-icon" />
                  <strong>Plant ID:</strong> {selectedVinculo.vinculo.solarman_plant_id}
                </p>
              </div>

              {garantiaSuccess ? (
                <div className="modal-success">
                  <FaCheckCircle className="success-icon" />
                  <p>Garantia associada com sucesso!</p>
                </div>
              ) : (
                <>
                  <div className="modal-garantias-list">
                    <h4>
                      <FaBox className="section-icon" />
                      Selecione o tipo de garantia:
                    </h4>
                    
                    {loadingGarantias ? (
                      <div className="loading-garantias">
                        <div className="spinner-small"></div>
                        <p>
                          <FaSpinner className="spinning" />
                          Carregando garantias...
                        </p>
                      </div>
                    ) : (
                      <div className="garantias-grid">
                        {garantiasBase.map((garantia) => (
                          <div 
                            key={garantia.id}
                            className={`garantia-card ${selectedGarantiaId === garantia.id ? 'selected' : ''}`}
                            onClick={() => setSelectedGarantiaId(garantia.id)}
                          >
                            <div className="garantia-header">
                              <h4>
                                <FaShieldAlt className="card-icon" />
                                {garantia.nome}
                              </h4>
                              <span className="garantia-preco">
                                <FaDollarSign /> {formatCurrency(garantia.valor)}
                              </span>
                            </div>
                            <p className="garantia-descricao">
                              <FaFileAlt className="desc-icon" />
                              {garantia.descricao}
                            </p>
                            <div className="garantia-footer">
                              <span className="garantia-duracao">
                                <FaClock /> {garantia.tempo_duracao} dias
                              </span>
                              {garantia.condicoes && (
                                <span className="garantia-condicoes" title={garantia.condicoes}>
                                  <FaInfoCircle /> Ver condições
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {garantiaError && (
                    <div className="modal-error">
                      <FaExclamationCircle />
                      <p>{garantiaError}</p>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button
                      className="btn-cancel"
                      onClick={() => setShowGarantiaModal(false)}
                      disabled={garantiaLoading}
                    >
                      <FaTimes />
                      Cancelar
                    </button>
                    <button
                      className="btn-confirm"
                      onClick={associarGarantia}
                      disabled={garantiaLoading || !selectedGarantiaId}
                    >
                      {garantiaLoading ? (
                        <>
                          <FaSpinner className="spinning" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Associar Garantia
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VinculosSolarman;
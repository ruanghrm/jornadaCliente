// ManageSubscriptions.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaShieldAlt, 
  FaPlusCircle, 
  FaMedal, 
  FaClock, 
  FaFileAlt, 
  FaStar, 
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaCrown,
  FaGem,
  FaAward,
  FaRegClock,
  FaRegFileAlt,
  FaRegCheckCircle,
  FaDollarSign,
  FaHeadset,
  FaShieldVirus
} from 'react-icons/fa';
import EditAssinatura from '../components/Assinaturas/EditAssinatura';
import VinculosSolarman from '../components/Assinaturas/VinculosSolarman';
import type { Garantia } from '../components/Assinaturas/types';
import '../components/Assinaturas/Assinaturas.css';

const API_BASE_URL = 'https://backend.sansolenergiasolar.com.br/api/v1';

const ManageSubscriptions: React.FC = () => {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNovaGarantiaModal, setShowNovaGarantiaModal] = useState(false);
  const [showEditGarantiaModal, setShowEditGarantiaModal] = useState(false);
  const [selectedGarantia, setSelectedGarantia] = useState<Garantia | null>(null);

  // Estados para os formulários
  const [novaGarantia, setNovaGarantia] = useState({
    nome: '',
    descricao: '',
    tempo_duracao: 365,
    valor: 0,
    condicoes: '',
    status: true
  });

  // Funções memoizadas com useCallback
  const fetchGarantias = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/garantias/base`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar garantias');
      const data = await response.json();
      setGarantias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar garantias');
    }
  }, []);

  // Buscar dados ao carregar
  useEffect(() => {
    fetchGarantias();
  }, [fetchGarantias]);

  const handleCriarGarantia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/garantias/base`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novaGarantia)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar garantia');
      }

      await fetchGarantias();
      setShowNovaGarantiaModal(false);
      setNovaGarantia({
        nome: '',
        descricao: '',
        tempo_duracao: 365,
        valor: 0,
        condicoes: '',
        status: true
      });
      
      alert('Garantia criada com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar garantia');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (garantia: Garantia) => {
    setSelectedGarantia(garantia);
    setShowEditGarantiaModal(true);
  };

  const handleEditSuccess = () => {
    fetchGarantias();
    setShowEditGarantiaModal(false);
    setSelectedGarantia(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPlanoIcon = (nome: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'Plano Bronze': <FaMedal style={{ color: '#cd7f32' }} />,
      'Plano Prata': <FaAward style={{ color: '#c0c0c0' }} />,
      'Plano Ouro': <FaCrown style={{ color: '#ffd700' }} />,
      'Plano Platinum': <FaGem style={{ color: '#e5e4e2' }} />
    };
    return icons[nome] || <FaShieldAlt />;
  };

  const getPlanoColor = (nome: string) => {
    const colors: { [key: string]: string } = {
      'Plano Bronze': '#cd7f32',
      'Plano Prata': '#c0c0c0',
      'Plano Ouro': '#ffd700',
      'Plano Platinum': '#e5e4e2'
    };
    return colors[nome] || '#6c757d';
  };

  return (
    <div className="subscriptions-container">
      {/* Header com título e ações */}
      <div className="header-section">
        <h1>
          Gerenciar Garantias
        </h1>
        <div className="header-actions">
          <button 
            className="btn-success"
            onClick={() => setShowNovaGarantiaModal(true)}
          >
            <FaPlusCircle /> Nova Garantia
          </button>
        </div>
      </div>

      {/* Cards de Garantias/Planos */}
      <div className="planos-cards-section">
        <h2>
          Planos de Garantia
        </h2>
        <div className="planos-cards-grid">
          {garantias.filter(g => g.status).map(garantia => {
            const isPlatinum = garantia.nome === 'Plano Platinum';
            
            return (
              <div 
                key={garantia.id} 
                className={`plano-card ${isPlatinum ? 'plano-card-platinum' : ''} clickable-card`}
                style={isPlatinum ? {
                  border: '2px solid #ffd700',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
                } : {}}
                onClick={() => handleEditClick(garantia)}
              >
                {isPlatinum && (
                  <div className="plano-card-badge">
                    <FaStar /> MAIS POPULAR <FaStar />
                  </div>
                )}
                <div className="plano-card-header">
                  <div className="plano-card-title">
                    <span className="plano-card-icon">
                      {getPlanoIcon(garantia.nome)}
                    </span>
                    <h3 style={{ color: getPlanoColor(garantia.nome) }}>
                      {garantia.nome}
                    </h3>
                  </div>
                  <span className="plano-card-price">
                    {garantia.valor === 0 ? 'GRÁTIS' : formatCurrency(garantia.valor)}
                  </span>
                </div>
                <div className="plano-card-body">
                  <div className="plano-card-features">
                    <p className="plano-duracao">
                      <span className="feature-icon">
                        <FaRegClock />
                      </span>
                      {garantia.tempo_duracao} dias de cobertura
                    </p>
                    
                    <p className="plano-descricao">
                      <span className="feature-icon">
                        <FaRegFileAlt />
                      </span>
                      {garantia.descricao}
                    </p>
                    
                    {garantia.condicoes && (
                      <div className="plano-beneficios">
                        <span className="feature-icon">
                          <FaRegCheckCircle />
                        </span>
                        <small>{garantia.condicoes}</small>
                      </div>
                    )}

                    {isPlatinum && (
                      <div className="plano-diferenciais">
                        <p><FaCheckCircle /> Inversor reserva incluso</p>
                        <p><FaShieldVirus /> Seguro de 1 ano</p>
                        <p><FaStar /> Prioridade no atendimento</p>
                        <p><FaHeadset /> Suporte 24/7</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="plano-card-footer">
                  <span className="edit-hint">
                    <FaEdit /> Clique para editar
                  </span>
                </div>
              </div>
            );
          })}
          {garantias.filter(g => g.status).length === 0 && (
            <p className="empty-cards">Nenhuma garantia ativa encontrada</p>
          )}
        </div>
      </div>

      {/* Loading e Error */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <FaTimesCircle /> {error}
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      {/* Seção de Vínculos Solarman */}
      <VinculosSolarman 
        onError={(errorMsg) => setError(errorMsg)}
      />

      {/* Modal Nova Garantia */}
      {showNovaGarantiaModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="modal-icon">
                  <FaShieldAlt />
                </span>
                Criar Nova Garantia
              </h2>
              <button className="modal-close" onClick={() => setShowNovaGarantiaModal(false)}>×</button>
            </div>
            <form onSubmit={handleCriarGarantia}>
              <div className="form-group">
                <label>Nome da Garantia *</label>
                <input
                  type="text"
                  value={novaGarantia.nome}
                  onChange={(e) => setNovaGarantia({...novaGarantia, nome: e.target.value})}
                  placeholder="Ex: Plano Premium Plus"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição *</label>
                <textarea
                  value={novaGarantia.descricao}
                  onChange={(e) => setNovaGarantia({...novaGarantia, descricao: e.target.value})}
                  placeholder="Descreva o que este plano oferece..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaClock /> Tempo de Duração (dias) *
                  </label>
                  <input
                    type="number"
                    value={novaGarantia.tempo_duracao}
                    onChange={(e) => setNovaGarantia({...novaGarantia, tempo_duracao: parseInt(e.target.value)})}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaDollarSign /> Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaGarantia.valor}
                    onChange={(e) => setNovaGarantia({...novaGarantia, valor: parseFloat(e.target.value)})}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaFileAlt /> Condições / Benefícios
                </label>
                <textarea
                  value={novaGarantia.condicoes}
                  onChange={(e) => setNovaGarantia({...novaGarantia, condicoes: e.target.value})}
                  placeholder="Liste as condições e benefícios do plano..."
                  rows={2}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={novaGarantia.status}
                    onChange={(e) => setNovaGarantia({...novaGarantia, status: e.target.checked})}
                  />
                  <span>
                    <FaCheckCircle /> Ativo (disponível para novas assinaturas)
                  </span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowNovaGarantiaModal(false)}>
                  <FaTimesCircle /> Cancelar
                </button>
                <button type="submit" className="btn-success" disabled={loading}>
                  {loading ? 'Criando...' : <><FaCheckCircle /> Criar Garantia</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Garantia */}
      <EditAssinatura
        garantia={selectedGarantia}
        isOpen={showEditGarantiaModal}
        onClose={() => {
          setShowEditGarantiaModal(false);
          setSelectedGarantia(null);
        }}
        onSave={handleEditSuccess}
        setError={setError}
      />
    </div>
  );
};

export default ManageSubscriptions;
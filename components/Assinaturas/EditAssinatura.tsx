// EditAssinatura.tsx
import React, { useState, useEffect } from 'react';
import {
  FaSave,
  FaTimes,
  FaClock,
  FaDollarSign,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaMedal,
  FaAward,
  FaCrown,
  FaGem,
  FaShieldAlt,
  FaRegClock,
  FaRegFileAlt,
  FaTag,
  FaInfoCircle,
  FaSpinner
} from 'react-icons/fa';
import './EditAssinatura.css';

interface Garantia {
  id: number;
  nome: string;
  descricao: string;
  tempo_duracao: number;
  valor: number;
  condicoes: string;
  status: boolean;
}

interface EditAssinaturaProps {
  garantia: Garantia | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  setError: (error: string | null) => void;
}

const API_BASE_URL = 'https://backend.sansolenergiasolar.com.br/api/v1';

const EditAssinatura: React.FC<EditAssinaturaProps> = ({ 
  garantia, 
  isOpen, 
  onClose, 
  onSave,
  setError 
}) => {
  const [editGarantia, setEditGarantia] = useState({
    nome: '',
    descricao: '',
    tempo_duracao: 365,
    valor: 0,
    condicoes: '',
    status: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (garantia) {
      setEditGarantia({
        nome: garantia.nome,
        descricao: garantia.descricao,
        tempo_duracao: garantia.tempo_duracao,
        valor: garantia.valor,
        condicoes: garantia.condicoes || '',
        status: garantia.status
      });
    }
  }, [garantia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!garantia) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/garantias/base/${garantia.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editGarantia)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar garantia');
      }

      onSave();
      onClose();
      
      alert('Garantia atualizada com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar garantia');
    } finally {
      setLoading(false);
    }
  };

  const getPlanoIcon = (nome: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'Plano Bronze': <FaMedal style={{ color: '#cd7f32' }} />,
      'Plano Prata': <FaAward style={{ color: '#c0c0c0' }} />,
      'Plano Ouro': <FaCrown style={{ color: '#ffd700' }} />,
      'Plano Platinum': <FaGem style={{ color: '#e5e4e2' }} />
    };
    return icons[nome] || <FaShieldAlt style={{ color: '#F97316' }} />;
  };

  const getPlanoColor = (nome: string) => {
    const colors: { [key: string]: string } = {
      'Plano Bronze': '#cd7f32',
      'Plano Prata': '#c0c0c0',
      'Plano Ouro': '#ffd700',
      'Plano Platinum': '#e5e4e2'
    };
    return colors[nome] || '#F97316';
  };

  if (!isOpen || !garantia) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span className="modal-icon">
              {getPlanoIcon(garantia.nome)}
            </span>
            Editar {garantia.nome}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="edit-garantia-preview">
          <div 
            className="preview-card"
            style={{ borderLeft: `4px solid ${getPlanoColor(garantia.nome)}` }}
          >
            <h3 style={{ color: getPlanoColor(garantia.nome) }}>
              {getPlanoIcon(editGarantia.nome)}
              {editGarantia.nome}
            </h3>
            <p>
              <FaRegFileAlt />
              <strong>Descrição:</strong> {editGarantia.descricao || 'Não informada'}
            </p>
            <p>
              <FaRegClock />
              <strong>Duração:</strong> {editGarantia.tempo_duracao} dias
            </p>
            <p>
              <FaDollarSign />
              <strong>Valor:</strong> {editGarantia.valor === 0 ? 'Grátis' : 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(editGarantia.valor)}
            </p>
            <p>
              <FaTag />
              <strong>Condições:</strong> {editGarantia.condicoes || 'Não informadas'}
            </p>
            <p>
              <FaInfoCircle />
              <strong>Status:</strong> 
              <span className={`status-badge ${editGarantia.status ? 'status-ativa' : 'status-cancelada'}`}>
                {editGarantia.status ? <FaCheckCircle /> : <FaTimesCircle />}
                {editGarantia.status ? 'Ativo' : 'Inativo'}
              </span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaTag />
              Nome da Garantia *
            </label>
            <input
              type="text"
              value={editGarantia.nome}
              onChange={(e) => setEditGarantia({...editGarantia, nome: e.target.value})}
              placeholder="Ex: Plano Premium Plus"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaRegFileAlt />
              Descrição *
            </label>
            <textarea
              value={editGarantia.descricao}
              onChange={(e) => setEditGarantia({...editGarantia, descricao: e.target.value})}
              placeholder="Descreva o que este plano oferece..."
              rows={3}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <FaClock />
                Duração (dias) *
              </label>
              <input
                type="number"
                value={editGarantia.tempo_duracao}
                onChange={(e) => setEditGarantia({...editGarantia, tempo_duracao: parseInt(e.target.value)})}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FaDollarSign />
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={editGarantia.valor}
                onChange={(e) => setEditGarantia({...editGarantia, valor: parseFloat(e.target.value)})}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <FaFileAlt />
              Condições / Benefícios
            </label>
            <textarea
              value={editGarantia.condicoes}
              onChange={(e) => setEditGarantia({...editGarantia, condicoes: e.target.value})}
              placeholder="Liste as condições e benefícios do plano..."
              rows={2}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editGarantia.status}
                onChange={(e) => setEditGarantia({...editGarantia, status: e.target.checked})}
              />
              {editGarantia.status ? <FaCheckCircle /> : <FaTimesCircle />}
              <span>Ativo (disponível para novas assinaturas)</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              <FaTimes />
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="spinning" />
                  Salvando...
                </>
              ) : (
                <>
                  <FaSave />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssinatura;
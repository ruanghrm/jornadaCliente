// src/pages/Mensagens.tsx
import { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  X,
  Search,
  User,
  Mail,
  Loader,
  MessageCircle,
  Info,
  Star,
  MailCheck,
  MailX
} from 'lucide-react';
import '../components/ComponentsCSS/Mensagens.css';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  selecionado?: boolean;
}

interface UsuariosResponse {
  total: number;
  items: Usuario[];
}

export function Mensagens() {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [destinatarios, setDestinatarios] = useState<number[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [filtroRole, setFiltroRole] = useState<string>('todos');
  const [showUserSelect, setShowUserSelect] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState<{
    tipo: 'sucesso' | 'erro' | 'info';
    mensagem: string;
  } | null>(null);
  const [selecionarTodos, setSelecionarTodos] = useState(false);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);

  // Carregar usuários da API
  const carregarUsuarios = async () => {
    setCarregandoUsuarios(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        'https://backend.sansolenergiasolar.com.br/api/v1/auth/usuarios?limit=100',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }

      const data: UsuariosResponse = await response.json();
      setUsuarios(data.items);
      setTotalUsuarios(data.total);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setResultadoEnvio({
        tipo: 'erro',
        mensagem: 'Erro ao carregar lista de usuários'
      });
    } finally {
      setCarregandoUsuarios(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleSelecionarTodos = () => {
    if (selecionarTodos) {
      setDestinatarios([]);
    } else {
      const idsUsuariosFiltrados = usuariosFiltrados.map(u => u.id);
      setDestinatarios(idsUsuariosFiltrados);
    }
    setSelecionarTodos(!selecionarTodos);
  };

  const handleToggleUsuario = (usuarioId: number) => {
    setDestinatarios(prev => {
      if (prev.includes(usuarioId)) {
        return prev.filter(id => id !== usuarioId);
      } else {
        return [...prev, usuarioId];
      }
    });
  };

  const handleEnviarMensagem = async () => {
    // Validações
    if (!titulo.trim()) {
      setResultadoEnvio({
        tipo: 'erro',
        mensagem: 'O título é obrigatório'
      });
      return;
    }

    if (!mensagem.trim()) {
      setResultadoEnvio({
        tipo: 'erro',
        mensagem: 'A mensagem é obrigatória'
      });
      return;
    }

    if (destinatarios.length === 0) {
      setResultadoEnvio({
        tipo: 'erro',
        mensagem: 'Selecione pelo menos um destinatário'
      });
      return;
    }

    setEnviando(true);
    setResultadoEnvio(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://backend.sansolenergiasolar.com.br/api/v1/notificacoes/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          mensagem: mensagem.trim(),
          destinatarios: destinatarios
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar mensagem');
      }

      setResultadoEnvio({
        tipo: 'sucesso',
        mensagem: `Mensagem enviada com sucesso para ${destinatarios.length} destinatário${destinatarios.length > 1 ? 's' : ''}!`
      });

      // Limpar formulário
      setTitulo('');
      setMensagem('');
      setDestinatarios([]);
      setSelecionarTodos(false);
      
      // Fechar seletor após 3 segundos
      setTimeout(() => {
        setResultadoEnvio(null);
      }, 5000);

    } catch (error) {
      console.error('Erro ao enviar:', error);
      setResultadoEnvio({
        tipo: 'erro',
        mensagem: error instanceof Error ? error.message : 'Erro ao enviar mensagem'
      });
    } finally {
      setEnviando(false);
    }
  };

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchesFiltro = usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(filtro.toLowerCase());
    const matchesRole = filtroRole === 'todos' || usuario.role === filtroRole;
    return matchesFiltro && matchesRole;
  });

  // Roles únicas para o filtro
  const roles = ['todos', ...new Set(usuarios.map(u => u.role))];

  const getRoleLabel = (role: string) => {
    const rolesMap: Record<string, string> = {
      admin: 'Administrador',
      vendedor: 'Vendedor',
      tecnico: 'Técnico',
      usuario: 'Usuário'
    };
    return rolesMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'role-badge-admin',
      vendedor: 'role-badge-vendedor',
      tecnico: 'role-badge-tecnico',
      usuario: 'role-badge-usuario'
    };
    return colors[role] || 'role-badge-default';
  };

  return (
    <div className="mensagens-container">
      {/* Header com título e ações - igual ao Assinaturas */}
      <div className="header-section">
        <h1>
          <Bell size={28} />
          Gerenciar Mensagens
        </h1>
        <div className="header-actions">
          <button 
            className="btn-success"
            onClick={() => setShowUserSelect(!showUserSelect)}
          >
            <Users size={16} /> {showUserSelect ? 'Ocultar lista' : 'Selecionar destinatários'}
          </button>
        </div>
      </div>

      {/* Cards de Mensagens */}
      <div className="mensagens-cards-section">
        <h2>
          <MessageCircle size={24} />
          Nova Mensagem
        </h2>
        <div className="mensagens-cards-grid">
          {/* Card Principal - Formulário */}
          <div className="mensagem-card">
            <div className="mensagem-card-header">
              <h2>
                <Send size={20} />
                Enviar Notificação
              </h2>
            </div>
            <div className="mensagem-card-body">
              <div className="mensagem-form">
                <div className="form-group">
                  <label>
                    <MailCheck size={16} />
                    Título da Notificação
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Manutenção Programada"
                    maxLength={100}
                    className="form-input"
                  />
                  <span className="input-counter">{titulo.length}/100</span>
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={16} />
                    Mensagem
                    <span className="required">*</span>
                  </label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite o conteúdo da mensagem..."
                    rows={5}
                    maxLength={500}
                    className="form-textarea"
                  />
                  <span className="input-counter">{mensagem.length}/500</span>
                </div>

                {showUserSelect && (
                  <div className="user-select-dropdown">
                    <div className="user-select-header">
                      <div className="search-box">
                        <Search size={16} />
                        <input
                          type="text"
                          placeholder="Buscar por nome ou email..."
                          value={filtro}
                          onChange={(e) => setFiltro(e.target.value)}
                        />
                      </div>

                      <select 
                        value={filtroRole} 
                        onChange={(e) => setFiltroRole(e.target.value)}
                        className="role-filter"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>
                            {role === 'todos' ? 'Todos os perfis' : getRoleLabel(role)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="user-select-actions">
                      <label className="select-all">
                        <input
                          type="checkbox"
                          checked={selecionarTodos}
                          onChange={handleSelecionarTodos}
                        />
                        Selecionar todos ({usuariosFiltrados.length})
                      </label>
                      <span className="total-usuarios">
                        Total: {totalUsuarios} usuários
                      </span>
                    </div>

                    {carregandoUsuarios ? (
                      <div className="loading-users">
                        <Loader className="spinner" size={24} />
                        <span>Carregando usuários...</span>
                      </div>
                    ) : (
                      <div className="user-list">
                        {usuariosFiltrados.map(usuario => (
                          <label
                            key={usuario.id}
                            className={`user-item ${destinatarios.includes(usuario.id) ? 'selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={destinatarios.includes(usuario.id)}
                              onChange={() => handleToggleUsuario(usuario.id)}
                            />
                            <div className="user-info">
                              <div className="user-name">
                                <User size={14} />
                                <span>{usuario.nome}</span>
                              </div>
                              <div className="user-email">
                                <Mail size={12} />
                                <span>{usuario.email}</span>
                              </div>
                            </div>
                            <span className={`role-badge ${getRoleColor(usuario.role)}`}>
                              {getRoleLabel(usuario.role)}
                            </span>
                          </label>
                        ))}

                        {usuariosFiltrados.length === 0 && (
                          <div className="no-results">
                            <AlertCircle size={24} />
                            <p>Nenhum usuário encontrado</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {resultadoEnvio && (
                  <div className={`resultado-mensagem ${resultadoEnvio.tipo}`}>
                    {resultadoEnvio.tipo === 'sucesso' && <CheckCircle size={20} />}
                    {resultadoEnvio.tipo === 'erro' && <AlertCircle size={20} />}
                    {resultadoEnvio.tipo === 'info' && <Bell size={20} />}
                    <span>{resultadoEnvio.mensagem}</span>
                    <button 
                      className="close-result"
                      onClick={() => setResultadoEnvio(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    onClick={handleEnviarMensagem}
                    className="enviar-button"
                    disabled={enviando || !titulo.trim() || !mensagem.trim() || destinatarios.length === 0}
                  >
                    {enviando ? (
                      <>
                        <Loader className="spinner" size={16} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Enviar Mensagem
                      </>
                    )}
                  </button>
                  
                  <span className="destinatarios-resumo">
                    <Users size={14} />
                    {destinatarios.length} destinatário{destinatarios.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Informações - estilo igual ao plano Platinum */}
          <div className="mensagem-card" style={{
            border: '2px solid #28a745',
            boxShadow: '0 4px 20px rgba(40, 167, 69, 0.3)'
          }}>
            <div className="mensagem-card-badge" style={{
              background: '#28a745',
              color: 'white',
              padding: '0.25rem 1rem',
              position: 'absolute',
              top: '1rem',
              right: '-2rem',
              transform: 'rotate(45deg)',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              <Star size={12} /> DICAS <Star size={12} />
            </div>
            <div className="mensagem-card-header" style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
            }}>
              <h2>
                <Info size={20} />
                Sobre Mensagens Automáticas
              </h2>
            </div>
            <div className="mensagem-card-body">
              <div className="info-card-content">
                <div className="info-item" style={{
                  background: '#f8f9fa',
                  borderLeft: '4px solid #28a745'
                }}>
                  <strong>📌 Importante:</strong>
                  <p>As mensagens serão enviadas como notificações para os usuários selecionados.</p>
                </div>
                
                <div className="info-item" style={{
                  background: '#f8f9fa',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <strong>🎯 Dicas:</strong>
                  <ul>
                    <li>Use títulos claros e objetivos</li>
                    <li>Seja específico na mensagem</li>
                    <li>Selecione apenas os destinatários relevantes</li>
                    <li>Evite enviar mensagens duplicadas</li>
                  </ul>
                </div>

                <div className="info-stats">
                  <div className="stat" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <span className="stat-value">{totalUsuarios}</span>
                    <span className="stat-label">Total de usuários</span>
                  </div>
                  <div className="stat" style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white'
                  }}>
                    <span className="stat-value">{destinatarios.length}</span>
                    <span className="stat-label">Selecionados</span>
                  </div>
                </div>

                {destinatarios.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    background: '#fff3cd',
                    color: '#856404',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}>
                    <MailX size={20} />
                    <span>Nenhum destinatário selecionado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading e Error - igual ao Assinaturas */}
      {enviando && (
        <div className="loading-spinner" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #28a745',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#333' }}>Enviando mensagem...</p>
        </div>
      )}
    </div>
  );
}

export default Mensagens;
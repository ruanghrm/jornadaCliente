// src/types.ts

// -----------------------------------------------------
// TAG
// -----------------------------------------------------
export interface Tag {
  id: number;
  name: string;
  color: string;
  scope: string;
  is_active: boolean;
  created_at: string;
}

export interface Attachment {
  id: number;
  filename: string;
  mime_type: string;
  size_bytes: number;
  is_image: boolean;
  created_at: number;
}

// -----------------------------------------------------
// CLIENTE
// -----------------------------------------------------
export interface Cliente {
  id: number;
  nome_completo: string;
  telefone: string;
  email?: string;
  usinas?: string;
  responsaveis?: string;
  acessos?: string;
  energiaGerada?: string;
  economiaMensal?: string;
  nivelGarantia?: "Bronze" | "Prata" | "Ouro" | "Platinum";
  consumoEnergia?: string;
  statusProjeto?: string;
  cpf?: string;
  tags?: Tag[];
  ativo?: boolean;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  numero_casa?: string;
  complemento?: string;
  contratos?: Contrato[];
  tickets?: number;
}

// -----------------------------------------------------
// CONTRATO (SALVO NO BANCO)
// -----------------------------------------------------
export interface Contrato {
  id: number;
  inversor_modelo: string;
  inversor_potencia_w: number;
  inversor_quantidade: number;
  placa_modelo: string;
  placa_potencia_w: number;
  placa_quantidade: number;
  status: string;
  dt_venda: string;
  dt_instalacao?: string;
  dt_ligacao?: string;
}

// -----------------------------------------------------
// TIPO DE CONTRATO DO TEMPLATE
// -----------------------------------------------------
export type ContratoTemplateTipo =
  | "monitoramento"
  | "supervisao"
  | "jornada_solar"
  | "tecnico"
  | "locacao";

// -----------------------------------------------------
// CAMPOS DO TEMPLATE (USADOS APENAS PARA GERAR DOCUMENTO)
// NÃO vão para o banco!!!
// -----------------------------------------------------
export interface ContratoTemplateData {
  // Campos genéricos esperados pelo backend
  CLIENTE?: string;
  ENDERECO?: string;
  CIDADE?: string;
  ESTADO?: string;
  CPF_CNPJ?: string;

  // Equipamentos
  inversor_modelo?: string;
  inversor_potencia_w?: number | string;
  inversor_quantidade?: number | string;

  placa_modelo?: string;
  placa_potencia_w?: number | string;
  placa_quantidade?: number | string;

  fabricante_modulos?: string;
  nome_fabricante_inversor?: string;
  fornecedor_equipamentos?: string;

  // Informações de projeto / rede
  distribuidora?: string;
  dados_rede_novos_opcional?: string;
  potencia_nominal_kwp?: number | string;

  // Tabela de preço
  tabela_preco_anexa_sim_nao?: string;
  link_tabela_preco?: string;

  // Campos adicionais usados pelas variações de contrato
  VALORES_E_CONDICOES?: string;

  // Permite campos flexíveis caso novos sejam adicionados
  [key: string]: string | number | undefined;
}

// -----------------------------------------------------
// PAYLOAD FINAL ENVIADO PARA O BACKEND
// -----------------------------------------------------
export interface GerarContratoPayload {
  template_id: number;
  dados: ContratoTemplateData;
}

// C:\Users\ruang\Desktop\jornada\types\ticket.ts
export interface Tag {
  id: number;
  name: string;
  color: string;
  scope: string;
  is_active: boolean;
  created_at: string;
}

export interface Ticket {
  id: number;
  titulo: string;
  descricao: string;
  prioridade: string;
  categoria: string;
  usina: string;
  cliente: string;
  status: string;
  tipo: string;
  responsaveis: string;
  criacao: string;
  prazo: string;
  cliente_id?: number;
  assigned_user_id?: number | null; // Adicione este campo se necessário
}

export interface TicketAPI {
  id: number;
  titulo: string;
  descricao: string;
  prioridade: string;
  categoria: string;
  status: string;
  cliente_nome: string;
  cliente_id?: number;
  created_at: string;
  resolved_at?: string | null;
}

// Interface para o LoginResponse se precisar
export interface LoginResponse {
  token: string;
  nome: string;
  email: string;
  role: string;
}

// C:\Users\ruang\Desktop\jornada\src\types.tsx
// Adicione estas interfaces

export interface Comentario {
  id: number;
  ticket_id: number;
  texto: string;
  created_at: string;
  autor_user_id: number;
  autor?: {
    id: number;
    nome: string;
  };
  anexos?: Anexo[];
}

export interface Anexo {
  id: number;
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export interface CommentCreate {
  texto: string;
}

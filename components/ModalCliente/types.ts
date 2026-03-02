import type { Cliente, Contrato, Tag, Attachment } from "../../src/types";
import type { Dispatch, SetStateAction } from "react";

export interface ModalClienteBaseProps {
  cliente: Cliente;
  onClose: () => void;
}

export interface InfoCardProps {
  label: string;
  value: string | undefined;
  highlight?: "success" | "error";
  multiLine?: boolean;
}

export interface TagsSectionProps {
  cliente: Cliente;
  tags: Tag[];
  clienteTags: Tag[];
  loadingTags: boolean;
  onAnexarTag: (tagId: number) => Promise<void>;
  onRemoverTag: (tag: Tag) => Promise<void>;
}

export interface DocumentosSectionProps {
  cliente: Cliente;
  attachments: Attachment[];
  loadingAttachments: boolean;
  uploading: boolean;
  dragOver: boolean;
  onUpload: (file: File) => Promise<void>;
  onDownload: (attachmentId: number) => Promise<void>;
  onDragOver: (value: boolean) => void;
}

export interface ContratosSectionProps {
  cliente: Cliente;
  contratos: Contrato[];
  loadingContratos: boolean;
  errorContratos: string;
  selectedContratoId: number | "";
  contratoData: Record<string, string | number>;
  criandoContrato: boolean;
  onSelectContrato: (id: number) => void;
  // ✅ Corrigido: agora aceita tanto valor direto quanto função updater
  onContratoDataChange: Dispatch<SetStateAction<Record<string, string | number>>>;
  onCriarContrato: (value: boolean) => void;
  onContratoCriado: (contrato: Contrato) => void;
  onContratoAtualizado: (contrato: Contrato) => void;
  onContratoDeletado: (id: number) => void;
}

// Adicione 'usinas' ao tipo da activeTab
export interface TabNavigationProps {
  activeTab: "informacoes" | "documentos" | "contratos" | "usinas"; // ✅ ADICIONADO
  onTabChange: (tab: "informacoes" | "documentos" | "contratos" | "usinas") => void; // ✅ ADICIONADO
}

export interface Usina {
  id: number;
  nome: string;
  capacidade: string;
  localizacao: string;
  status: "Ativa" | "Inativa" | "Em manutenção";
  cliente_id?: number;
  created_at?: string;
  updated_at?: string;
}
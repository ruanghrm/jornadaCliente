import React, { useState, useRef, useEffect } from "react";
import Button from "../Button";
import TagBadge from "../TagBadge";
import type { TagsSectionProps, InfoCardProps } from "./types";
import type { Cliente, Tag } from "../../src/types";
import "./InformacoesTab.css";

// Componente InfoCard - CORRIGIDO para aceitar undefined
const InfoCard: React.FC<InfoCardProps> = ({ label, value, highlight, multiLine }) => {
  const highlightColor = highlight === "success" ? "#059669" :
    highlight === "error" ? "#dc2626" : "#1f2937";

  // Garantir que value seja sempre string (usando ||)
  const displayValue = value || "-";

  return (
    <div className="info-card-container">
      <div className="info-card-label">
        {label}
      </div>
      <div 
        className={`info-card-value ${multiLine ? 'multiline' : ''} ${highlight ? highlight : ''}`}
        style={{ color: highlightColor }}
      >
        {displayValue}
      </div>
    </div>
  );
};

// Componente de Tags - Agora com dropdown melhorado
const TagsSection: React.FC<TagsSectionProps> = ({
  tags,
  clienteTags,
  loadingTags,
  onAnexarTag,
  onRemoverTag
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar tags que ainda não estão associadas
  const tagsDisponiveis = tags.filter(
    tag => !clienteTags.some(ct => ct.id === tag.id)
  );

  // Filtrar por termo de busca
  const tagsFiltradas = tagsDisponiveis.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTag = (tagId: number) => {
    onAnexarTag(tagId);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="tags-section">
      <div className="tags-header">
        <h3>Tags do Cliente</h3>
        <div className="select-container" ref={dropdownRef}>
          <div 
            className="tag-select"
            onClick={() => !loadingTags && setIsDropdownOpen(!isDropdownOpen)}
            style={{ cursor: loadingTags ? 'not-allowed' : 'pointer' }}
          >
            {searchTerm || "+ Adicionar tag..."}
          </div>
          <div className="select-arrow">▼</div>
          
          {isDropdownOpen && !loadingTags && (
            <div className="tags-dropdown">
              {tagsDisponiveis.length === 0 ? (
                <div className="dropdown-item" style={{ color: '#94a3b8' }}>
                  Nenhuma tag disponível
                </div>
              ) : (
                tagsFiltradas.map((tag) => (
                  <div
                    key={tag.id}
                    className="dropdown-item"
                    onClick={() => handleSelectTag(tag.id)}
                  >
                    <TagBadge
                      label={tag.name}
                      color={tag.color}
                      size="sm"
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`tags-container ${loadingTags ? 'loading-tags' : ''}`}>
        {clienteTags.length === 0 ? (
          <div className="empty-tags">
            Nenhuma tag atribuída
          </div>
        ) : (
          clienteTags.map((tag) => (
            <div key={tag.id} className="tag-item">
              <TagBadge
                label={tag.name}
                color={tag.color}
                size="sm"
              />
              <button
                onClick={() => onRemoverTag(tag)}
                className="tag-remove-btn"
                title="Remover tag"
                disabled={loadingTags}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Componente Principal da Aba Informações
export const InformacoesTab: React.FC<{
  cliente: Cliente;
  tags: Tag[];
  clienteTags: Tag[];
  loadingTags: boolean;
  onAnexarTag: (tagId: number) => Promise<void>;
  onRemoverTag: (tag: Tag) => Promise<void>;
  openWhatsApp: () => void;
}> = ({
  cliente,
  tags,
  clienteTags,
  loadingTags,
  onAnexarTag,
  onRemoverTag,
  openWhatsApp
}) => {
  return (
    <div className="informacoes-tab">
      <TagsSection
        cliente={cliente}
        tags={tags}
        clienteTags={clienteTags}
        loadingTags={loadingTags}
        onAnexarTag={onAnexarTag}
        onRemoverTag={onRemoverTag}
      />

      <div className="info-section">
        <h3>Informações Pessoais</h3>

        <div className="info-grid">
          <InfoCard label="Nome Completo" value={cliente.nome_completo} />
          <InfoCard label="Email" value={cliente.email} />
          <InfoCard label="CPF" value={cliente.cpf} />
          <InfoCard label="Telefone" value={cliente.telefone} />
          <InfoCard
            label="Status"
            value={cliente.ativo ? "Ativo" : "Inativo"}
            highlight={cliente.ativo ? "success" : "error"}
          />
          <InfoCard label="CEP" value={cliente.cep} />
          <div className="address-card">
            <InfoCard
              label="Endereço"
              value={`${cliente.logradouro || ""}, ${cliente.numero_casa || ""}${cliente.complemento ? ` - ${cliente.complemento}` : ""} - ${cliente.bairro || ""}, ${cliente.cidade || ""}/${cliente.estado || ""}`}
              multiLine
            />
          </div>
        </div>
      </div>

      {cliente.telefone && (
        <div className="whatsapp-section">
          <Button
            variant="whatsapp"
            onClick={openWhatsApp}
            title="Abrir WhatsApp"
            className="whatsapp-button"
          />
        </div>
      )}
    </div>
  );
};
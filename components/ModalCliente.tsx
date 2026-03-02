import React, { useState, useEffect, useCallback } from "react";
import { ModalHeader } from "./ModalHeader";
import { TabNavigation } from "./ModalCliente/TabNavigation";
import { InformacoesTab } from "./ModalCliente/InformacoesTab";
import { DocumentosTab } from "./ModalCliente/DocumentosTab";
import { ContratosTab } from "./ModalCliente/ContratosTab";
import { UsinasTab } from "./ModalCliente/UsinasTab";
import type { Cliente, Contrato, Tag, Attachment } from "../src/types";
import type { StationInfo as Usina, SolplanetPlant, SolarmanStation } from "../components/Usinas/types";
import { useNavigate } from "react-router-dom";

interface ModalClienteProps {
  cliente: Cliente;
  onClose: () => void;
}

export const ModalCliente: React.FC<ModalClienteProps> = ({ cliente, onClose }) => {
  const [selectedContratoId, setSelectedContratoId] = useState<number | "">("");
  const [contratoData, setContratoData] = useState<Record<string, string | number>>({});
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const [errorContratos, setErrorContratos] = useState("");
  const [criandoContrato, setCriandoContrato] = useState(false);
  const [activeTab, setActiveTab] = useState<"informacoes" | "documentos" | "contratos" | "usinas">("informacoes");

  // TAGS
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [clienteTags, setClienteTags] = useState<Tag[]>([]);

  // ATTACHMENTS
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // USINAS
  const [usinasAssociadas, setUsinasAssociadas] = useState<Usina[]>([]);

  const navigate = useNavigate();

  // 🔹 Função para fazer fetch com token e tratamento de 401
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      throw new Error("No token found");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      localStorage.clear();
      navigate("/login");
      throw new Error("Sessão expirada");
    }

    return response;
  }, [navigate]);

  // 🔹 Buscar todas as tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        const resp = await fetchWithAuth(
          "https://backend.sansolenergiasolar.com.br/api/v1/tags"
        );
        const data = await resp.json();
        setTags(data);
      } catch (err) {
        console.error("Erro ao carregar tags", err);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, [fetchWithAuth]);

  // 🔹 Buscar tags anexadas ao cliente
  useEffect(() => {
    const fetchClienteTags = async () => {
      try {
        const resp = await fetchWithAuth(
          `https://backend.sansolenergiasolar.com.br/api/v1/tags/entity/cliente/${cliente.id}`
        );
        const data = await resp.json();
        setClienteTags(data);
      } catch (err) {
        console.error("Erro ao buscar tags do cliente:", err);
      }
    };

    if (cliente.id) fetchClienteTags();
  }, [cliente.id, fetchWithAuth]);

  // 🔹 Anexar Tag ao Cliente
  const anexarTagAoCliente = async (tagId: number) => {
    if (!confirm("Deseja anexar essa tag a este cliente?")) return;

    try {
      await fetchWithAuth(
        "https://backend.sansolenergiasolar.com.br/api/v1/tags/attach",
        {
          method: "POST",
          body: JSON.stringify({
            tag_id: tagId,
            entity_type: "cliente",
            entity_id: cliente.id,
          }),
        }
      );

      const updated = await fetchWithAuth(
        `https://backend.sansolenergiasolar.com.br/api/v1/tags/entity/cliente/${cliente.id}`
      );
      const updatedTags = await updated.json();
      setClienteTags(updatedTags);
      alert("Tag anexada com sucesso!");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Erro ao anexar tag");
    }
  };

  // 🔹 Remover Tag do Cliente
  const removerTagDoCliente = async (tag: Tag) => {
    const confirmar = confirm(`Deseja remover a tag "${tag.name}"?`);
    if (!confirmar) return;

    try {
      await fetchWithAuth(
        "https://backend.sansolenergiasolar.com.br/api/v1/tags/detach",
        {
          method: "DELETE",
          body: JSON.stringify({
            tag_id: tag.id,
            entity_type: "cliente",
            entity_id: cliente.id,
          }),
        }
      );
      setClienteTags((prev) => prev.filter((t) => t.id !== tag.id));
      alert("Tag removida com sucesso!");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Erro ao remover tag");
    }
  };

  // 🔹 Buscar anexos do cliente
  const fetchAttachments = useCallback(async () => {
    try {
      setLoadingAttachments(true);
      const resp = await fetchWithAuth(
        "https://backend.sansolenergiasolar.com.br/api/v1/attachments/list",
        {
          method: "POST",
          body: JSON.stringify({ cliente_id: cliente.id }),
        }
      );
      const data = await resp.json();
      setAttachments(data);
    } catch (err) {
      console.error("Erro ao buscar anexos:", err);
    } finally {
      setLoadingAttachments(false);
    }
  }, [cliente.id, fetchWithAuth]);

  // 🔹 Upload de arquivo
  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("cliente_id", String(cliente.id));
      formData.append("file", file);

      const resp = await fetch(
        "https://backend.sansolenergiasolar.com.br/api/v1/attachments/upload",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!resp.ok) {
        if (resp.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        throw new Error("Erro no upload do arquivo");
      }

      const uploaded = await resp.json();

      const confirmResp = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/attachments/${uploaded.id}/confirm`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: uploaded.filename,
            mime_type: uploaded.mime_type,
            size_bytes: file.size,
            checksum: "",
            is_image: uploaded.is_image,
          }),
        }
      );

      if (!confirmResp.ok) {
        if (confirmResp.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        throw new Error("Erro ao confirmar upload");
      }

      alert("Arquivo enviado com sucesso!");
      fetchAttachments();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Erro inesperado no upload");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Download de arquivo
  const handleDownload = async (attachmentId: number) => {
    try {
      const resp = await fetchWithAuth(
        `https://backend.sansolenergiasolar.com.br/api/v1/attachments/${attachmentId}/presign-download`
      );
      const data = await resp.json();
      window.open(data.download_url, "_blank");
    } catch (err) {
      console.error("Erro ao gerar link de download:", err);
      alert("Não foi possível gerar link de download");
    }
  };

  // 🔹 Buscar anexos ao abrir modal
  useEffect(() => {
    if (cliente.id) fetchAttachments();
  }, [cliente.id, fetchAttachments]);

  // 🔹 Contratos do cliente
  useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoadingContratos(true);
        setErrorContratos("");
        const resp = await fetchWithAuth(
          `https://backend.sansolenergiasolar.com.br/api/v1/contratos/cliente/${cliente.id}`
        );
        const data = await resp.json();
        setContratos(data);
      } catch (err: unknown) {
        if (err instanceof Error) setErrorContratos(err.message);
        else setErrorContratos("Falha ao buscar contratos");
      } finally {
        setLoadingContratos(false);
      }
    };

    if (cliente.id) fetchContratos();
  }, [cliente.id, fetchWithAuth]);

  interface SolarmanAssociacao {
  id: string;
  cliente_id: number;
  solarman_device_id: string;
  solarman_plant_id: string;
  solarman_email: string;
  createdAt: string;
}

interface SolarmanStationDetalhada {
  id: number;
  name: string;
  installedCapacity?: number;
  generationPower?: number;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  networkStatus?: string;
}

  // Substitua o useEffect atual (linhas ~240-256) por este:
useEffect(() => {
  const fetchUsinasAssociadas = async () => {
    try {
      // Busca usinas Solplanet associadas
      const respSolplanet = await fetchWithAuth(
        `https://backend.sansolenergiasolar.com.br/api/v1/usinas/cliente/${cliente.id}`
      );
      
      let usinasSolplanet: Usina[] = [];
      if (respSolplanet.ok) {
        usinasSolplanet = await respSolplanet.json();
      }

      // Busca associações Solarman
      const respSolarman = await fetchWithAuth(
        `https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman/clientes/${cliente.id}`
      );
      
      let usinasSolarmanConvertidas: Usina[] = [];
      
      if (respSolarman.ok) {
        const assocSolarman = await respSolarman.json() as SolarmanAssociacao | SolarmanAssociacao[];
        
        // Converte para array se for objeto único
        const assocArray = Array.isArray(assocSolarman) ? assocSolarman : [assocSolarman];
        
        // Para cada associação, busca os detalhes da estação
        usinasSolarmanConvertidas = await Promise.all(
          assocArray.map(async (item: SolarmanAssociacao) => {
            try {
              // Busca detalhes da estação para pegar o nome
              const stationResp = await fetchWithAuth(
                `https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman/stations/${item.solarman_device_id}`
              );
              
              if (stationResp.ok) {
                const station = await stationResp.json() as SolarmanStationDetalhada;
                return {
                  id: `solarman-${item.solarman_device_id}`,
                  name: station.name || `Usina ${item.solarman_device_id}`,
                  locationAddress: station.locationAddress || "Não informado",
                  installedCapacity: station.installedCapacity,
                  generationPower: station.generationPower,
                  locationLat: station.locationLat,
                  locationLng: station.locationLng,
                  networkStatus: station.networkStatus === "NORMAL" ? "NORMAL" : 
                                station.networkStatus === "OFFLINE" ? "OFFLINE" : "ALERT",
                  devices: [],
                  fonte: "Solarman" as const
                };
              }
            } catch (error) {
              console.error("Erro ao buscar detalhes da estação:", error);
            }
            
            // Fallback se não conseguir buscar detalhes
            return {
              id: `solarman-${item.solarman_device_id}`,
              name: `Usina Solarman ${item.solarman_device_id}`,
              locationAddress: "Não informado",
              installedCapacity: undefined,
              generationPower: undefined,
              networkStatus: "NORMAL" as const,
              devices: [],
              fonte: "Solarman" as const
            };
          })
        );
      }

      // Garante que usinasSolplanet é um array
      const usinasSolplanetArray = Array.isArray(usinasSolplanet) ? usinasSolplanet : [];
      
      // Combina as listas
      const todasUsinas = [
        ...usinasSolplanetArray,
        ...usinasSolarmanConvertidas
      ];

      setUsinasAssociadas(todasUsinas);
    } catch (err) {
      console.error("Erro ao buscar usinas associadas:", err);
      setUsinasAssociadas([]);
    }
  };

  if (cliente.id) fetchUsinasAssociadas();
}, [cliente.id, fetchWithAuth]);


  // Funções auxiliares separadas para melhor organização
  const buscarSolplanet = async (termo: string): Promise<Usina[]> => {
    try {
      const response = await fetchWithAuth(
        "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solplanet/plants"
      );

      if (!response.ok) return [];

      const plants: SolplanetPlant[] = await response.json();

      return plants
        .filter(p =>
          p.name.toLowerCase().includes(termo) ||
          (p.position?.toLowerCase().includes(termo) ?? false)
        )
        .map(p => ({
          id: `solplanet-${p.apikey}`,
          name: p.name,
          locationAddress: p.position ?? "Não informado",
          installedCapacity: p.totalpower_kw,
          networkStatus: p.status === 1 ? "NORMAL" :
            p.status === 0 ? "OFFLINE" : "ALERT",
          devices: [],
          fonte: "Solplanet"
        }));
    } catch (error) {
      console.error("Erro na busca Solplanet:", error);
      return [];
    }
  };

  const buscarSolarman = async (termo: string): Promise<Usina[]> => {
    try {
      const response = await fetchWithAuth(
        "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman/stations"
      );

      if (!response.ok) return [];

      const stations: SolarmanStation[] = await response.json();

      // Função auxiliar para converter status
      const convertStatus = (status?: string): "NORMAL" | "OFFLINE" | "ALERT" => {
        if (!status) return "NORMAL";

        const statusLower = status.toLowerCase();
        if (statusLower.includes('normal') || statusLower.includes('online')) return "NORMAL";
        if (statusLower.includes('off') || statusLower.includes('inactive')) return "OFFLINE";
        return "ALERT";
      };

      return stations
        .filter(s =>
          s.name.toLowerCase().includes(termo) ||
          (s.locationAddress?.toLowerCase().includes(termo) ?? false)
        )
        .map(s => ({
          id: `solarman-${s.id}`,
          name: s.name,
          locationAddress: s.locationAddress ?? "Não informado",
          installedCapacity: s.installedCapacity,
          generationPower: s.generationPower,
          locationLat: s.locationLat,
          locationLng: s.locationLng,
          networkStatus: convertStatus(s.networkStatus),
          devices: [],
          fonte: "Solarman"
        }));
    } catch (error) {
      console.error("Erro na busca Solarman:", error);
      return [];
    }
  };

  // Função principal simplificada
  const handleBuscarUsinas = async (filtro: string): Promise<Usina[]> => {
    try {
      const termo = filtro.toLowerCase().trim();

      // Executa ambas as buscas em paralelo
      const [solplanet, solarman] = await Promise.allSettled([
        buscarSolplanet(termo),
        buscarSolarman(termo)
      ]);

      const resultados: Usina[] = [];

      if (solplanet.status === 'fulfilled') {
        resultados.push(...solplanet.value);
      }

      if (solarman.status === 'fulfilled') {
        resultados.push(...solarman.value);
      }

      console.log(`Encontradas ${resultados.length} usinas (Solplanet: ${solplanet.status === 'fulfilled' ? solplanet.value.length : 0}, Solarman: ${solarman.status === 'fulfilled' ? solarman.value.length : 0})`);

      return resultados;
    } catch (err) {
      console.error("Erro ao buscar usinas:", err);
      return [];
    }
  };

  // Interfaces para o erro da API
interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface ApiErrorResponse {
  detail?: ValidationError[];
}

const handleAssociarUsina = async (usina: Usina) => {
  try {
    console.log("Associando usina:", usina);
    
    if (usina.fonte === "Solarman") {
      const idReal = usina.id.replace('solarman-', '');
      
      const requestBody = {
        device_id: idReal,
        plant_id: idReal,
        email: "",
      };
      
      console.log("Enviando requisição para Solarman:", requestBody);
      
      const associarResponse = await fetchWithAuth(
        `https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman/clientes/${cliente.id}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      if (!associarResponse.ok) {
        const errorData: ApiErrorResponse = await associarResponse.json();
        console.error("Erro detalhado da API:", JSON.stringify(errorData, null, 2));
        
        if (errorData.detail && errorData.detail.length > 0) {
          // Mostra mensagens de erro mais específicas
          const mensagens = errorData.detail.map((err: ValidationError) => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join('\n');
          throw new Error(mensagens);
        }
        throw new Error(`Erro ${associarResponse.status}: ${associarResponse.statusText}`);
      }

      const resultado = await associarResponse.json();
      console.log("Associação realizada com sucesso:", resultado);
    } 
    else if (usina.fonte === "Solplanet") {
      const associarResponse = await fetchWithAuth(
        "https://backend.sansolenergiasolar.com.br/api/v1/usinas/associar",
        {
          method: "POST",
          body: JSON.stringify({
            usina_id: usina.id,
            cliente_id: cliente.id,
          }),
        }
      );

      if (!associarResponse.ok) {
        const errorData: ApiErrorResponse = await associarResponse.json();
        if (errorData.detail && errorData.detail.length > 0) {
          const mensagens = errorData.detail.map((err: ValidationError) => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join('\n');
          throw new Error(mensagens);
        }
        throw new Error(`Erro ${associarResponse.status}: ${associarResponse.statusText}`);
      }
    }
    else {
      throw new Error("Tipo de usina não suportado");
    }

    // Atualiza lista após associar
    const resp = await fetchWithAuth(
      `https://backend.sansolenergiasolar.com.br/api/v1/usinas/cliente/${cliente.id}`
    );

    const data = await resp.json();
    setUsinasAssociadas(Array.isArray(data) ? data : []);

    alert("Usina associada com sucesso!");
  } catch (err: unknown) {
    console.error("Erro ao associar usina:", err);
    if (err instanceof Error) alert(err.message);
    else alert("Erro ao associar usina");
  }
};

  const handleDesassociarUsina = async (usina: Usina) => { // 👈 Recebe a usina completa
  const confirmar = confirm(`Deseja remover a usina "${usina.name}" do cliente?`);
  if (!confirmar) return;

  try {
    if (usina.fonte === "Solarman") {
      // Para Solarman, usa o endpoint específico com DELETE
      const response = await fetchWithAuth(
        `https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman/clientes/${cliente.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        if (errorData.detail && errorData.detail.length > 0) {
          const mensagens = errorData.detail.map((err: ValidationError) => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join('\n');
          throw new Error(mensagens);
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Status 204 significa sucesso sem conteúdo
      if (response.status === 204) {
        console.log("Usina Solarman removida com sucesso");
      }
    } 
    else if (usina.fonte === "Solplanet") {
      // Para Solplanet, mantém o endpoint atual
      const response = await fetchWithAuth(
        "https://backend.sansolenergiasolar.com.br/api/v1/usinas/desassociar",
        {
          method: "DELETE",
          body: JSON.stringify({
            usina_id: usina.id,
            cliente_id: cliente.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        if (errorData.detail && errorData.detail.length > 0) {
          const mensagens = errorData.detail.map((err: ValidationError) => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join('\n');
          throw new Error(mensagens);
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    }
    else {
      throw new Error("Tipo de usina não suportado");
    }

    // Remove da lista local
    setUsinasAssociadas((prev) =>
      prev.filter((u) => u.id !== usina.id)
    );

    alert("Usina removida com sucesso!");
  } catch (err: unknown) {
    console.error("Erro ao remover usina:", err);
    if (err instanceof Error) alert(err.message);
    else alert("Erro ao remover usina");
  }
};

  const handleSelectContrato = (id: number) => {
    setSelectedContratoId(id);
    const contratoSelecionado = contratos.find((c: Contrato) => c.id === id);
    setContratoData(contratoSelecionado ? { ...contratoSelecionado } : {});
  };

  const openWhatsApp = () => {
    if (!cliente.telefone) return;
    const telefone = cliente.telefone.replace(/\D/g, "");
    window.open(`https://wa.me/${telefone}`, "_blank");
  };

  const handleContratoCriado = (contrato: Contrato) => {
    setContratos((prev) => [...prev, contrato]);
  };

  const handleContratoAtualizado = (contratoAtualizado: Contrato) => {
    setContratos((prev) =>
      prev.map((c) => c.id === contratoAtualizado.id ? contratoAtualizado : c)
    );
    setContratoData({ ...contratoAtualizado });
  };

  const handleContratoDeletado = (id: number) => {
    setContratos((prev) => prev.filter((c) => c.id !== id));
    setSelectedContratoId("");
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "0",
          width: "90%",
          maxWidth: "900px",
          zIndex: 1000,
          height: "95vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #f3f4f6" }}>
          <ModalHeader
            nome_completo={cliente.nome_completo}
            nivelGarantia={cliente.nivelGarantia}
            onClose={onClose}
          />
        </div>

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div style={{
          padding: "28px",
          minHeight: "calc(85vh - 160px)",
          display: "flex",
          flexDirection: "column"
        }}>
          {activeTab === "informacoes" && (
            <InformacoesTab
              cliente={cliente}
              tags={tags}
              clienteTags={clienteTags}
              loadingTags={loadingTags}
              onAnexarTag={anexarTagAoCliente}
              onRemoverTag={removerTagDoCliente}
              openWhatsApp={openWhatsApp}
            />
          )}

          {activeTab === "documentos" && (
            <DocumentosTab
              cliente={cliente}
              attachments={attachments}
              loadingAttachments={loadingAttachments}
              uploading={uploading}
              dragOver={dragOver}
              onUpload={handleUpload}
              onDownload={handleDownload}
              onDragOver={setDragOver}
            />
          )}

          {activeTab === "contratos" && (
            <ContratosTab
              cliente={cliente}
              contratos={contratos}
              loadingContratos={loadingContratos}
              errorContratos={errorContratos}
              selectedContratoId={selectedContratoId}
              contratoData={contratoData}
              criandoContrato={criandoContrato}
              onSelectContrato={handleSelectContrato}
              onContratoDataChange={setContratoData}
              onCriarContrato={setCriandoContrato}
              onContratoCriado={handleContratoCriado}
              onContratoAtualizado={handleContratoAtualizado}
              onContratoDeletado={handleContratoDeletado}
            />
          )}

          {activeTab === "usinas" && (
            <UsinasTab
              clienteId={cliente.id}
              usinasAssociadas={usinasAssociadas}
              onAssociarUsina={handleAssociarUsina}
              onDesassociarUsina={handleDesassociarUsina}
              onBuscarUsinas={handleBuscarUsinas}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default ModalCliente;
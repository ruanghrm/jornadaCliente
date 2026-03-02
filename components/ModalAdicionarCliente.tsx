import React, { useState, useEffect } from "react";

interface ModalProps {
  onClose: () => void;
}

const ModalAdicionarCliente: React.FC<ModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [expandEndereco, setExpandEndereco] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome_completo: "",
    email: "",
    cpf: "",
    telefone: "",
    senha: "",
    cep: "",
    logradouro: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero_casa: "",
    complemento: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  //--------------------------------------------------------------------
  // 🔥  Buscar endereço automaticamente ao digitar CEP
  //--------------------------------------------------------------------
  useEffect(() => {
    const cep = form.cep.replace(/\D/g, ""); // remove tudo que não é número

    if (cep.length !== 8) return; // só busca quando tiver 8 dígitos

    const fetchCEP = async () => {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          console.error("CEP não encontrado");
          return;
        }

        // Preenche automaticamente
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));

        // Expande o bloco de endereço automaticamente
        setExpandEndereco(true);

      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    };

    fetchCEP();
  }, [form.cep]);

  //--------------------------------------------------------------------

  const createCliente = async () => {
  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    const response = await fetch(
      "https://backend.sansolenergiasolar.com.br/api/v1/jclientes/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear();
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      const errorData = await response.json();
      throw new Error(errorData.detail || "Erro ao criar cliente no backend");
    }

    const data = await response.json();
    console.log("Cliente criado:", data);
    setStep(2);
  } catch (err: unknown) {
    if (err instanceof Error) {
      alert(err.message);
      console.error(err.message);
    } else {
      alert("Erro inesperado");
      console.error(err);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "30px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "15px",
            fontSize: "24px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#999",
          }}
        >
          &times;
        </button>

        <h2 style={{ textAlign: "center", color: "#ff7a2d", marginBottom: "20px" }}>
          {step === 1 ? "Adicionar Cliente" : "Cliente Criado!"}
        </h2>

        {/* Passo 1 */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Input label="Nome completo" name="nome_completo" value={form.nome_completo} onChange={handleChange} />
            <Input label="Email" name="email" value={form.email} onChange={handleChange} />
            <Input label="CPF" name="cpf" value={form.cpf} onChange={handleChange} />
            <Input label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
            <Input label="Senha" name="senha" value={form.senha} onChange={handleChange} type="password" />

            {/* Endereço */}
            <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "10px" }}>
              <button
                onClick={() => setExpandEndereco(!expandEndereco)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  width: "100%",
                  textAlign: "left",
                  padding: "5px 0",
                }}
              >
                Endereço (opcional) {expandEndereco ? "-" : "+"}
              </button>

              {expandEndereco && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  <Input label="CEP" name="cep" value={form.cep} onChange={handleChange} />

                  <Input label="Logradouro" name="logradouro" value={form.logradouro} onChange={handleChange} />
                  <Input label="Bairro" name="bairro" value={form.bairro} onChange={handleChange} />
                  <Input label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} />
                  <Input label="Estado" name="estado" value={form.estado} onChange={handleChange} />
                  <Input label="Número" name="numero_casa" value={form.numero_casa} onChange={handleChange} />
                  <Input label="Complemento" name="complemento" value={form.complemento} onChange={handleChange} />
                </div>
              )}
            </div>

            <button
              onClick={createCliente}
              disabled={loading}
              style={{
                marginTop: "20px",
                padding: "12px",
                backgroundColor: "#ff7a2d",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {loading ? "Enviando..." : "Cadastrar Cliente"}
            </button>
          </div>
        )}

        {/* Passo 2 */}
        {step === 2 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "18px", color: "#333" }}>
              Cliente <strong>{form.nome_completo}</strong> criado com sucesso!
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "#ff7a2d",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalAdicionarCliente;

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ marginBottom: "4px", fontSize: "14px", color: "#555" }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      style={{
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        outline: "none",
      }}
    />
  </div>
);

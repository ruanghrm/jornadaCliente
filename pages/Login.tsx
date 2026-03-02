import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

interface LoginResponse {
  token: string;
  nome: string;
  email: string;
  role: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedSenha, setIsFocusedSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://backend.sansolenergiasolar.com.br/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            senha,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("E-mail ou senha inválidos");
      }

      const data: LoginResponse = await response.json();

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          nome: data.nome,
          email: data.email,
          role: data.role,
        })
      );

      navigate("/home");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro inesperado ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FF7A2D 0%, #FF5E1F 100%)",
        padding: "20px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Elementos decorativos de fundo */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.15)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "rgba(255, 200, 150, 0.2)",
          filter: "blur(40px)",
        }}
      />

      {/* Card principal */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          borderRadius: "24px",
          padding: "48px 40px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: `
            0 20px 60px rgba(255, 90, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
          `,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Cabeçalho com logo e nome da empresa */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <img
              src="/background-logo-sansol-1080x720(2).png"
              alt="Logo Sansol"
              style={{
                width: "140px",
                height: "auto",
                objectFit: "contain",
              }}
              onError={() => {
                // Fallback caso a imagem não seja encontrada
                console.log("Imagem não encontrada, usando fallback");
              }}
            />
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "700",
                color: "#1F2937",
                letterSpacing: "-0.5px",
              }}
            >
              Sansol Energia Solar
            </h1>
          </div>
          <p
            style={{
              margin: "20px 0 0",
              fontSize: "15px",
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          {/* Mensagem de erro */}
          {error && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                color: "#DC2626",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "24px",
                fontSize: "14px",
                border: "1px solid #FECACA",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
                letterSpacing: "0.3px",
              }}
            >
              E-mail
            </label>
            <div
              style={{
                position: "relative",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocusedEmail(true)}
                onBlur={() => setIsFocusedEmail(false)}
                placeholder="seu@email.com"
                required
                style={{
                  width: "100%",
                  padding: "16px 20px 16px 48px",
                  borderRadius: "14px",
                  border: `2px solid ${isFocusedEmail ? "#FF7A2D" : "#E5E7EB"}`,
                  fontSize: "15px",
                  outline: "none",
                  background: "white",
                  transition: "all 0.3s ease",
                  boxShadow: isFocusedEmail 
                    ? "0 0 0 4px rgba(255, 122, 45, 0.1)" 
                    : "0 2px 4px rgba(0, 0, 0, 0.03)",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: isFocusedEmail ? "#FF7A2D" : "#9CA3AF",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
                letterSpacing: "0.3px",
              }}
            >
              Senha
            </label>
            <div
              style={{
                position: "relative",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onFocus={() => setIsFocusedSenha(true)}
                onBlur={() => setIsFocusedSenha(false)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "16px 20px 16px 48px",
                  borderRadius: "14px",
                  border: `2px solid ${isFocusedSenha ? "#FF7A2D" : "#E5E7EB"}`,
                  fontSize: "15px",
                  outline: "none",
                  background: "white",
                  transition: "all 0.3s ease",
                  boxShadow: isFocusedSenha 
                    ? "0 0 0 4px rgba(255, 122, 45, 0.1)" 
                    : "0 2px 4px rgba(0, 0, 0, 0.03)",
                  letterSpacing: "4px",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: isFocusedSenha ? "#FF7A2D" : "#9CA3AF",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "14px",
              background: loading
                ? "linear-gradient(135deg, #FFB08A 0%, #FF9A6C 100%)"
                : "linear-gradient(135deg, #FF7A2D 0%, #FF5E1F 100%)",
              border: "none",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 20px rgba(255, 122, 45, 0.3)",
              opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 25px rgba(255, 122, 45, 0.4)";
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(255, 122, 45, 0.3)";
              }
            }}
          >
            {loading ? (
              <>
                <span style={{ marginRight: "8px" }}>⏳</span>
                Entrando...
              </>
            ) : (
              "Entrar na conta"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
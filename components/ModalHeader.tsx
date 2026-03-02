import React from "react";
import type { Cliente } from "../src/types";

// Props do ModalHeader
interface ModalHeaderProps {
  nome_completo: string;
  nivelGarantia?: Cliente["nivelGarantia"];
  onClose: () => void;
}

// Cores para cada nível de garantia
const colorsGarantia: Record<NonNullable<Cliente["nivelGarantia"]>, string> = {
  Bronze: "#cd7f32",
  Prata: "#c0c0c0",
  Ouro: "#ffd700",
  Platinum: "#e5e4e2",
};

// Componente ModalHeader
export const ModalHeader: React.FC<ModalHeaderProps> = ({ nome_completo, nivelGarantia, onClose }) => {
  const garantiaColor = nivelGarantia ? colorsGarantia[nivelGarantia] : "#ccc";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #eee",
        paddingBottom: "12px",
        position: "relative",
      }}
    >
      <h2 style={{ color: "#ff7a2d", margin: 0, fontSize: "1.8rem" }}>{nome_completo}</h2>
      <span
        style={{
          backgroundColor: garantiaColor,
          color: "#fff",
          padding: "6px 14px",
          borderRadius: "14px",
          fontWeight: 600,
          fontSize: "0.9rem",
        }}
      >
        {nivelGarantia || "-"}
      </span>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          fontSize: "2rem",
          cursor: "pointer",
          color: "#888",
          background: "none",
          border: "none",
        }}
      >
        &times;
      </button>
    </div>
  );
};

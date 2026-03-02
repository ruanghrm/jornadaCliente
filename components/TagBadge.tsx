import React from "react";

interface TagBadgeProps {
  label: string;
  color?: string | null;
  size?: "sm" | "md";
}

const darkenColor = (hex: string, amount = 0.35) => {
  const c = hex.replace("#", "");

  const r = Math.max(
    0,
    Math.floor(parseInt(c.substring(0, 2), 16) * (1 - amount))
  );
  const g = Math.max(
    0,
    Math.floor(parseInt(c.substring(2, 4), 16) * (1 - amount))
  );
  const b = Math.max(
    0,
    Math.floor(parseInt(c.substring(4, 6), 16) * (1 - amount))
  );

  return `rgb(${r}, ${g}, ${b})`;
};

const TagBadge: React.FC<TagBadgeProps> = ({
  label,
  color,
  size = "md",
}) => {
  const safeColor = color ?? "#9CA3AF";
  const textColor = darkenColor(safeColor, 0.4);

  const sizes = {
    sm: {
      dot: 8,
      fontSize: "12px",
      padding: "4px 10px",
    },
    md: {
      dot: 10,
      fontSize: "13px",
      padding: "6px 14px",
    },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: sizes[size].padding,
        borderRadius: "999px",

        // 🔹 fundo bem suave
        backgroundColor: `${safeColor}1F`,

        // 🔹 texto sempre mais escuro que a tag
        color: textColor,

        fontSize: sizes[size].fontSize,
        fontWeight: 600,

        border: `1px solid ${safeColor}40`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: sizes[size].dot,
          height: sizes[size].dot,
          borderRadius: "50%",
          backgroundColor: safeColor,
        }}
      />
      {label}
    </span>
  );
};

export default TagBadge;

// C:\Users\ruang\Desktop\jornada\components\ui\ModalLayout.tsx
import React, { useEffect } from "react";

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;

  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;

  width?: string;
}


export default function ModalLayout({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "600px"
}: ModalLayoutProps) {

  // 🔒 Lock scroll + ESC close
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-container"
          style={{ width }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* HEADER */}
          {title && (
            <div className="modal-header">
              {title && <h2>{title}</h2>}

              <button className="modal-close" onClick={onClose}>
                ✕
              </button>
            </div>
          )}

          {/* BODY */}
          <div className="modal-body">{children}</div>

          {/* FOOTER */}
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>

      {/* ===== Styles inline ===== */}
      <style>{`

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;

          animation: fadeIn 0.2s ease;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;

          animation: scaleIn 0.2s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .modal-close {
          border: none;
          background: transparent;
          font-size: 18px;
          cursor: pointer;
        }

        .modal-body {
          padding: 20px;
          overflow-y: auto;
        }

        .modal-footer {
          padding: 16px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

      `}</style>
    </>
  );
}

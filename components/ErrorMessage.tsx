// ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => (
  <div className="error-message">
    <span>{message}</span>
    <button onClick={onClose} className="close-btn">×</button>
  </div>
);

export default ErrorMessage;
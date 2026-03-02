// components/Relatorios/SolarmanRelatorios.tsx

import React from 'react';
import RelatoriosList from './RelatoriosList';

interface SolarmanRelatoriosProps {
  onError?: (error: string) => void;
}

const SolarmanRelatorios: React.FC<SolarmanRelatoriosProps> = ({ onError }) => {
  return <RelatoriosList onError={onError} />;
};

export default SolarmanRelatorios;
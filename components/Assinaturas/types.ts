// components/Assinaturas/types.ts
export interface Plano {
  plano_id: string;
  nome: string;
  valor: number;
  ativo: boolean;
  // Campos adicionais que podem ser opcionais
  duracao_dias?: number;
  descricao?: string;
  beneficios?: string[];
  created_at?: string;
}
export interface Assinatura {
  assinatura_id: string;
  cliente_id: string;
  plano_id: string;
  status: 'ativa' | 'cancelada' | 'expirada';
  inicio: string;
  fim: string;
  plano_nome: string;
  valor: number;
  duracao_dias: number;
  aviso: string | null;
}

export interface Garantia {
  id: number;
  nome: string;
  descricao: string;
  tempo_duracao: number;
  valor: number;
  condicoes: string;
  status: boolean;
}

export interface NovaAssinaturaRequest {
  cliente_id: string;
  plano_id: string;
  usina_id: string;
  integradora: string;
}

export interface RenovarAssinaturaRequest {
  plano_id: string;
}

// components/Assinaturas/types.ts

export interface Assinatura {
  assinatura_id: string;
  cliente_id: string;
  plano_id: string;
  status: 'ativa' | 'cancelada' | 'expirada';
  inicio: string;
  fim: string;
  plano_nome: string;
  valor: number;
  duracao_dias: number;
  aviso: string | null;
}

export interface VinculoSolarman {
  id: string;
  cliente_id: number;
  solarman_device_id: string;
  solarman_plant_id: string;
  solarman_email: string;
  created_at: string;
}

export interface ClienteBasico {
  id: number;
  nome_completo: string;
  email: string;
  telefone: string;
  cpf: string;
}

export interface DeviceRealtime {
  deviceId: number;
  deviceSn: string;
  measured_at: string;
  system_time_str: string;
  metrics: {
    power_W: number;
    daily_energy_kWh: number;
    total_energy_kWh: number;
    dc_voltage_pv1_V: number;
    dc_current_pv1_A: number;
    ac_voltage_V: number;
    ac_current_A: number;
  };
}

export interface VinculoCompleto {
  vinculo: VinculoSolarman;
  cliente?: ClienteBasico;
  dispositivo?: DeviceRealtime;
  assinatura?: Assinatura; // 👈 Novo campo
}

export type ServiceType = 'Tráfego' | 'Google' | 'Vídeo' | 'Postagens';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  contractFile?: string;
  services: ServiceType[];
  status: 'Active' | 'Inactive';
  startDate: string;
}

export type RecurrenceType = 'One-time' | 'Fixed' | 'Installments';

export interface Transaction {
  id: string;
  clientId?: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending';
  type: 'Receivable' | 'Payable';
  recurrence: RecurrenceType;
  installmentsTotal?: number;
}

export interface Demand {
  id: string;
  clientId: string;
  title: string;
  service: ServiceType;
  dueDate: string;
  status: 'Pending' | 'Done';
}

export type EventType = 'Reunião' | 'Visita' | 'Follow-up' | 'Outro';

export interface AgendaEvent {
  id: string;
  clientId?: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  description: string;
  status: 'Pending' | 'Done';
  modality: 'Online' | 'Presencial';
}

export type ProspectionStage = 'Prospectado' | 'Marcou Reunião' | 'Sem Interesse' | 'Congelado' | 'Fechado';

export interface TimelineActivity {
  date: string;
  note: string;
  type?: string;
}

export interface ProspectionLead {
  id: string;
  company: string;
  phone: string;
  email?: string;
  stage: ProspectionStage;
  createdAt: string;
  
  // Enhanced Fields
  decisionMaker?: string;
  source?: string;
  instagramLink?: string;
  googleLink?: string;
  proposalValue?: number;
  
  // History
  timeline: TimelineActivity[];
}


import { Client, Transaction, Demand, AgendaEvent, ProspectionLead } from './types';

// --- Helper Date Function ---
// Garante que a data padrão seja a do fuso horário do usuário, não UTC.
export const getTodayLocal = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(now.getTime() - offsetMs);
  return localDate.toISOString().split('T')[0];
};

// --- Mappers (Snake Case DB -> Camel Case App) ---

export const mapClient = (data: any): Client => ({
  id: data.id,
  name: data.name,
  company: data.company,
  email: data.email,
  phone: data.phone,
  contractFile: data.contract_file,
  services: data.services || [],
  status: data.status,
  startDate: data.start_date
});

export const mapTransaction = (data: any): Transaction => ({
  id: data.id,
  clientId: data.client_id,
  description: data.description || 'Sem descrição',
  amount: parseFloat(data.amount) || 0,
  dueDate: data.due_date || new Date().toISOString().split('T')[0],
  status: data.status || 'Pending',
  type: data.type || 'Payable',
  recurrence: data.recurrence || 'One-time',
  installmentsTotal: data.installments_total || undefined
});

export const mapDemand = (data: any): Demand => ({
  id: data.id,
  clientId: data.client_id,
  title: data.title,
  service: data.service,
  dueDate: data.due_date,
  status: data.status
});

export const mapEvent = (data: any): AgendaEvent => ({
  id: data.id,
  clientId: data.client_id,
  title: data.title,
  type: data.type,
  date: data.date,
  time: data.time ? data.time.substring(0, 5) : '', 
  description: data.description,
  status: data.status,
  modality: data.modality || 'Online'
});

export const mapLead = (data: any): ProspectionLead => {
  return {
    id: data.id,
    company: data.company,
    phone: data.phone,
    email: data.email,
    stage: data.stage,
    createdAt: data.created_at,
    decisionMaker: data.decision_maker,
    source: data.source,
    instagramLink: data.instagram_link,
    googleLink: data.google_link,
    proposalValue: parseFloat(data.proposal_value) || 0,
    timeline: Array.isArray(data.timeline) ? data.timeline : []
  };
};

// --- Utilities ---

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '--/--/----';
  try {
    const [year, month, day] = dateString.split('-');
    if (!day || !month || !year) return dateString;
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

export const getDaysOverdue = (dueDate: string) => {
  if (!dueDate) return 0;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = dueDate.split('-').map(Number);
    if (!y || !m || !d) return 0;
    const due = new Date(y, m - 1, d);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 0 ? diffDays : 0;
  } catch (e) {
    return 0;
  }
};

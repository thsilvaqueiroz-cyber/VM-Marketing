import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Search, 
  MoreVertical,
  DollarSign,
  X,
  Clock,
  CheckSquare,
  Square,
  ChevronRight,
  Briefcase,
  Save,
  CalendarDays,
  MapPin,
  Phone,
  Trash2,
  Target,
  ArrowRight,
  BarChart3,
  IceCream,
  CircleSlash,
  Handshake,
  TrendingDown,
  GripVertical,
  UserCheck,
  User,
  Megaphone,
  StickyNote,
  Loader2,
  Settings,
  Menu,
  Pencil
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE ---
// 1. COLOQUE SUAS CHAVES AQUI SE DESEJAR HARDCODED
// 2. OU DEIXE VAZIO E USE A TELA DE CONFIGURAÇÃO DO APP
const SUPABASE_URL = process.env.SUPABASE_URL || "https://kdohrbadfrfgnrzuxtxw.supabase.co"; 
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkb2hyYmFkZnJmZ25yenV4dHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDI0MTQsImV4cCI6MjA4NTE3ODQxNH0.7PSXcFkM-FvFKEeN8XHmEnmu3VzIl1YuQR5xqzaNiJM";

// --- Inicialização Segura do Cliente ---
let supabase: any = null;

const getStoredCreds = () => {
  const localUrl = localStorage.getItem('vm_crm_sb_url');
  const localKey = localStorage.getItem('vm_crm_sb_key');
  return { url: localUrl || SUPABASE_URL, key: localKey || SUPABASE_KEY };
};

const creds = getStoredCreds();

if (creds.url && creds.key) {
  try {
    supabase = createClient(creds.url, creds.key);
  } catch (e) {
    console.error("Erro ao inicializar Supabase:", e);
  }
}

// --- Types ---

type ServiceType = 'Tráfego' | 'Google' | 'Vídeo' | 'Postagens';

interface Client {
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

type RecurrenceType = 'One-time' | 'Fixed' | 'Installments';

interface Transaction {
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

interface Demand {
  id: string;
  clientId: string;
  title: string;
  service: ServiceType;
  dueDate: string;
  status: 'Pending' | 'Done';
}

type EventType = 'Reunião' | 'Visita' | 'Follow-up' | 'Outro';

interface AgendaEvent {
  id: string;
  clientId?: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  description: string;
  status: 'Pending' | 'Done';
}

type ProspectionStage = 'Prospectado' | 'Marcou Reunião' | 'Sem Interesse' | 'Congelado' | 'Fechamento';

interface ProspectionLead {
  id: string;
  company: string;
  phone: string;
  stage: ProspectionStage;
  createdAt: string;
  
  // New Fields
  decisionMaker?: string;
  bridge?: string;
  source?: string;
  notes?: string;
  proposalValue?: string;
  proposalDetails?: string;
  nextActionDate?: string;
  nextActionType?: string;
}

// --- Mappers (Snake Case DB -> Camel Case App) ---

const mapClient = (data: any): Client => ({
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

const mapTransaction = (data: any): Transaction => ({
  id: data.id,
  clientId: data.client_id,
  description: data.description || 'Sem descrição',
  amount: parseFloat(data.amount) || 0,
  dueDate: data.due_date || new Date().toISOString().split('T')[0], // Fallback para hoje se nulo
  status: data.status || 'Pending',
  type: data.type || 'Payable',
  recurrence: data.recurrence || 'One-time',
  installmentsTotal: data.installments_total || undefined
});

const mapDemand = (data: any): Demand => ({
  id: data.id,
  clientId: data.client_id,
  title: data.title,
  service: data.service,
  dueDate: data.due_date,
  status: data.status
});

const mapEvent = (data: any): AgendaEvent => ({
  id: data.id,
  clientId: data.client_id,
  title: data.title,
  type: data.type,
  date: data.date,
  time: data.time ? data.time.substring(0, 5) : '', 
  description: data.description,
  status: data.status
});

const mapLead = (data: any): ProspectionLead => ({
  id: data.id,
  company: data.company,
  phone: data.phone,
  stage: data.stage,
  createdAt: data.created_at,
  decisionMaker: data.decision_maker,
  bridge: data.bridge,
  source: data.source,
  notes: data.notes,
  proposalValue: data.proposal_value,
  proposalDetails: data.proposal_details,
  nextActionDate: data.next_action_date,
  nextActionType: data.next_action_type
});

// --- Utilities ---

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '--/--/----';
  try {
    const [year, month, day] = dateString.split('-');
    if (!day || !month || !year) return dateString;
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

const getDaysOverdue = (dueDate: string) => {
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

// --- Components ---

const Badge: React.FC<{ children?: React.ReactNode; color: string }> = ({ children, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-emerald-100 text-emerald-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    indigo: 'bg-indigo-100 text-indigo-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

const SaoPauloClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(time);

  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(time);

  return (
    <div className="mx-4 mt-2 mb-4 p-4 bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl text-white shadow-lg border border-indigo-700/50">
      <div className="flex items-center gap-2 mb-2 text-indigo-200 text-xs font-medium uppercase tracking-wider">
        <Clock size={12} /> Horário de Brasília
      </div>
      <p className="text-3xl font-bold tabular-nums tracking-tight leading-none mb-1">
        {formattedTime}
      </p>
      <p className="text-xs text-indigo-100 capitalize font-medium opacity-90">
        {formattedDate}
      </p>
    </div>
  );
};

const SetupScreen = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const handleSave = () => {
    if(!url || !key) return alert('Preencha ambos os campos');
    localStorage.setItem('vm_crm_sb_url', url);
    localStorage.setItem('vm_crm_sb_key', key);
    window.location.reload();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm">
            <TrendingUp size={40} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">Configuração CRM</h1>
        <p className="text-slate-500 text-center mb-8 text-sm px-4">
          Conecte-se ao seu projeto Supabase para iniciar o sistema VM Marketing.
        </p>
        
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Supabase URL</label>
            <input 
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
              placeholder="https://seu-projeto.supabase.co"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Supabase Anon Key</label>
            <input 
              value={key}
              onChange={e => setKey(e.target.value)}
              type="password"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
              placeholder="Sua chave pública (anon)..."
            />
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
          >
            <CheckCircle2 size={20} /> Conectar Sistema
          </button>
        </div>
        
        <p className="text-xs text-slate-400 text-center mt-8">
          Você pode obter essas chaves no painel do Supabase.
        </p>
      </div>
    </div>
  );
};

// --- Modals ---

const NewClientModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (client: Client) => void;
}) => {
  const [formData, setFormData] = useState<{
    company: string;
    name: string;
    email: string;
    phone: string;
    services: ServiceType[];
  }>({
    company: '',
    name: '',
    email: '',
    phone: '',
    services: []
  });

  if (!isOpen) return null;

  const toggleService = (service: ServiceType) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service) 
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSave = async () => {
    if(!formData.company || !formData.name) return;

    // Save to DB
    const { data, error } = await supabase.from('clients').insert([{
      company: formData.company,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      services: formData.services,
      status: 'Active',
      start_date: new Date().toISOString()
    }]).select();

    if (error) {
      console.error('Error saving client:', error);
      alert('Erro ao salvar cliente');
      return;
    }

    if (data) {
      onSave(mapClient(data[0]));
      setFormData({ company: '', name: '', email: '', phone: '', services: [] });
    }
  };

  const availableServices: ServiceType[] = ['Tráfego', 'Google', 'Vídeo', 'Postagens'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Cadastrar Novo Cliente</h2>
          <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Ex: Marketing Ltda"
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Contato</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Ex: João da Silva"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="contato@empresa.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Serviços Contratados</label>
            <div className="grid grid-cols-2 gap-2">
              {availableServices.map(service => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                    formData.services.includes(service)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {formData.services.includes(service) ? <CheckSquare size={16} /> : <Square size={16} />}
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={!formData.company || !formData.name}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={16} /> Salvar Cliente
          </button>
        </div>
      </div>
    </div>
  );
};

const NewEventModal = ({
  isOpen,
  onClose,
  onSave,
  clients
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  clients: Client[];
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    type: EventType;
    clientId: string;
    date: string;
    time: string;
    description: string;
  }>({
    title: '',
    type: 'Reunião',
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    description: ''
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.time) return;

    const { data, error } = await supabase.from('agenda_events').insert([{
      title: formData.title,
      type: formData.type,
      client_id: formData.clientId || null,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      status: 'Pending'
    }]).select();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      onSave(mapEvent(data[0]));
      setFormData({ ...formData, title: '', description: '', clientId: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Novo Agendamento</h2>
          <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Ex: Reunião de Pauta"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as EventType})}
              >
                <option value="Reunião">Reunião</option>
                <option value="Visita">Visita</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
              >
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
              <input 
                type="time" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição / Notas</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24"
              placeholder="Detalhes adicionais..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={!formData.title}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CalendarDays size={16} /> Agendar
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientDetailModal = ({ 
  client, 
  isOpen, 
  onClose, 
  demands, 
  onAddDemand, 
  onToggleDemandStatus 
}: { 
  client: Client | null; 
  isOpen: boolean; 
  onClose: () => void;
  demands: Demand[];
  onAddDemand: (demand: Demand) => void;
  onToggleDemandStatus: (id: string) => void;
}) => {
  const [newDemand, setNewDemand] = useState<{ title: string; service: string; dueDate: string }>({
    title: '',
    service: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  if (!isOpen || !client) return null;

  const clientDemands = demands.filter(d => d.clientId === client.id).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  const handleAdd = async () => {
    if (!newDemand.title || !newDemand.service || !newDemand.dueDate) return;
    
    const { data, error } = await supabase.from('demands').insert([{
      client_id: client.id,
      title: newDemand.title,
      service: newDemand.service,
      due_date: newDemand.dueDate,
      status: 'Pending'
    }]).select();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      onAddDemand(mapDemand(data[0]));
      setNewDemand({ title: '', service: '', dueDate: new Date().toISOString().split('T')[0] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar: Client Info */}
        <div className="bg-slate-50 w-full md:w-1/3 p-6 border-r border-slate-200 overflow-y-auto">
          <div className="flex justify-between items-start mb-6 md:hidden">
            <h2 className="text-lg font-bold text-slate-800">Detalhes</h2>
            <button onClick={onClose}><X size={24} className="text-slate-400" /></button>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl mb-3 shadow-inner">
              {client.company.substring(0, 2).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{client.company}</h2>
            <p className="text-sm text-slate-500">{client.name}</p>
            <span className="mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
              Contrato Ativo
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Informações de Contato</p>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><span className="w-4 h-4 text-slate-400">@</span> {client.email}</p>
                <p className="flex items-center gap-2"><span className="w-4 h-4 text-slate-400">#</span> {client.phone}</p>
                <p className="flex items-center gap-2"><span className="w-4 h-4 text-slate-400">📅</span> Cliente desde {formatDate(client.startDate)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Serviços Contratados</p>
              <div className="flex flex-wrap gap-2">
                {client.services.map(s => (
                  <Badge key={s} color={s === 'Tráfego' ? 'blue' : s === 'Google' ? 'orange' : s === 'Vídeo' ? 'red' : 'purple'}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button className="w-full py-2 flex items-center justify-center gap-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium">
                <FileText size={16} /> Ver Contrato PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right Content: Demands */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
             <div>
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <Briefcase size={20} className="text-indigo-600"/> Gestão de Demandas
               </h3>
               <p className="text-sm text-slate-500">Histórico de entregas e tarefas futuras</p>
             </div>
             <button onClick={onClose} className="hidden md:block p-2 hover:bg-slate-100 rounded-full transition-colors">
               <X size={24} className="text-slate-400" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {/* Add Demand Form */}
            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm mb-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Plus size={16} className="text-indigo-600"/> Cadastrar Nova Demanda
              </h4>
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Título da tarefa (ex: Criar Criativos)" 
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newDemand.title}
                  onChange={e => setNewDemand({...newDemand, title: e.target.value})}
                />
                <select 
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newDemand.service}
                  onChange={e => setNewDemand({...newDemand, service: e.target.value})}
                >
                  <option value="">Serviço</option>
                  {client.services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input 
                  type="date" 
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newDemand.dueDate}
                  onChange={e => setNewDemand({...newDemand, dueDate: e.target.value})}
                />
                <button 
                  onClick={handleAdd}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Demands List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Próximas & Histórico</h4>
              {clientDemands.length > 0 ? clientDemands.map(demand => {
                 const isOverdue = demand.status === 'Pending' && getDaysOverdue(demand.dueDate) > 0;
                 return (
                  <div key={demand.id} className={`group flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${demand.status === 'Done' ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => onToggleDemandStatus(demand.id)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      {demand.status === 'Done' ? <CheckSquare size={22} className="text-emerald-500" /> : <Square size={22} />}
                    </button>
                    
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${demand.status === 'Done' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {demand.title}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded">{demand.service}</span>
                      </div>
                    </div>

                    <div className="text-right">
                       <p className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                         {formatDate(demand.dueDate)}
                       </p>
                       {isOverdue && <p className="text-[10px] text-red-500 font-medium">Atrasado</p>}
                    </div>
                  </div>
                 )
              }) : (
                <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  <p>Nenhuma demanda registrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ 
  clients, 
  transactions, 
  demands, 
  events, 
  leads,
  onToggleDemand
}: { 
  clients: Client[], 
  transactions: Transaction[], 
  demands: Demand[], 
  events: AgendaEvent[], 
  leads: ProspectionLead[],
  onToggleDemand: (id: string) => void
}) => {
  const activeClients = clients.filter(c => c.status === 'Active').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyRevenue = transactions
    .filter(t => t.type === 'Receivable' && t.status === 'Paid')
    .filter(t => {
       const d = new Date(t.dueDate);
       return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingDemands = demands.filter(d => d.status === 'Pending');
  const todayEvents = events.filter(e => {
    const today = new Date().toISOString().split('T')[0];
    return e.date === today;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Visão Geral</h1>
        <p className="text-slate-500">Resumo de desempenho e atividades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Users size={24}/></div>
             <span className="text-xs font-bold text-slate-400 uppercase">Clientes Ativos</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{activeClients}</h3>
          <p className="text-sm text-slate-500 mt-1">Total na base: {clients.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><DollarSign size={24}/></div>
             <span className="text-xs font-bold text-slate-400 uppercase">Receita (Mês)</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(monthlyRevenue)}</h3>
          <p className="text-sm text-slate-500 mt-1">Faturamento confirmado</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><CheckCircle2 size={24}/></div>
             <span className="text-xs font-bold text-slate-400 uppercase">Tarefas Pendentes</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{pendingDemands.length}</h3>
          <p className="text-sm text-slate-500 mt-1">Demandas em aberto</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><Target size={24}/></div>
             <span className="text-xs font-bold text-slate-400 uppercase">Leads em Negociação</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">
            {leads.filter(l => ['Marcou Reunião', 'Fechamento'].includes(l.stage)).length}
          </h3>
          <p className="text-sm text-slate-500 mt-1">Potenciais fechamentos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Demands */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Demandas Prioritárias</h3>
             <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{pendingDemands.length} pendentes</span>
           </div>
           <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
             {pendingDemands.length > 0 ? pendingDemands.slice(0, 10).map(demand => (
               <div key={demand.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <button onClick={() => onToggleDemand(demand.id)} className="text-slate-400 hover:text-indigo-600">
                    <Square size={20} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{demand.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500">{demand.service}</span>
                      {getDaysOverdue(demand.dueDate) > 0 && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 rounded font-medium">Atrasado</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">{formatDate(demand.dueDate)}</span>
                  </div>
               </div>
             )) : (
               <div className="p-8 text-center text-slate-400">Nenhuma demanda pendente.</div>
             )}
           </div>
        </div>

        {/* Agenda Today */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Calendar size={18} className="text-indigo-600"/> Agenda Hoje
           </h3>
           <div className="space-y-3">
             {todayEvents.length > 0 ? todayEvents.map(event => (
               <div key={event.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3">
                 <div className="flex flex-col items-center justify-center bg-indigo-50 px-3 rounded-lg min-w-[60px]">
                    <span className="text-xs font-bold text-indigo-700">{event.time}</span>
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-800 line-clamp-1">{event.title}</p>
                   <span className="text-xs text-slate-500 block">{event.type}</span>
                 </div>
               </div>
             )) : (
               <p className="text-sm text-slate-400 text-center py-4">Sem eventos para hoje.</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

const ProspectionView = ({
  leads,
  setLeads
}: {
  leads: ProspectionLead[];
  setLeads: React.Dispatch<React.SetStateAction<ProspectionLead[]>>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState<{
    company: string;
    phone: string;
    decisionMaker: string;
    source: string;
  }>({
    company: '',
    phone: '',
    decisionMaker: '',
    source: ''
  });

  const stages: ProspectionStage[] = ['Prospectado', 'Marcou Reunião', 'Fechamento', 'Congelado', 'Sem Interesse'];

  const handleSave = async () => {
    if(!newLead.company) return;
    
    const { data, error } = await supabase.from('prospection_leads').insert([{
      company: newLead.company,
      phone: newLead.phone,
      decision_maker: newLead.decisionMaker,
      source: newLead.source,
      stage: 'Prospectado',
    }]).select();

    if(error) {
      console.error(error);
      return;
    }

    if(data) {
      setLeads([...leads, mapLead(data[0])]);
      setIsModalOpen(false);
      setNewLead({ company: '', phone: '', decisionMaker: '', source: '' });
    }
  };

  const updateStage = async (id: string, newStage: ProspectionStage) => {
    // Optimistic
    setLeads(leads.map(l => l.id === id ? { ...l, stage: newStage } : l));
    // DB
    await supabase.from('prospection_leads').update({ stage: newStage }).eq('id', id);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Prospecção</h1>
           <p className="text-slate-500">Pipeline de Vendas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Novo Lead
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map(stage => (
            <div key={stage} className="w-80 flex flex-col bg-slate-100 rounded-xl p-3 h-full border border-slate-200">
               <div className="flex items-center justify-between mb-3 px-2">
                 <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{stage}</h3>
                 <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                   {leads.filter(l => l.stage === stage).length}
                 </span>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-3 px-1 custom-scrollbar">
                 {leads.filter(l => l.stage === stage).map(lead => (
                   <div key={lead.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-slate-800">{lead.company}</h4>
                       <div className="relative">
                         {/* Simple dropdown for stage change could go here, for now just buttons on hover or similar */}
                       </div>
                     </div>
                     {lead.decisionMaker && <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><User size={12}/> {lead.decisionMaker}</p>}
                     {lead.phone && <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={12}/> {lead.phone}</p>}
                     
                     <div className="mt-3 pt-3 border-t border-slate-100 flex gap-1 flex-wrap">
                        {/* Quick Actions / Stage Move */}
                        {stage !== 'Fechamento' && (
                          <button onClick={() => updateStage(lead.id, 'Fechamento')} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100">
                            → Fechamento
                          </button>
                        )}
                        {stage !== 'Marcou Reunião' && (
                           <button onClick={() => updateStage(lead.id, 'Marcou Reunião')} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100">
                             → Reunião
                           </button>
                        )}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Novo Lead</h2>
            <div className="space-y-4">
               <input 
                 placeholder="Empresa" 
                 className="w-full px-3 py-2 border rounded-lg"
                 value={newLead.company}
                 onChange={e => setNewLead({...newLead, company: e.target.value})}
               />
               <input 
                 placeholder="Decisor (Nome)" 
                 className="w-full px-3 py-2 border rounded-lg"
                 value={newLead.decisionMaker}
                 onChange={e => setNewLead({...newLead, decisionMaker: e.target.value})}
               />
               <input 
                 placeholder="Telefone / WhatsApp" 
                 className="w-full px-3 py-2 border rounded-lg"
                 value={newLead.phone}
                 onChange={e => setNewLead({...newLead, phone: e.target.value})}
               />
               <input 
                 placeholder="Origem (Indicação, Ads, etc)" 
                 className="w-full px-3 py-2 border rounded-lg"
                 value={newLead.source}
                 onChange={e => setNewLead({...newLead, source: e.target.value})}
               />
               <div className="flex justify-end gap-2 pt-2">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                 <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ClientsView = ({
  clients,
  setClients,
  demands,
  setDemands
}: {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  demands: Demand[];
  setDemands: React.Dispatch<React.SetStateAction<Demand[]>>;
}) => {
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
           <p className="text-slate-500">Gestão de carteira ativa</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsNewClientOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={18} /> Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div 
            key={client.id} 
            onClick={() => setDetailClient(client)}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
             <div className="flex justify-between items-start mb-4">
               <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                 {client.company.substring(0,2).toUpperCase()}
               </div>
               <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                 {client.status === 'Active' ? 'Ativo' : 'Inativo'}
               </span>
             </div>
             
             <h3 className="font-bold text-slate-800 text-lg mb-1">{client.company}</h3>
             <p className="text-sm text-slate-500 mb-4">{client.name}</p>

             <div className="flex flex-wrap gap-2 mb-4">
               {client.services.slice(0,3).map(s => (
                 <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{s}</span>
               ))}
               {client.services.length > 3 && <span className="text-[10px] text-slate-400">+{client.services.length - 3}</span>}
             </div>

             <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                <span className="flex items-center gap-1"><Briefcase size={14}/> {demands.filter(d => d.clientId === client.id && d.status === 'Pending').length} Pendentes</span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors"/>
             </div>
          </div>
        ))}
      </div>

      <NewClientModal 
        isOpen={isNewClientOpen} 
        onClose={() => setIsNewClientOpen(false)} 
        onSave={(newClient) => {
          setClients([...clients, newClient]);
          setIsNewClientOpen(false);
        }}
      />

      <ClientDetailModal 
        client={detailClient}
        isOpen={!!detailClient}
        onClose={() => setDetailClient(null)}
        demands={demands}
        onAddDemand={(newDemand) => setDemands([...demands, newDemand])}
        onToggleDemandStatus={async (id) => {
           // This logic is duplicated from App, ideally pass handler from parent, but simplified here for prop drilling fix
           const current = demands.find(d => d.id === id);
           if(!current) return;
           const newStatus = current.status === 'Pending' ? 'Done' : 'Pending';
           setDemands(demands.map(d => d.id === id ? {...d, status: newStatus} : d));
           await supabase.from('demands').update({ status: newStatus }).eq('id', id);
        }}
      />
    </div>
  );
};

const AgendaView = ({
  events,
  setEvents,
  clients
}: {
  events: AgendaEvent[];
  setEvents: React.Dispatch<React.SetStateAction<AgendaEvent[]>>;
  clients: Client[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime();
  });

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  };

  const groupedEvents: Record<string, AgendaEvent[]> = {};
  sortedEvents.forEach(e => {
    if (!groupedEvents[e.date]) groupedEvents[e.date] = [];
    groupedEvents[e.date].push(e);
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
           <p className="text-slate-500">Compromissos e Reuniões</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Novo Evento
        </button>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedEvents).sort().map(date => (
          <div key={date}>
            <div className="flex items-center gap-4 mb-4">
               <h3 className={`text-lg font-bold capitalize ${date === today ? 'text-indigo-600' : 'text-slate-700'}`}>
                 {date === today ? 'Hoje, ' : ''}{getDayName(date)}
               </h3>
               <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            
            <div className="space-y-3">
              {groupedEvents[date].map(event => (
                <div key={event.id} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex flex-col items-center justify-center min-w-[80px] px-4 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-lg font-bold text-slate-800">{event.time}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <h4 className="font-bold text-slate-800">{event.title}</h4>
                       <Badge color={event.type === 'Reunião' ? 'blue' : event.type === 'Visita' ? 'green' : 'gray'}>
                         {event.type}
                       </Badge>
                    </div>
                    {event.clientId && (
                      <p className="text-sm text-indigo-600 font-medium mt-1">
                        {clients.find(c => c.id === event.clientId)?.company || 'Cliente não encontrado'}
                      </p>
                    )}
                    {event.description && <p className="text-sm text-slate-500 mt-2">{event.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum evento agendado.</p>
          </div>
        )}
      </div>

      <NewEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={(evt) => {
          setEvents([...events, evt]);
          setIsModalOpen(false);
        }}
        clients={clients}
      />
    </div>
  );
};

const FinanceView = ({ 
  clients, 
  transactions, 
  setTransactions 
}: { 
  clients: Client[], 
  transactions: Transaction[], 
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>> 
}) => {
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState<{
    type: 'Receivable' | 'Payable';
    description: string;
    amount: string;
    dueDate: string;
    clientId: string;
    recurrence: RecurrenceType;
    installmentsTotal: string;
  }>({
    type: 'Receivable',
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    clientId: '',
    recurrence: 'One-time',
    installmentsTotal: ''
  });

  const toggleStatus = async (id: string) => {
    // Find current status
    const currentTx = transactions.find(t => t.id === id);
    if (!currentTx) return;
    
    const newStatus = currentTx.status === 'Paid' ? 'Pending' : 'Paid';

    // Optimistic
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ));

    // DB
    await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
  };

  const openNewTransactionModal = () => {
    setEditingId(null);
    setNewTransaction({
      type: 'Receivable',
      description: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      clientId: '',
      recurrence: 'One-time',
      installmentsTotal: ''
    });
    setIsModalOpen(true);
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingId(t.id);
    setNewTransaction({
      type: t.type,
      description: t.description,
      amount: t.amount.toString(),
      dueDate: t.dueDate,
      clientId: t.clientId || '',
      recurrence: t.recurrence,
      installmentsTotal: t.installmentsTotal ? t.installmentsTotal.toString() : ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    // Optimistic
    setTransactions(prev => prev.filter(t => t.id !== id));

    // DB
    await supabase.from('transactions').delete().eq('id', id);
  };

  const handleSaveTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.dueDate) return;

    const payload = {
      type: newTransaction.type,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      due_date: newTransaction.dueDate,
      client_id: newTransaction.type === 'Receivable' ? (newTransaction.clientId || null) : null,
      recurrence: newTransaction.recurrence,
      installments_total: newTransaction.recurrence === 'Installments' && newTransaction.installmentsTotal ? parseInt(newTransaction.installmentsTotal) : null
    };

    if (editingId) {
      // Update existing
      const { error } = await supabase.from('transactions').update(payload).eq('id', editingId);

      if (error) {
        console.error(error);
        return;
      }

      setTransactions(prev => prev.map(t => t.id === editingId ? {
        ...t,
        type: newTransaction.type,
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        dueDate: newTransaction.dueDate,
        clientId: newTransaction.type === 'Receivable' ? (newTransaction.clientId || undefined) : undefined,
        recurrence: newTransaction.recurrence,
        installmentsTotal: payload.installments_total || undefined
      } : t));

    } else {
      // Create new
      const { data, error } = await supabase.from('transactions').insert([{
        ...payload,
        status: 'Pending',
      }]).select();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setTransactions([...transactions, mapTransaction(data[0])]);
      }
    }
    
    setIsModalOpen(false);
  };

  const filteredTransactions = transactions
    .filter(t => t.type === (activeTab === 'receivable' ? 'Receivable' : 'Payable'))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const forecast = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.status === 'Pending')
      .forEach(t => {
        if (!groups[t.dueDate]) groups[t.dueDate] = 0;
        groups[t.dueDate] += t.amount;
      });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredTransactions]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ... (Same layout code as before) ... */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financeiro</h1>
          <p className="text-slate-500">Fluxo de Caixa e Previsões</p>
        </div>
        <button 
          onClick={openNewTransactionModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('receivable')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'receivable' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Contas a Receber
            </button>
            <button 
              onClick={() => setActiveTab('payable')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'payable' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Contas a Pagar
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Descrição / Cliente</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Vencimento</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map(t => {
                    const daysOverdue = getDaysOverdue(t.dueDate);
                    const isOverdue = t.status === 'Pending' && daysOverdue > 0;
                    const client = clients.find(c => c.id === t.clientId);
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{client ? client.company : t.description}</p>
                          <div className="flex items-center gap-2">
                             {client && <span className="text-xs text-slate-500">{t.description}</span>}
                             {t.recurrence === 'Fixed' && (
                               <span className="flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200" title="Recorrência Fixa">
                                 <Calendar size={10} /> Fixa
                               </span>
                             )}
                             {t.recurrence === 'Installments' && t.installmentsTotal && (
                               <span className="flex items-center gap-0.5 text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100" title={`Parcelado em ${t.installmentsTotal}x`}>
                                 <Clock size={10} /> {t.installmentsTotal}x
                               </span>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                            {formatDate(t.dueDate)}
                            {isOverdue && (
                               <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                                 {daysOverdue}d atraso
                               </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4">
                           {t.status === 'Paid' ? (
                             <Badge color="green">Pago</Badge>
                           ) : isOverdue ? (
                             <Badge color="red">Pendente</Badge>
                           ) : (
                             <Badge color="blue">Aberto</Badge>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => toggleStatus(t.id)}
                              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                                t.status === 'Paid' 
                                  ? 'border-slate-200 text-slate-500 hover:bg-slate-50' 
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-medium'
                              }`}
                            >
                              {t.status === 'Paid' ? 'Desfazer' : 'Dar Baixa'}
                            </button>
                            <button 
                              onClick={() => handleEditTransaction(t)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                Nenhuma transação encontrada.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === 'receivable' ? 'Previsão de Entrada' : 'Previsão de Saída'}
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              {activeTab === 'receivable' ? 'Valores a entrar nos próximos dias.' : 'Valores a pagar nos próximos dias.'}
            </p>
            
            <div className="space-y-4">
              {forecast.length > 0 ? forecast.map(([date, amount]) => (
                <div key={date} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${activeTab === 'receivable' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-medium">{formatDate(date)}</span>
                  </div>
                  <span className={`font-bold ${activeTab === 'receivable' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(amount)}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-slate-500 italic">Sem previsões pendentes.</p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 text-sm">Total Previsto</span>
                <span className="text-2xl font-bold">{formatCurrency(forecast.reduce((a, b) => a + b[1], 0))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Transação' : 'Nova Transação'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'Receivable' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    newTransaction.type === 'Receivable' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'Payable' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    newTransaction.type === 'Payable' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Despesa
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Ex: Mensalidade Cliente X"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      placeholder="0,00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                    <input
                      type="date"
                      value={newTransaction.dueDate}
                      onChange={(e) => setNewTransaction({ ...newTransaction, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Periodicidade / Tipo</label>
                <select
                  value={newTransaction.recurrence}
                  onChange={(e) => setNewTransaction({ ...newTransaction, recurrence: e.target.value as RecurrenceType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="One-time">Pontual (Uma única vez)</option>
                  <option value="Fixed">Fixa (Mensal Recorrente)</option>
                  <option value="Installments">Parcelada / Temporária</option>
                </select>
              </div>

              {newTransaction.recurrence === 'Installments' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade de Meses/Parcelas</label>
                  <input
                    type="number"
                    value={newTransaction.installmentsTotal}
                    onChange={(e) => setNewTransaction({ ...newTransaction, installmentsTotal: e.target.value })}
                    placeholder="Ex: 6"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              )}

              {newTransaction.type === 'Receivable' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label>
                  <select
                    value={newTransaction.clientId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.company}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveTransaction}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                {editingId ? 'Atualizar Transação' : 'Salvar Transação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Component ---

const App = () => {
  const [view, setView] = useState<'dashboard' | 'clients' | 'finance' | 'agenda' | 'prospection'>('prospection');
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [leads, setLeads] = useState<ProspectionLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!supabase) {
    return <SetupScreen />;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: clientsData } = await supabase.from('clients').select('*');
      const { data: transactionsData } = await supabase.from('transactions').select('*');
      const { data: demandsData } = await supabase.from('demands').select('*');
      const { data: eventsData } = await supabase.from('agenda_events').select('*');
      const { data: leadsData } = await supabase.from('prospection_leads').select('*');

      if (clientsData) setClients(clientsData.map(mapClient));
      if (transactionsData) setTransactions(transactionsData.map(mapTransaction));
      if (demandsData) setDemands(demandsData.map(mapDemand));
      if (eventsData) setEvents(eventsData.map(mapEvent));
      if (leadsData) setLeads(leadsData.map(mapLead));
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const toggleDemand = async (id: string) => {
    // Find current status
    const currentDemand = demands.find(d => d.id === id);
    if (!currentDemand) return;
    
    const newStatus = currentDemand.status === 'Pending' ? 'Done' : 'Pending';

    // Optimistic Update
    setDemands(demands.map(d => d.id === id ? { ...d, status: newStatus } : d));

    // DB Update
    await supabase.from('demands').update({ status: newStatus }).eq('id', id);
  };

  const handleNavClick = (viewName: 'dashboard' | 'clients' | 'finance' | 'agenda' | 'prospection') => {
    setView(viewName);
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
           <Loader2 size={40} className="animate-spin" />
           <p className="font-medium text-slate-500">Carregando CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside className={`
          w-64 bg-white border-r border-slate-200 flex flex-col 
          fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-700">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-xl font-bold tracking-tight">VM Marketing</span>
          </div>
          {/* Close Button Mobile */}
          <button 
             onClick={() => setIsMobileMenuOpen(false)}
             className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Real-time Clock */}
        <SaoPauloClock />

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} /> Visão Geral
          </button>
          <button 
            onClick={() => handleNavClick('prospection')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'prospection' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Target size={18} /> Prospecção
          </button>
          <button 
            onClick={() => handleNavClick('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'clients' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users size={18} /> Clientes
          </button>
          <button 
            onClick={() => handleNavClick('agenda')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'agenda' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <CalendarDays size={18} /> Agenda
          </button>
          <button 
            onClick={() => handleNavClick('finance')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'finance' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Wallet size={18} /> Financeiro
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
               <Users size={14} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Admin</p>
              <p className="text-xs text-slate-500">admin@vmmarketing.com</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 z-20 sticky top-0">
           <div className="flex items-center gap-2 text-indigo-700">
              <div className="bg-indigo-600 text-white p-1 rounded-lg"><TrendingUp size={16} /></div>
              <span className="font-bold tracking-tight">VM Marketing</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 p-2 bg-slate-50 rounded-lg active:bg-slate-100">
             <Menu size={24} />
           </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {view === 'dashboard' && <Dashboard clients={clients} transactions={transactions} demands={demands} events={events} leads={leads} onToggleDemand={toggleDemand}/>}
          {view === 'prospection' && <ProspectionView leads={leads} setLeads={setLeads} />}
          {view === 'clients' && <ClientsView clients={clients} setClients={setClients} demands={demands} setDemands={setDemands}/>}
          {view === 'agenda' && <AgendaView events={events} setEvents={setEvents} clients={clients}/>}
          {view === 'finance' && <FinanceView clients={clients} transactions={transactions} setTransactions={setTransactions}/>}
        </main>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
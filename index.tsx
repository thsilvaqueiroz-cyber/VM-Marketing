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
  Settings
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE ---
// 1. COLOQUE SUAS CHAVES AQUI SE DESEJAR HARDCODED
// 2. OU DEIXE VAZIO E USE A TELA DE CONFIGURAÇÃO DO APP
const SUPABASE_URL = process.env.SUPABASE_URL || ""; 
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

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

interface Transaction {
  id: string;
  clientId?: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending';
  type: 'Receivable' | 'Payable';
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
  description: data.description,
  amount: parseFloat(data.amount),
  dueDate: data.due_date,
  status: data.status,
  type: data.type
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
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const getDaysOverdue = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dueDate.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays > 0 ? diffDays : 0;
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

const LeadDetailModal = ({ 
  lead, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  lead: ProspectionLead | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (lead: ProspectionLead) => void; 
}) => {
  const [formData, setFormData] = useState<ProspectionLead | null>(null);

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
    }
  }, [lead]);

  if (!isOpen || !formData) return null;

  const handleSave = async () => {
    if (formData) {
       onSave(formData); // Optimistic update
       const { error } = await supabase.from('prospection_leads').update({
         company: formData.company,
         phone: formData.phone,
         decision_maker: formData.decisionMaker,
         bridge: formData.bridge,
         source: formData.source,
         notes: formData.notes,
         proposal_value: formData.proposalValue,
         proposal_details: formData.proposalDetails,
         next_action_type: formData.nextActionType,
         next_action_date: formData.nextActionDate
       }).eq('id', formData.id);

       if (error) {
         console.error('Error updating lead:', error);
       }
       onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Detalhes do Lead</h2>
            <p className="text-sm text-slate-500">Visualizar e editar informações</p>
          </div>
          <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-6">
            {/* Seção 1: Dados da Empresa */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                <Briefcase size={16}/> Dados da Empresa & Origem
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Empresa</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Origem do Lead</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                    value={formData.source || ''}
                    onChange={e => setFormData({...formData, source: e.target.value})}
                  >
                      <option value="">Selecione...</option>
                      <option value="Indicação">Indicação</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Tráfego Pago">Tráfego Pago</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Porta a Porta">Porta a Porta</option>
                      <option value="Google Meu Negócio">Google Meu Negócio</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção 2: Contatos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                <Users size={16}/> Contatos Chave
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Decisor</label>
                    <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={formData.decisionMaker || ''}
                    onChange={e => setFormData({...formData, decisionMaker: e.target.value})}
                  />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Ponte</label>
                    <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={formData.bridge || ''}
                    onChange={e => setFormData({...formData, bridge: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone / WhatsApp</label>
                    <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Inteligência & Proposta */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                <Megaphone size={16}/> Inteligência & Proposta
              </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Proposta (R$)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={formData.proposalValue || ''}
                      onChange={e => setFormData({...formData, proposalValue: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Observações Gerais</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={formData.notes || ''}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Detalhes da Proposta</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                    value={formData.proposalDetails || ''}
                    onChange={e => setFormData({...formData, proposalDetails: e.target.value})}
                  />
                </div>
            </div>

            {/* Seção 4: Próximo Passo */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                <CalendarDays size={16}/> Próximo Passo
              </h3>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Ação</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                      value={formData.nextActionType || 'Reunião'}
                      onChange={e => setFormData({...formData, nextActionType: e.target.value})}
                    >
                        <option value="Ligar">Ligar</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Reunião">Reunião</option>
                        <option value="Visita">Visita</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Data</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      value={formData.nextActionDate || ''}
                      onChange={e => setFormData({...formData, nextActionDate: e.target.value})}
                    />
                  </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
          <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition-colors flex items-center gap-2">
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Views ---

const Dashboard = ({
  clients,
  transactions,
  demands,
  events,
  leads,
  onToggleDemand
}: {
  clients: Client[];
  transactions: Transaction[];
  demands: Demand[];
  events: AgendaEvent[];
  leads: ProspectionLead[];
  onToggleDemand: (id: string) => void;
}) => {
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const pendingDemands = demands.filter(d => d.status === 'Pending').length;
  const todaysEvents = events.filter(e => {
    const today = new Date().toISOString().split('T')[0];
    return e.date === today && e.status === 'Pending';
  }).length;
  
  const recentDemands = [...demands]
    .filter(d => d.status === 'Pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Visão Geral</h1>
        <p className="text-slate-500">Bem-vindo ao CRM da VM Marketing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Users size={20} />
            <span className="text-sm font-medium">Clientes Ativos</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{activeClients}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 text-slate-400 mb-2">
            <CheckCircle2 size={20} />
            <span className="text-sm font-medium">Demandas Pendentes</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{pendingDemands}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Calendar size={20} />
            <span className="text-sm font-medium">Agenda Hoje</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{todaysEvents}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Demandas Urgentes</h3>
          <div className="space-y-3">
            {recentDemands.length > 0 ? recentDemands.map(demand => (
               <div key={demand.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <button onClick={() => onToggleDemand(demand.id)} className="text-slate-400 hover:text-indigo-600">
                       <Square size={18} />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{demand.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(demand.dueDate)}</p>
                    </div>
                  </div>
                  <Badge color="blue">{demand.service}</Badge>
               </div>
            )) : (
               <p className="text-slate-400 text-sm text-center py-4">Tudo em dia!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleAddClient = (newClient: Client) => {
    setClients([...clients, newClient]);
    setIsNewModalOpen(false);
  };

  const handleAddDemand = (newDemand: Demand) => {
    setDemands([...demands, newDemand]);
  };

  const handleToggleDemand = async (id: string) => {
     const currentDemand = demands.find(d => d.id === id);
     if (!currentDemand) return;
     const newStatus = currentDemand.status === 'Pending' ? 'Done' : 'Pending';
     
     setDemands(demands.map(d => d.id === id ? { ...d, status: newStatus } : d));
     await supabase.from('demands').update({ status: newStatus }).eq('id', id);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-500">Gestão da carteira de clientes</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <div 
            key={client.id} 
            onClick={() => setSelectedClient(client)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                 {client.company.substring(0, 2).toUpperCase()}
              </div>
              <Badge color={client.status === 'Active' ? 'green' : 'gray'}>{client.status === 'Active' ? 'Ativo' : 'Inativo'}</Badge>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{client.company}</h3>
            <p className="text-sm text-slate-500 mb-4">{client.name}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {client.services.map(s => (
                <span key={s} className="text-[10px] px-2 py-1 bg-slate-50 border border-slate-100 rounded text-slate-600">
                  {s}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-sm text-slate-500">
               <span className="flex items-center gap-1"><Phone size={14}/> {client.phone}</span>
               <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <NewClientModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSave={handleAddClient} 
      />

      <ClientDetailModal 
        client={selectedClient} 
        isOpen={!!selectedClient} 
        onClose={() => setSelectedClient(null)}
        demands={demands}
        onAddDemand={handleAddDemand}
        onToggleDemandStatus={handleToggleDemand}
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

  const handleAddEvent = (event: AgendaEvent) => {
    setEvents([...events, event]);
    setIsModalOpen(false);
  };

  const handleToggleEvent = async (id: string) => {
    const current = events.find(e => e.id === id);
    if (!current) return;
    const newStatus = current.status === 'Pending' ? 'Done' : 'Pending';
    
    setEvents(events.map(e => e.id === id ? { ...e, status: newStatus } : e));
    await supabase.from('agenda_events').update({ status: newStatus }).eq('id', id);
  };

  const sortedEvents = [...events].sort((a, b) => {
     return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime();
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Agenda</h1>
          <p className="text-slate-500">Compromissos e Reuniões</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Novo Evento
        </button>
      </div>

      <div className="space-y-4">
        {sortedEvents.length > 0 ? sortedEvents.map(event => {
          const client = clients.find(c => c.id === event.clientId);
          const isDone = event.status === 'Done';
          
          return (
             <div key={event.id} className={`flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all ${isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                <div className="flex flex-col items-center justify-center p-3 bg-indigo-50 rounded-lg min-w-[80px]">
                   <span className="text-xs font-bold text-indigo-400 uppercase">{new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                   <span className="text-2xl font-bold text-indigo-700">{new Date(event.date).getDate()}</span>
                </div>
                
                <div className="flex-1">
                   <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-bold text-lg ${isDone ? 'line-through text-slate-500' : 'text-slate-800'}`}>{event.title}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                           <Clock size={14} /> {event.time}
                           {client && <span className="flex items-center gap-1 ml-2"><Briefcase size={14} /> {client.company}</span>}
                        </p>
                      </div>
                      <Badge color={event.type === 'Reunião' ? 'purple' : 'blue'}>{event.type}</Badge>
                   </div>
                   {event.description && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded">{event.description}</p>}
                </div>
                
                <div className="flex items-center">
                   <button 
                    onClick={() => handleToggleEvent(event.id)}
                    className={`p-2 rounded-full transition-colors ${isDone ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100 hover:text-indigo-600'}`}
                   >
                     {isDone ? <CheckCircle2 size={24} /> : <CircleSlash size={24} />}
                   </button>
                </div>
             </div>
          );
        }) : (
           <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
             Nenhum evento agendado.
           </div>
        )}
      </div>

      <NewEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddEvent}
        clients={clients}
      />
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
  const [selectedLead, setSelectedLead] = useState<ProspectionLead | null>(null);
  const [newLead, setNewLead] = useState<{
    company: string;
    phone: string;
    decisionMaker: string;
    bridge: string;
    source: string;
    notes: string;
    proposalValue: string;
    proposalDetails: string;
    nextActionDate: string;
    nextActionType: string;
  }>({
    company: '',
    phone: '',
    decisionMaker: '',
    bridge: '',
    source: '',
    notes: '',
    proposalValue: '',
    proposalDetails: '',
    nextActionDate: '',
    nextActionType: 'Reunião'
  });
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const stages: ProspectionStage[] = ['Prospectado', 'Marcou Reunião', 'Congelado', 'Sem Interesse', 'Fechamento'];

  const getStageColor = (stage: ProspectionStage) => {
    switch (stage) {
      case 'Prospectado': return 'border-blue-200 bg-blue-50/30';
      case 'Marcou Reunião': return 'border-purple-200 bg-purple-50/30';
      case 'Congelado': return 'border-amber-200 bg-amber-50/30';
      case 'Sem Interesse': return 'border-red-200 bg-red-50/30';
      case 'Fechamento': return 'border-emerald-200 bg-emerald-50/30';
      default: return 'border-slate-200 bg-slate-50';
    }
  };

  const getStageIcon = (stage: ProspectionStage) => {
    switch (stage) {
      case 'Prospectado': return <Target size={16} className="text-blue-600" />;
      case 'Marcou Reunião': return <Users size={16} className="text-purple-600" />;
      case 'Congelado': return <IceCream size={16} className="text-amber-600" />;
      case 'Sem Interesse': return <CircleSlash size={16} className="text-red-600" />;
      case 'Fechamento': return <Handshake size={16} className="text-emerald-600" />;
    }
  };

  const moveLead = async (id: string, newStage: ProspectionStage) => {
    // Optimistic Update
    setLeads(leads.map(l => l.id === id ? { ...l, stage: newStage } : l));
    
    // DB Update
    await supabase.from('prospection_leads').update({ stage: newStage }).eq('id', id);
  };

  const handleUpdateLead = (updatedLead: ProspectionLead) => {
    setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const handleAddLead = async () => {
    if (!newLead.company) return;

    const { data, error } = await supabase.from('prospection_leads').insert([{
      company: newLead.company,
      phone: newLead.phone,
      stage: 'Prospectado',
      decision_maker: newLead.decisionMaker,
      bridge: newLead.bridge,
      source: newLead.source,
      notes: newLead.notes,
      proposal_value: newLead.proposalValue,
      proposal_details: newLead.proposalDetails,
      next_action_date: newLead.nextActionDate || null,
      next_action_type: newLead.nextActionType
    }]).select();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setLeads([...leads, mapLead(data[0])]);
      setNewLead({ 
        company: '', 
        phone: '', 
        decisionMaker: '', 
        bridge: '', 
        source: '', 
        notes: '', 
        proposalValue: '', 
        proposalDetails: '', 
        nextActionDate: '', 
        nextActionType: 'Reunião'
      });
      setIsModalOpen(false);
    }
  };

  const handleDeleteLead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm('Tem certeza que deseja excluir este lead?')) {
        setLeads(leads.filter(l => l.id !== id));
        await supabase.from('prospection_leads').delete().eq('id', id);
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, stage: ProspectionStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      moveLead(id, stage);
    }
    setDraggedLeadId(null);
  };

  const totalLeads = leads.length;
  const totalMeetings = leads.filter(l => l.stage === 'Marcou Reunião' || l.stage === 'Fechamento').length;
  const totalClosures = leads.filter(l => l.stage === 'Fechamento').length;

  const leadsToMeetingRatio = totalMeetings > 0 ? (totalLeads / totalMeetings).toFixed(1) : '0';
  const leadsToClosureRatio = totalClosures > 0 ? (totalLeads / totalClosures).toFixed(1) : '0';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* ... Header and Stats (Same as before) ... */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Controle de Prospecção</h1>
          <p className="text-slate-500">Gestão do funil de vendas e métricas de conversão</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Novo Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Target size={20} />
            <span className="text-sm font-medium">Total Leads</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Users size={20} />
            <span className="text-sm font-medium">Reuniões</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalMeetings}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Handshake size={20} />
            <span className="text-sm font-medium">Fechamentos</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{totalClosures}</p>
        </div>
        <div className="bg-indigo-900 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 text-indigo-300 mb-2">
            <BarChart3 size={20} />
            <span className="text-sm font-medium tracking-wide uppercase">Lei dos Números</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-indigo-200">Para fechar 1 empresa, você precisa de:</p>
            <p className="text-xl font-bold">{leadsToClosureRatio} Leads</p>
            <p className="text-xs text-indigo-300 mt-2">Conversão Reunião: {leadsToMeetingRatio} leads</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-4 h-[calc(100vh-400px)] min-h-[500px]">
        {stages.map(stage => (
          <div 
            key={stage} 
            className="flex-1 min-w-[280px] bg-slate-100/50 rounded-2xl border border-slate-200 flex flex-col overflow-hidden transition-colors hover:bg-slate-100"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className={`p-4 border-b flex justify-between items-center ${getStageColor(stage)}`}>
              <div className="flex items-center gap-2">
                {getStageIcon(stage)}
                <h3 className="text-sm font-bold text-slate-700">{stage}</h3>
              </div>
              <span className="bg-white/50 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {leads.filter(l => l.stage === stage).length}
              </span>
            </div>
            
            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
              {leads.filter(l => l.stage === stage).map(lead => (
                <div 
                  key={lead.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => setSelectedLead(lead)}
                  className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative cursor-pointer active:cursor-grabbing ${draggedLeadId === lead.id ? 'opacity-50 ring-2 ring-indigo-400 rotate-2' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-800 text-sm leading-tight pr-6">{lead.company}</p>
                    <div className="absolute top-4 right-4 text-slate-300 opacity-50 group-hover:opacity-100 cursor-grab">
                      <GripVertical size={16} />
                    </div>
                  </div>
                  
                  {lead.decisionMaker && (
                    <p className="text-xs text-slate-600 mb-1 flex items-center gap-1.5 font-medium">
                      <UserCheck size={12} className="text-indigo-500"/> {lead.decisionMaker}
                    </p>
                  )}
                  {lead.bridge && (
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                      <User size={12}/> Ponte: {lead.bridge}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                     <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone size={10}/> {lead.phone}
                     </p>
                     {lead.source && (
                       <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                         {lead.source}
                       </span>
                     )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {stages.filter(s => s !== stage).map(nextStage => (
                      <button 
                        key={nextStage}
                        onClick={(e) => { e.stopPropagation(); moveLead(lead.id, nextStage); }}
                        className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors"
                      >
                        {nextStage === 'Marcou Reunião' ? 'REUNIÃO' : nextStage.toUpperCase()}
                      </button>
                    ))}
                    <button onClick={(e) => handleDeleteLead(e, lead.id)} className="ml-auto text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Cadastrar Prospecção</h2>
                <p className="text-sm text-slate-500">Preencha os detalhes completos do lead</p>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                {/* Seção 1: Dados da Empresa */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                    <Briefcase size={16}/> Dados da Empresa & Origem
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Empresa *</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Padaria do Zé"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        value={newLead.company}
                        onChange={e => setNewLead({...newLead, company: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Origem do Lead</label>
                      <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                        value={newLead.source}
                        onChange={e => setNewLead({...newLead, source: e.target.value})}
                      >
                         <option value="">Selecione...</option>
                         <option value="Indicação">Indicação</option>
                         <option value="Instagram">Instagram</option>
                         <option value="Tráfego Pago">Tráfego Pago</option>
                         <option value="Cold Call">Cold Call</option>
                         <option value="Porta a Porta">Porta a Porta</option>
                         <option value="Google Meu Negócio">Google Meu Negócio</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Contatos */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                    <Users size={16}/> Contatos Chave
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-semibold text-slate-600 mb-1">Decisor (Dono/Gerente)</label>
                       <input 
                        type="text" 
                        placeholder="Nome de quem manda"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        value={newLead.decisionMaker}
                        onChange={e => setNewLead({...newLead, decisionMaker: e.target.value})}
                      />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-600 mb-1">Ponte (Secretária/Sócio)</label>
                       <input 
                        type="text" 
                        placeholder="Quem facilitou?"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        value={newLead.bridge}
                        onChange={e => setNewLead({...newLead, bridge: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone / WhatsApp</label>
                       <input 
                        type="text" 
                        placeholder="(00) 00000-0000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        value={newLead.phone}
                        onChange={e => setNewLead({...newLead, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 3: Inteligência & Proposta */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                    <Megaphone size={16}/> Inteligência & Proposta
                  </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Proposta (R$)</label>
                        <input 
                          type="number" 
                          placeholder="0,00"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={newLead.proposalValue}
                          onChange={e => setNewLead({...newLead, proposalValue: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Observações Gerais</label>
                        <input 
                          type="text" 
                          placeholder="Dores do cliente, nicho..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={newLead.notes}
                          onChange={e => setNewLead({...newLead, notes: e.target.value})}
                        />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Detalhes da Proposta / Serviços</label>
                      <textarea
                        rows={2}
                        placeholder="O que foi oferecido? (Ex: Tráfego + Social Media)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                        value={newLead.proposalDetails}
                        onChange={e => setNewLead({...newLead, proposalDetails: e.target.value})}
                      />
                   </div>
                </div>

                {/* Seção 4: Próximo Passo */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                    <CalendarDays size={16}/> Próximo Passo (Atividade)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Ação</label>
                        <select 
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                          value={newLead.nextActionType}
                          onChange={e => setNewLead({...newLead, nextActionType: e.target.value})}
                        >
                           <option value="Ligar">Ligar</option>
                           <option value="WhatsApp">WhatsApp</option>
                           <option value="Reunião">Reunião</option>
                           <option value="Visita">Visita</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Data</label>
                        <input 
                          type="date"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={newLead.nextActionDate}
                          onChange={e => setNewLead({...newLead, nextActionDate: e.target.value})}
                        />
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleAddLead} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition-colors flex items-center gap-2">
                <CheckCircle2 size={16} /> Salvar Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <LeadDetailModal 
        lead={selectedLead} 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
        onSave={handleUpdateLead} 
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
  const [newTransaction, setNewTransaction] = useState<{
    type: 'Receivable' | 'Payable';
    description: string;
    amount: string;
    dueDate: string;
    clientId: string;
  }>({
    type: 'Receivable',
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    clientId: '',
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

  const handleSaveTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.dueDate) return;

    const { data, error } = await supabase.from('transactions').insert([{
      type: newTransaction.type,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      due_date: newTransaction.dueDate,
      status: 'Pending',
      client_id: newTransaction.type === 'Receivable' ? (newTransaction.clientId || null) : null
    }]).select();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setTransactions([...transactions, mapTransaction(data[0])]);
      setIsModalOpen(false);
      setNewTransaction({
        type: 'Receivable',
        description: '',
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
        clientId: '',
      });
    }
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
          onClick={() => setIsModalOpen(true)}
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
                          {client && <p className="text-xs text-slate-500">{t.description}</p>}
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
            <h3 className="text-lg font-semibold mb-2">Previsão de Entrada</h3>
            <p className="text-slate-300 text-sm mb-6">Valores a entrar nos próximos dias.</p>
            
            <div className="space-y-4">
              {forecast.length > 0 ? forecast.map(([date, amount]) => (
                <div key={date} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded text-indigo-300">
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-medium">{formatDate(date)}</span>
                  </div>
                  <span className="font-bold text-emerald-400">{formatCurrency(amount)}</span>
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
              <h2 className="text-xl font-bold text-slate-800">Nova Transação</h2>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  value={newTransaction.dueDate}
                  onChange={(e) => setNewTransaction({ ...newTransaction, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

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
                Salvar Transação
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
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-700 mb-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-xl font-bold tracking-tight">VM Marketing</span>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest pl-1">CRM Control</p>
        </div>

        {/* Real-time Clock */}
        <SaoPauloClock />

        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} /> Visão Geral
          </button>
          <button 
            onClick={() => setView('prospection')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'prospection' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Target size={18} /> Prospecção
          </button>
          <button 
            onClick={() => setView('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'clients' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users size={18} /> Clientes
          </button>
          <button 
            onClick={() => setView('agenda')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'agenda' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <CalendarDays size={18} /> Agenda
          </button>
          <button 
            onClick={() => setView('finance')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'finance' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Wallet size={18} /> Financeiro
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-100">
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

      <main className="flex-1 overflow-y-auto">
        {view === 'dashboard' && <Dashboard clients={clients} transactions={transactions} demands={demands} events={events} leads={leads} onToggleDemand={toggleDemand}/>}
        {view === 'prospection' && <ProspectionView leads={leads} setLeads={setLeads} />}
        {view === 'clients' && <ClientsView clients={clients} setClients={setClients} demands={demands} setDemands={setDemands}/>}
        {view === 'agenda' && <AgendaView events={events} setEvents={setEvents} clients={clients}/>}
        {view === 'finance' && <FinanceView clients={clients} transactions={transactions} setTransactions={setTransactions}/>}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
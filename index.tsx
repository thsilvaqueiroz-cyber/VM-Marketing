import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
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
  Upload,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
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
  Video,
  MessageSquare,
  Trash2
} from 'lucide-react';

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

// --- Mock Data ---

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Roberto Silva', company: 'Silva Imóveis', email: 'roberto@silvaimoveis.com.br', phone: '(11) 99999-1111', contractFile: 'contrato_silva_2024.pdf', services: ['Tráfego', 'Google'], status: 'Active', startDate: '2023-01-15' },
  { id: '2', name: 'Fernanda Costa', company: 'Estética Bella', email: 'contato@bellaspa.com.br', phone: '(11) 98888-2222', contractFile: 'contrato_bella_v2.pdf', services: ['Postagens', 'Vídeo'], status: 'Active', startDate: '2023-03-10' },
  { id: '3', name: 'Grupo Omega', company: 'Omega Tech', email: 'finan@omegatech.com', phone: '(11) 97777-3333', contractFile: 'omega_contrato.pdf', services: ['Tráfego', 'Google', 'Postagens'], status: 'Active', startDate: '2023-06-01' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', clientId: '1', description: 'Mensalidade Março', amount: 2500, dueDate: '2023-10-05', status: 'Paid', type: 'Receivable' },
  { id: '2', clientId: '1', description: 'Mensalidade Abril', amount: 2500, dueDate: '2023-11-05', status: 'Pending', type: 'Receivable' },
  { id: '3', clientId: '2', description: 'Pacote Social Media', amount: 1200, dueDate: '2023-10-15', status: 'Pending', type: 'Receivable' },
  { id: '4', clientId: '3', description: 'Setup Inicial', amount: 5000, dueDate: '2023-11-10', status: 'Pending', type: 'Receivable' },
  { id: '5', description: 'Hospedagem Site', amount: 150, dueDate: '2023-11-01', status: 'Pending', type: 'Payable' },
  { id: '6', description: 'Freelancer Design', amount: 800, dueDate: '2023-11-03', status: 'Paid', type: 'Payable' },
];

const MOCK_DEMANDS: Demand[] = [
  { id: '1', clientId: '1', title: 'Relatório Mensal de Tráfego', service: 'Tráfego', dueDate: '2023-11-05', status: 'Pending' },
  { id: '2', clientId: '1', title: 'Otimização Keywords Google Ads', service: 'Google', dueDate: '2023-10-28', status: 'Done' },
  { id: '3', clientId: '2', title: 'Reels: Bastidores da Clínica', service: 'Vídeo', dueDate: '2023-11-02', status: 'Pending' },
  { id: '4', clientId: '2', title: 'Carrossel Dicas de Pele', service: 'Postagens', dueDate: '2023-11-01', status: 'Pending' },
  { id: '5', clientId: '3', title: 'Campanha Black Friday', service: 'Tráfego', dueDate: '2023-11-15', status: 'Pending' },
];

const MOCK_EVENTS: AgendaEvent[] = [
  { id: '1', clientId: '1', title: 'Reunião de Alinhamento', type: 'Reunião', date: new Date().toISOString().split('T')[0], time: '14:00', description: 'Definir metas do próximo mês.', status: 'Pending' },
  { id: '2', clientId: '2', title: 'Visita Técnica', type: 'Visita', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '10:00', description: 'Fotografia do novo espaço para reels.', status: 'Pending' },
  { id: '3', clientId: '1', title: 'Follow-up Contrato', type: 'Follow-up', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '09:00', description: 'Verificar assinatura do aditivo.', status: 'Pending' },
];

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

// --- New Client Modal Component ---

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

  const handleSave = () => {
    if(!formData.company || !formData.name) return; // Basic validation

    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      company: formData.company,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      services: formData.services,
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0]
    };

    onSave(newClient);
    setFormData({ company: '', name: '', email: '', phone: '', services: [] }); // Reset
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

// --- New Event Modal Component ---

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

  const handleSave = () => {
    if (!formData.title || !formData.date || !formData.time) return;

    const newEvent: AgendaEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      type: formData.type,
      clientId: formData.clientId || undefined,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      status: 'Pending'
    };

    onSave(newEvent);
    // Reset form but keep date
    setFormData({ ...formData, title: '', description: '', clientId: '' });
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

// --- Client Detail Modal Component ---

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
  
  const handleAdd = () => {
    if (!newDemand.title || !newDemand.service || !newDemand.dueDate) return;
    
    onAddDemand({
      id: Math.random().toString(36).substr(2, 9),
      clientId: client.id,
      title: newDemand.title,
      service: newDemand.service as ServiceType,
      dueDate: newDemand.dueDate,
      status: 'Pending'
    });
    
    setNewDemand({ title: '', service: '', dueDate: new Date().toISOString().split('T')[0] });
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

// --- Views ---

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

  const handleCreateEvent = (event: AgendaEvent) => {
    setEvents([...events, event]);
    setIsModalOpen(false);
  };

  const toggleEventStatus = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, status: e.status === 'Pending' ? 'Done' : 'Pending' } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'Reunião': return <Users size={18} className="text-indigo-600" />;
      case 'Visita': return <MapPin size={18} className="text-emerald-600" />;
      case 'Follow-up': return <Phone size={18} className="text-orange-600" />;
      default: return <CalendarDays size={18} className="text-slate-600" />;
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'Reunião': return 'bg-indigo-50 border-indigo-100';
      case 'Visita': return 'bg-emerald-50 border-emerald-100';
      case 'Follow-up': return 'bg-orange-50 border-orange-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const getGroupTitle = (date: string) => {
    if (date === today) return 'Hoje';
    if (date === tomorrow) return 'Amanhã';
    return formatDate(date);
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Agenda</h1>
            <p className="text-slate-500">Compromissos, Visitas e Follow-ups</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Novo Agendamento
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {sortedEvents.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                  <div className="mx-auto h-16 w-16 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-4">
                    <CalendarDays size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700">Agenda Vazia</h3>
                  <p className="text-slate-400">Nenhum compromisso agendado.</p>
               </div>
            ) : (
              sortedEvents.map((event, index) => {
                const showDateHeader = index === 0 || event.date !== sortedEvents[index - 1].date;
                const client = clients.find(c => c.id === event.clientId);
                const isDone = event.status === 'Done';

                return (
                  <div key={event.id}>
                    {showDateHeader && (
                      <div className="flex items-center gap-3 mb-4 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${event.date === today ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {getGroupTitle(event.date)}
                        </span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                      </div>
                    )}
                    
                    <div className={`relative flex items-start gap-4 p-5 rounded-xl border mb-3 transition-all group ${isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                      {/* Left Time Column */}
                      <div className="flex flex-col items-center min-w-[60px]">
                        <span className={`text-sm font-bold ${isDone ? 'text-slate-400' : 'text-slate-800'}`}>{event.time}</span>
                         <div className={`mt-2 p-2 rounded-lg ${getEventColor(event.type)}`}>
                            {getEventIcon(event.type)}
                         </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-bold text-lg ${isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                            {event.title}
                          </h3>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => deleteEvent(event.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                             >
                               <Trash2 size={16} />
                             </button>
                             <button 
                                onClick={() => toggleEventStatus(event.id)}
                                className={`p-1.5 rounded-lg transition-colors ${isDone ? 'text-slate-400 hover:bg-slate-200' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                title={isDone ? "Reabrir" : "Concluir"}
                             >
                               <CheckSquare size={16} />
                             </button>
                          </div>
                        </div>
                        
                        {client && (
                          <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-indigo-600">
                             <Briefcase size={14} /> {client.company}
                          </div>
                        )}

                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                          {event.description || "Sem descrição."}
                        </p>

                        <div className="flex gap-2 mt-3">
                           <span className="text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-500 bg-slate-50">
                             {event.type}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Sidebar - Summary */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500"/> Resumo do Dia
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total de Eventos</span>
                    <span className="font-bold text-slate-800">{events.filter(e => e.date === today).length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Pendentes</span>
                    <span className="font-bold text-orange-600">{events.filter(e => e.date === today && e.status === 'Pending').length}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-2"></div>
                  <div className="text-xs text-slate-400 text-center">
                    {events.filter(e => e.date === today && e.status === 'Pending').length === 0 
                      ? "Tudo limpo por hoje! 🎉" 
                      : "Mantenha o foco!"}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <NewEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateEvent}
        clients={clients}
      />
    </>
  );
};

const Dashboard = ({ 
  clients, 
  transactions, 
  demands,
  onToggleDemand
}: { 
  clients: Client[], 
  transactions: Transaction[], 
  demands: Demand[],
  onToggleDemand: (id: string) => void
}) => {
  const receivables = transactions.filter(t => t.type === 'Receivable');
  
  const totalRevenue = receivables.filter(t => t.status === 'Paid').reduce((acc, t) => acc + t.amount, 0);
  const projectedRevenue = receivables.filter(t => t.status === 'Pending').reduce((acc, t) => acc + t.amount, 0);
  
  const overdueTransactions = receivables.filter(t => t.status === 'Pending' && getDaysOverdue(t.dueDate) > 0);
  const overdueAmount = overdueTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Filter next demands from global state
  const upcomingDemands = demands
    .filter(d => d.status === 'Pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Painel de Controle</h1>
        <p className="text-slate-500">Visão geral da VM Marketing</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><DollarSign size={20} /></div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Receita Realizada</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><TrendingUp size={20} /></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Previsão (A Receber)</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(projectedRevenue)}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertCircle size={20} /></div>
            {overdueAmount > 0 && <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Atenção</span>}
          </div>
          <p className="text-slate-500 text-sm font-medium">Inadimplência</p>
          <h3 className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</h3>
          <p className="text-xs text-red-400 mt-1">{overdueTransactions.length} clientes em atraso</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Users size={20} /></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Clientes Ativos</p>
          <h3 className="text-2xl font-bold text-slate-800">{clients.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="text-slate-400" size={18}/> Próximos Recebimentos
          </h3>
          <div className="space-y-4">
            {receivables
              .filter(t => t.status === 'Pending')
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 5)
              .map(t => {
                const client = clients.find(c => c.id === t.clientId);
                return (
                  <div key={t.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-slate-800">{client?.company || 'Cliente'}</p>
                      <p className="text-xs text-slate-500">{t.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{formatCurrency(t.amount)}</p>
                      <p className="text-xs text-slate-500">{formatDate(t.dueDate)}</p>
                    </div>
                  </div>
                )
              })}
            {receivables.filter(t => t.status === 'Pending').length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">Nenhum recebimento pendente.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-slate-400" size={18}/> Entregas & Demandas Próximas
          </h3>
           <div className="space-y-3">
             {upcomingDemands.length > 0 ? upcomingDemands.map(demand => {
               const client = clients.find(c => c.id === demand.clientId);
               const isOverdue = getDaysOverdue(demand.dueDate) > 0;
               return (
                 <div key={demand.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <button onClick={() => onToggleDemand(demand.id)} className="text-slate-300 hover:text-indigo-600">
                      <Square size={18} />
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{demand.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded">{client?.company}</span>
                        <span className="text-[10px] text-slate-400">{demand.service}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                        {formatDate(demand.dueDate)}
                      </p>
                    </div>
                 </div>
               )
             }) : (
               <div className="text-center py-6 text-slate-400">
                 <p className="text-sm">Tudo em dia! Nenhuma demanda pendente.</p>
               </div>
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
  clients: Client[], 
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  demands: Demand[],
  setDemands: React.Dispatch<React.SetStateAction<Demand[]>>
}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  const handleCreateClient = (newClient: Client) => {
    setClients([...clients, newClient]);
    setIsNewClientModalOpen(false);
  };

  const addDemand = (demand: Demand) => {
    setDemands([...demands, demand]);
  };

  const toggleDemandStatus = (id: string) => {
    setDemands(demands.map(d => d.id === id ? { ...d, status: d.status === 'Pending' ? 'Done' : 'Pending' } : d));
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
            <p className="text-slate-500">Gestão de Contratos e Entregas</p>
          </div>
          <button 
            onClick={() => setIsNewClientModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Novo Cliente
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => {
            // Count pending demands for badge
            const pendingCount = demands.filter(d => d.clientId === client.id && d.status === 'Pending').length;

            return (
              <div 
                key={client.id} 
                onClick={() => setSelectedClient(client)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {client.company.substring(0,2).toUpperCase()}
                    </div>
                    <div className="relative">
                       <button className="text-slate-400 hover:text-indigo-600"><MoreVertical size={18} /></button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{client.company}</h3>
                  <p className="text-slate-500 text-sm mb-4">{client.name}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Entregas Contratadas</p>
                        {pendingCount > 0 && (
                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {pendingCount} Pendentes
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {client.services.map(service => {
                          let color = 'gray';
                          if(service === 'Tráfego') color = 'blue';
                          if(service === 'Google') color = 'orange';
                          if(service === 'Vídeo') color = 'red';
                          if(service === 'Postagens') color = 'purple';
                          return <Badge key={service} color={color}>{service}</Badge>
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600">
                          <FileText size={16} />
                          Contrato
                        </span>
                        <span className="text-indigo-600 font-medium text-xs flex items-center gap-1 group-hover:underline">
                          Ver Detalhes <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ClientDetailModal 
        client={selectedClient} 
        isOpen={!!selectedClient} 
        onClose={() => setSelectedClient(null)} 
        demands={demands}
        onAddDemand={addDemand}
        onToggleDemandStatus={toggleDemandStatus}
      />

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSave={handleCreateClient}
      />
    </>
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

  const toggleStatus = (id: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'Paid' ? 'Pending' : 'Paid' } : t
    ));
  };

  const handleSaveTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.dueDate) return;

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: newTransaction.type,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      dueDate: newTransaction.dueDate,
      status: 'Pending',
      clientId: newTransaction.type === 'Receivable' ? newTransaction.clientId : undefined
    };

    setTransactions([...transactions, transaction]);
    setIsModalOpen(false);
    setNewTransaction({
      type: 'Receivable',
      description: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      clientId: '',
    });
  };

  const filteredTransactions = transactions
    .filter(t => t.type === (activeTab === 'receivable' ? 'Receivable' : 'Payable'))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Forecasting Logic: Group by Date
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
        
        {/* Main List */}
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

        {/* Forecast Sidebar */}
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

      {/* Add Transaction Modal */}
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
              {/* Type Selection */}
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

              {/* Description */}
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

              {/* Amount */}
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

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  value={newTransaction.dueDate}
                  onChange={(e) => setNewTransaction({ ...newTransaction, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Client Select (Only for Receivables) */}
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

// --- Main Layout & App ---

const App = () => {
  const [view, setView] = useState<'dashboard' | 'clients' | 'finance' | 'agenda'>('dashboard');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [demands, setDemands] = useState<Demand[]>(MOCK_DEMANDS);
  const [events, setEvents] = useState<AgendaEvent[]>(MOCK_EVENTS);

  const toggleDemand = (id: string) => {
    setDemands(demands.map(d => d.id === id ? { ...d, status: d.status === 'Pending' ? 'Done' : 'Pending' } : d));
  };

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-700 mb-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <TrendingUp size={20} />
            </div>
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
            <LayoutDashboard size={18} />
            Visão Geral
          </button>
          <button 
            onClick={() => setView('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'clients' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users size={18} />
            Clientes & Contratos
          </button>
          <button 
            onClick={() => setView('agenda')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'agenda' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <CalendarDays size={18} />
            Agenda
          </button>
          <button 
            onClick={() => setView('finance')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'finance' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Wallet size={18} />
            Financeiro
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {view === 'dashboard' && (
          <Dashboard 
            clients={clients} 
            transactions={transactions} 
            demands={demands} 
            onToggleDemand={toggleDemand}
          />
        )}
        {view === 'clients' && (
          <ClientsView 
            clients={clients} 
            setClients={setClients} 
            demands={demands}
            setDemands={setDemands}
          />
        )}
        {view === 'agenda' && (
          <AgendaView 
            events={events}
            setEvents={setEvents}
            clients={clients}
          />
        )}
        {view === 'finance' && (
          <FinanceView 
            clients={clients} 
            transactions={transactions} 
            setTransactions={setTransactions} 
          />
        )}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
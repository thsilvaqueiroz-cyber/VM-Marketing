
import React, { useState } from 'react';
import { X, FileText, Briefcase, Plus, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Client, Demand } from '../types';
import { mapDemand, formatDate, getDaysOverdue, getTodayLocal } from '../utils';
import Badge from '../components/Badge';

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
    dueDate: getTodayLocal()
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
      setNewDemand({ title: '', service: '', dueDate: getTodayLocal() });
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

export default ClientDetailModal;

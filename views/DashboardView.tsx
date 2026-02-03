
import React from 'react';
import { Users, DollarSign, CheckCircle2, Target, Square, Calendar } from 'lucide-react';
import { Client, Transaction, Demand, AgendaEvent, ProspectionLead } from '../types';
import { formatCurrency, formatDate, getDaysOverdue } from '../utils';

const DashboardView = ({ 
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

export default DashboardView;

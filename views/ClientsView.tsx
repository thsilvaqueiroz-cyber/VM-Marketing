
import React, { useState } from 'react';
import { Search, Plus, Briefcase, ChevronRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Client, Demand } from '../types';
import NewClientModal from '../modals/NewClientModal';
import ClientDetailModal from '../modals/ClientDetailModal';

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

export default ClientsView;

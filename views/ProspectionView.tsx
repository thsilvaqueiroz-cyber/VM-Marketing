
import React, { useState } from 'react';
import { Plus, User, Phone, Pencil, Calendar, Handshake, ExternalLink, Instagram, Globe, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../services/supabase';
import { ProspectionLead, ProspectionStage, AgendaEvent, Client } from '../types';
import { mapLead, formatCurrency, formatDate } from '../utils';
import Badge from '../components/Badge';
import NewLeadModal from '../modals/NewLeadModal';
import NewEventModal from '../modals/NewEventModal';

const ProspectionView = ({
  leads,
  setLeads,
  events,
  setEvents,
  clients
}: {
  leads: ProspectionLead[];
  setLeads: React.Dispatch<React.SetStateAction<ProspectionLead[]>>;
  events?: AgendaEvent[];
  setEvents?: React.Dispatch<React.SetStateAction<AgendaEvent[]>>;
  clients?: Client[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<ProspectionLead | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [eventInitialData, setEventInitialData] = useState<Partial<AgendaEvent>>({});
  
  // Ordem das colunas: Prospectado -> Reunião -> Congelado -> Fechado -> Sem Interesse
  const stages: ProspectionStage[] = ['Prospectado', 'Marcou Reunião', 'Congelado', 'Fechado', 'Sem Interesse'];

  const updateStage = async (id: string, newStage: ProspectionStage) => {
    // Optimistic Update (Atualiza a tela instantaneamente)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: newStage } : l));
    
    // Database Update
    const { error } = await supabase.from('prospection_leads').update({ stage: newStage }).eq('id', id);

    if (error) {
      console.error("Erro ao atualizar estágio:", error);
    }
  };

  // --- Lógica de Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedLeadId(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStage: ProspectionStage) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    const lead = leads.find(l => l.id === draggedLeadId);
    
    if (lead && lead.stage !== targetStage) {
      updateStage(draggedLeadId, targetStage);
    }
    setDraggedLeadId(null);
  };
  // -----------------------------

  const handleEditClick = (lead: ProspectionLead) => {
      setLeadToEdit(lead);
      setIsModalOpen(true);
  };

  const handleScheduleClick = (lead: ProspectionLead) => {
    setEventInitialData({
        title: `Reunião - ${lead.company}`,
        description: `Agendado via Prospecção.\nContato: ${lead.decisionMaker || 'N/A'}\nTel: ${lead.phone}`,
        type: 'Reunião'
    });
    setIsEventModalOpen(true);
  };

  const handleSaveLead = (savedLead: ProspectionLead) => {
      setLeads((prev) => {
          const exists = prev.find(l => l.id === savedLead.id);
          if (exists) {
              return prev.map(l => l.id === savedLead.id ? savedLead : l);
          } else {
              return [savedLead, ...prev];
          }
      });
      setIsModalOpen(false);
      setLeadToEdit(null);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Prospecção</h1>
           <p className="text-slate-500">Pipeline de Vendas & CRM</p>
        </div>
        <button 
          onClick={() => { setLeadToEdit(null); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-md"
        >
          <Plus size={18} /> Novo Lead
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map(stage => {
            const isLostStage = stage === 'Sem Interesse';
            const isWonStage = stage === 'Fechado';
            
            let borderColor = 'border-slate-200';
            let bgHeader = 'bg-slate-100';
            let textColor = 'text-slate-700';

            if (isLostStage) {
                borderColor = 'border-red-100';
                bgHeader = 'bg-red-50';
                textColor = 'text-red-700';
            } else if (isWonStage) {
                borderColor = 'border-emerald-100';
                bgHeader = 'bg-emerald-50';
                textColor = 'text-emerald-700';
            }

            return (
            <div 
                key={stage} 
                className={`w-80 flex flex-col rounded-xl h-full border transition-colors ${bgHeader} ${borderColor}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
            >
               <div className="flex items-center justify-between p-3 mb-1">
                 <h3 className={`font-bold text-sm uppercase tracking-wide ${textColor}`}>{stage}</h3>
                 <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white/60 shadow-sm ${textColor}`}>
                   {leads.filter(l => l.stage === stage).length}
                 </span>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-3 px-3 pb-3 custom-scrollbar">
                 {leads.filter(l => l.stage === stage).map(lead => {
                   const lastActivity = lead.timeline && lead.timeline.length > 0 ? lead.timeline[0] : null;

                   return (
                   <div 
                     key={lead.id} 
                     draggable
                     onDragStart={(e) => handleDragStart(e, lead.id)}
                     onDragEnd={handleDragEnd}
                     className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative cursor-grab active:cursor-grabbing"
                   >
                     {/* Header Card */}
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-slate-800 text-sm line-clamp-1 mr-2">{lead.company}</h4>
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleEditClick(lead); }}
                         className="text-slate-300 hover:text-indigo-600 transition-colors p-1 shrink-0"
                         title="Editar Lead"
                       >
                         <Pencil size={14} />
                       </button>
                     </div>

                     {/* Info */}
                     <div className="space-y-1 mb-3 pointer-events-none">
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                            <User size={12} className="text-slate-400"/> {lead.decisionMaker || 'S/ Decisor'}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                            <Phone size={12} className="text-slate-400"/> {lead.phone}
                        </p>
                        {lead.proposalValue > 0 && (
                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-2">
                                <DollarSign size={12}/> {formatCurrency(lead.proposalValue)}
                            </p>
                        )}
                     </div>
                     
                     {/* Tags/Links */}
                     <div className="flex items-center gap-2 mb-3">
                        {lead.source && <Badge color="gray">{lead.source}</Badge>}
                        <div className="flex-1"></div>
                        {lead.googleLink && (
                            <a href={lead.googleLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors" onMouseDown={e => e.stopPropagation()}><Globe size={14}/></a>
                        )}
                        {lead.instagramLink && (
                            <a href={lead.instagramLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors" onMouseDown={e => e.stopPropagation()}><Instagram size={14}/></a>
                        )}
                     </div>
                     
                     {/* Last Activity Preview */}
                     {lastActivity && (
                         <div className="mb-3 bg-slate-50 border border-slate-100 p-2 rounded-lg pointer-events-none">
                             <p className="text-[10px] text-slate-400 font-bold mb-0.5 flex items-center gap-1">
                                 <Clock size={10}/> {formatDate(lastActivity.date)}
                             </p>
                             <p className="text-[11px] text-slate-600 line-clamp-1">
                                 {lastActivity.note}
                             </p>
                         </div>
                     )}

                     {/* Ações do Card */}
                     <div className="pt-3 border-t border-slate-50 flex gap-2">
                        {/* Botão Agendar Universal */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleScheduleClick(lead); }}
                            className="flex-1 flex items-center justify-center gap-1.5 text-[10px] bg-slate-50 text-slate-600 border border-slate-200 py-1.5 rounded hover:bg-white hover:text-indigo-600 hover:border-indigo-200 font-medium transition-all"
                            title="Agendar Evento na Agenda"
                        >
                            <Calendar size={12} /> Agendar
                        </button>

                        {stage === 'Prospectado' && (
                           <button onClick={() => updateStage(lead.id, 'Marcou Reunião')} className="flex-1 text-[10px] bg-indigo-50 text-indigo-700 py-1.5 rounded hover:bg-indigo-100 font-medium transition-colors">
                             Avançar
                           </button>
                        )}
                        {stage === 'Marcou Reunião' && (
                          <button onClick={() => updateStage(lead.id, 'Fechado')} className="flex-1 text-[10px] bg-emerald-50 text-emerald-700 py-1.5 rounded hover:bg-emerald-100 font-medium transition-colors">
                            Fechar
                          </button>
                        )}
                     </div>
                   </div>
                 )})}
               </div>
            </div>
          )})}
        </div>
      </div>

      <NewLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveLead} 
        initialData={leadToEdit}
      />

      {/* Modal de Eventos / Agenda */}
      <NewEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        clients={clients || []} 
        initialData={eventInitialData}
        onSave={(newEvent) => {
            if (setEvents && events) {
                setEvents([...events, newEvent]);
            }
            setIsEventModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProspectionView;

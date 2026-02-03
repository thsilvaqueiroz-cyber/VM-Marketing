
import React, { useState } from 'react';
import { Plus, Calendar, Pencil, CheckCircle2, Video, MapPin } from 'lucide-react';
import { AgendaEvent, Client } from '../types';
import Badge from '../components/Badge';
import NewEventModal from '../modals/NewEventModal';
import { getTodayLocal } from '../utils';
import { supabase } from '../services/supabase';

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
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const today = getTodayLocal();

  // Filtra apenas os pendentes para "sair da tela" os concluídos
  const activeEvents = events.filter(e => e.status !== 'Done');

  const sortedEvents = [...activeEvents].sort((a, b) => {
    return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime();
  });

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  };

  const groupedEvents: Record<string, AgendaEvent[]> = {};
  sortedEvents.forEach(e => {
    if (!groupedEvents[e.date]) groupedEvents[e.date] = [];
    groupedEvents[e.date].push(e);
  });

  const handleCompleteEvent = async (id: string) => {
    // Optimistic Update: Remove da tela imediatamente
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'Done' } : e));

    // Update Database
    await supabase.from('agenda_events').update({ status: 'Done' }).eq('id', id);
  };

  const handleEditEvent = (event: AgendaEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (savedEvent: AgendaEvent) => {
    setEvents(prev => {
        const exists = prev.find(e => e.id === savedEvent.id);
        if (exists) {
            return prev.map(e => e.id === savedEvent.id ? savedEvent : e);
        } else {
            return [...prev, savedEvent];
        }
    });
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
           <p className="text-slate-500">Compromissos e Reuniões Pendentes</p>
        </div>
        <button 
          onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
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
                <div key={event.id} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group">
                  <div className="flex flex-col items-center justify-center min-w-[80px] px-4 bg-slate-50 rounded-lg border border-slate-100 h-fit">
                    <span className="text-lg font-bold text-slate-800">{event.time}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-2">
                           <h4 className="font-bold text-slate-800">{event.title}</h4>
                           {event.modality === 'Online' ? (
                               <span title="Online / Meet" className="text-indigo-500 bg-indigo-50 p-1 rounded-md"><Video size={14}/></span>
                           ) : (
                               <span title="Presencial" className="text-orange-500 bg-orange-50 p-1 rounded-md"><MapPin size={14}/></span>
                           )}
                       </div>
                       <Badge color={event.type === 'Reunião' ? 'blue' : event.type === 'Visita' ? 'green' : 'gray'}>
                         {event.type}
                       </Badge>
                    </div>
                    {event.clientId && (
                      <p className="text-sm text-indigo-600 font-medium mt-1">
                        {clients.find(c => c.id === event.clientId)?.company || 'Cliente não encontrado'}
                      </p>
                    )}
                    {event.description && <p className="text-sm text-slate-500 mt-2 whitespace-pre-line">{event.description}</p>}
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex flex-col gap-2 justify-center border-l border-slate-100 pl-4 ml-2">
                    <button 
                        onClick={() => handleCompleteEvent(event.id)}
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                        title="Marcar como Realizado"
                    >
                        <CheckCircle2 size={18} /> 
                    </button>
                    <button 
                        onClick={() => handleEditEvent(event)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Editar Evento"
                    >
                        <Pencil size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {sortedEvents.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum evento pendente.</p>
          </div>
        )}
      </div>

      <NewEventModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingEvent(null); }} 
        onSave={handleSaveEvent}
        clients={clients}
        initialData={editingEvent || undefined}
      />
    </div>
  );
};

export default AgendaView;

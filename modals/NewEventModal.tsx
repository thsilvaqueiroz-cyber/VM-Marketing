
import React, { useState, useEffect } from 'react';
import { X, CalendarDays, Save, Video, MapPin } from 'lucide-react';
import { supabase } from '../services/supabase';
import { AgendaEvent, Client, EventType } from '../types';
import { mapEvent, getTodayLocal } from '../utils';

const NewEventModal = ({
  isOpen,
  onClose,
  onSave,
  clients,
  initialData
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  clients: Client[];
  initialData?: Partial<AgendaEvent>;
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    type: EventType;
    clientId: string;
    date: string;
    time: string;
    description: string;
    modality: 'Online' | 'Presencial';
  }>({
    title: '',
    type: 'Reunião',
    clientId: '',
    date: getTodayLocal(),
    time: '10:00',
    description: '',
    modality: 'Online'
  });

  useEffect(() => {
    if (initialData && initialData.title) {
        setFormData({
            title: initialData.title || '',
            type: initialData.type || 'Reunião',
            clientId: initialData.clientId || '',
            date: initialData.date || getTodayLocal(),
            time: initialData.time || '10:00',
            description: initialData.description || '',
            modality: initialData.modality || 'Online'
        });
    } else {
        // Reset when opening fresh or explicit new
        setFormData({ 
            title: '', 
            type: 'Reunião', 
            clientId: '', 
            date: getTodayLocal(), 
            time: '10:00', 
            description: '',
            modality: 'Online'
        });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.time) return;

    const payload = {
      title: formData.title,
      type: formData.type,
      client_id: formData.clientId || null,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      status: 'Pending',
      modality: formData.modality
    };

    let resultData = null;

    if (initialData?.id) {
        // UPDATE
        const { data, error } = await supabase
            .from('agenda_events')
            .update(payload)
            .eq('id', initialData.id)
            .select();
        
        if (error) { console.error(error); return; }
        resultData = data;
    } else {
        // INSERT
        const { data, error } = await supabase
            .from('agenda_events')
            .insert([payload])
            .select();

        if (error) { console.error(error); return; }
        resultData = data;
    }

    if (resultData && resultData[0]) {
      onSave(mapEvent(resultData[0]));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData?.id ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
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

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Modalidade</label>
             <div className="flex gap-3">
               <button
                 type="button"
                 onClick={() => setFormData({...formData, modality: 'Online'})}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${formData.modality === 'Online' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
               >
                 <Video size={16} /> Online / Meet
               </button>
               <button
                 type="button"
                 onClick={() => setFormData({...formData, modality: 'Presencial'})}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${formData.modality === 'Presencial' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
               >
                 <MapPin size={16} /> Presencial
               </button>
             </div>
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
            {initialData?.id ? <Save size={16} /> : <CalendarDays size={16} />} 
            {initialData?.id ? 'Salvar Alterações' : 'Agendar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewEventModal;

import React, { useState, useEffect } from 'react';
import { X, Plus, Clock, Save, Trash2, Layout, Globe, Instagram, MessageSquare, DollarSign, Briefcase } from 'lucide-react';
import { supabase } from '../services/supabase';
import { ProspectionLead, TimelineActivity } from '../types';
import { mapLead, formatDate } from '../utils';

const NewLeadModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialData 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (lead: ProspectionLead) => void;
  initialData: ProspectionLead | null;
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'timeline'>('info');
  const [formData, setFormData] = useState<{
    company: string;
    decisionMaker: string;
    phone: string;
    email: string;
    source: string;
    googleLink: string;
    instagramLink: string;
    proposalValue: string;
    timeline: TimelineActivity[];
  }>({
    company: '',
    decisionMaker: '',
    phone: '',
    email: '',
    source: '',
    googleLink: '',
    instagramLink: '',
    proposalValue: '',
    timeline: []
  });

  const [newActivity, setNewActivity] = useState({
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        decisionMaker: initialData.decisionMaker || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        source: initialData.source || '',
        googleLink: initialData.googleLink || '',
        instagramLink: initialData.instagramLink || '',
        proposalValue: initialData.proposalValue ? String(initialData.proposalValue) : '',
        timeline: initialData.timeline || []
      });
    } else {
      // Reset for new entry
      setFormData({
        company: '', decisionMaker: '', phone: '', email: '', source: '', googleLink: '', instagramLink: '', proposalValue: '', timeline: []
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddActivity = () => {
    if (!newActivity.note) return;
    const activity: TimelineActivity = {
      note: newActivity.note,
      date: newActivity.date,
      type: 'Note'
    };
    setFormData(prev => ({
      ...prev,
      timeline: [activity, ...prev.timeline]
    }));
    setNewActivity({ note: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleSave = async () => {
    if (!formData.company) return alert("Nome da empresa é obrigatório");

    const payload = {
      company: formData.company,
      decision_maker: formData.decisionMaker,
      phone: formData.phone,
      email: formData.email,
      source: formData.source,
      google_link: formData.googleLink,
      instagram_link: formData.instagramLink,
      proposal_value: parseFloat(formData.proposalValue) || 0,
      timeline: formData.timeline
    };

    let result;

    if (initialData?.id) {
      // Update
      const { data, error } = await supabase
        .from('prospection_leads')
        .update(payload)
        .eq('id', initialData.id)
        .select();
        
      if (error) { console.error(error); return alert("Erro ao atualizar"); }
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('prospection_leads')
        .insert([{ ...payload, stage: 'Prospectado' }])
        .select();

      if (error) { console.error(error); return alert("Erro ao criar"); }
      result = data;
    }

    if (result && result[0]) {
      onSave(mapLead(result[0]));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div>
             <h2 className="text-xl font-bold text-slate-800">
               {initialData ? 'Editar Lead' : 'Novo Lead'}
             </h2>
             <p className="text-sm text-slate-500">Gerencie as informações e o histórico do lead.</p>
          </div>
          <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nome da Empresa *</label>
              <div className="relative">
                <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800"
                  placeholder="Ex: Restaurante Sabor & Arte"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Decisor</label>
              <input 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                placeholder="Nome do responsável"
                value={formData.decisionMaker}
                onChange={e => setFormData({...formData, decisionMaker: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Telefone / WhatsApp</label>
              <input 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
              <input 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                placeholder="contato@empresa.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="h-px bg-slate-100 my-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div>
               <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Globe size={14}/> Links
               </h3>
               <div className="space-y-3">
                 <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder="Link do Google Maps/Site"
                      value={formData.googleLink}
                      onChange={e => setFormData({...formData, googleLink: e.target.value})}
                    />
                 </div>
                 <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder="Link do Instagram"
                      value={formData.instagramLink}
                      onChange={e => setFormData({...formData, instagramLink: e.target.value})}
                    />
                 </div>
               </div>
             </div>

             <div>
               <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Briefcase size={14} className="hidden"/> Comercial
               </h3>
               <div className="space-y-3">
                 <input 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="Origem (Ex: Indicação)"
                    value={formData.source}
                    onChange={e => setFormData({...formData, source: e.target.value})}
                  />
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input 
                      type="number"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder="Valor Proposta (0,00)"
                      value={formData.proposalValue}
                      onChange={e => setFormData({...formData, proposalValue: e.target.value})}
                    />
                  </div>
               </div>
             </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
             <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
               <Clock size={16} className="text-indigo-600"/> Linha do Tempo & Atividades
             </h3>
             
             {/* New Activity Input */}
             <div className="flex gap-2 mb-6">
               <input 
                 className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="Descreva a atividade realizada..."
                 value={newActivity.note}
                 onChange={e => setNewActivity({...newActivity, note: e.target.value})}
                 onKeyDown={e => e.key === 'Enter' && handleAddActivity()}
               />
               <input 
                 type="date"
                 className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 value={newActivity.date}
                 onChange={e => setNewActivity({...newActivity, date: e.target.value})}
               />
               <button 
                 onClick={handleAddActivity}
                 className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors flex items-center gap-2"
               >
                 <Plus size={16}/> Registrar
               </button>
             </div>

             {/* Timeline List */}
             <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
               {formData.timeline.length > 0 ? formData.timeline.map((item, idx) => (
                 <div key={idx} className="flex gap-3 relative">
                   {/* Line */}
                   {idx !== formData.timeline.length - 1 && (
                     <div className="absolute left-[11px] top-6 bottom-[-16px] w-0.5 bg-slate-200"></div>
                   )}
                   <div className="mt-1 h-6 w-6 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
                     <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                   </div>
                   <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-slate-700">{item.note}</p>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                          {formatDate(item.date)}
                        </span>
                      </div>
                   </div>
                 </div>
               )) : (
                 <div className="text-center py-4 text-slate-400 text-sm italic">
                   Nenhuma atividade registrada.
                 </div>
               )}
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <Save size={18} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewLeadModal;
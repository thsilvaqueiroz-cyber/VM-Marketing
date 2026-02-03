
import React, { useState } from 'react';
import { X, CheckSquare, Square, Save } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Client, ServiceType } from '../types';
import { mapClient } from '../utils';

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

export default NewClientModal;

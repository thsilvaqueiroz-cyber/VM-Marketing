
import React, { useState } from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

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

export default SetupScreen;

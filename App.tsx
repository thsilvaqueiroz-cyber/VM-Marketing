
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Target, 
  User, 
  TrendingUp, 
  Loader2,
  CalendarDays,
  Menu,
  X
} from 'lucide-react';
import { supabase } from './services/supabase';
import { Client, Transaction, Demand, AgendaEvent, ProspectionLead } from './types';
import { mapClient, mapTransaction, mapDemand, mapEvent, mapLead } from './utils';

import SaoPauloClock from './components/SaoPauloClock';
import SetupScreen from './components/SetupScreen';

import DashboardView from './views/DashboardView';
import ProspectionView from './views/ProspectionView';
import ClientsView from './views/ClientsView';
import AgendaView from './views/AgendaView';
import FinancialView from './views/FinancialView';

const App = () => {
  const [view, setView] = useState<'dashboard' | 'clients' | 'finance' | 'agenda' | 'prospection'>('prospection');
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [leads, setLeads] = useState<ProspectionLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!supabase) {
    return <SetupScreen />;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: clientsData } = await supabase.from('clients').select('*');
      const { data: transactionsData } = await supabase.from('transactions').select('*');
      const { data: demandsData } = await supabase.from('demands').select('*');
      const { data: eventsData } = await supabase.from('agenda_events').select('*');
      const { data: leadsData } = await supabase.from('prospection_leads').select('*');

      if (clientsData) setClients(clientsData.map(mapClient));
      if (transactionsData) setTransactions(transactionsData.map(mapTransaction));
      if (demandsData) setDemands(demandsData.map(mapDemand));
      if (eventsData) setEvents(eventsData.map(mapEvent));
      if (leadsData) setLeads(leadsData.map(mapLead));
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const toggleDemand = async (id: string) => {
    const currentDemand = demands.find(d => d.id === id);
    if (!currentDemand) return;
    
    const newStatus = currentDemand.status === 'Pending' ? 'Done' : 'Pending';

    setDemands(demands.map(d => d.id === id ? { ...d, status: newStatus } : d));

    await supabase.from('demands').update({ status: newStatus }).eq('id', id);
  };

  const handleNavClick = (viewName: 'dashboard' | 'clients' | 'finance' | 'agenda' | 'prospection') => {
    setView(viewName);
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
           <Loader2 size={40} className="animate-spin" />
           <p className="font-medium text-slate-500">Carregando CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside className={`
          w-64 bg-white border-r border-slate-200 flex flex-col 
          fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-700">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-xl font-bold tracking-tight">VM Marketing</span>
          </div>
          {/* Close Button Mobile */}
          <button 
             onClick={() => setIsMobileMenuOpen(false)}
             className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Real-time Clock */}
        <SaoPauloClock />

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} /> Visão Geral
          </button>
          <button 
            onClick={() => handleNavClick('prospection')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'prospection' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Target size={18} /> Prospecção
          </button>
          <button 
            onClick={() => handleNavClick('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'clients' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users size={18} /> Clientes
          </button>
          <button 
            onClick={() => handleNavClick('agenda')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'agenda' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <CalendarDays size={18} /> Agenda
          </button>
          <button 
            onClick={() => handleNavClick('finance')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'finance' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Wallet size={18} /> Financeiro
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-100 mt-auto">
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

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 z-20 sticky top-0">
           <div className="flex items-center gap-2 text-indigo-700">
              <div className="bg-indigo-600 text-white p-1 rounded-lg"><TrendingUp size={16} /></div>
              <span className="font-bold tracking-tight">VM Marketing</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 p-2 bg-slate-50 rounded-lg active:bg-slate-100">
             <Menu size={24} />
           </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {view === 'dashboard' && <DashboardView clients={clients} transactions={transactions} demands={demands} events={events} leads={leads} onToggleDemand={toggleDemand}/>}
          {view === 'prospection' && (
            <ProspectionView 
              leads={leads} 
              setLeads={setLeads} 
              events={events} 
              setEvents={setEvents} 
              clients={clients} 
            />
          )}
          {view === 'clients' && <ClientsView clients={clients} setClients={setClients} demands={demands} setDemands={setDemands}/>}
          {view === 'agenda' && <AgendaView events={events} setEvents={setEvents} clients={clients}/>}
          {view === 'finance' && <FinancialView clients={clients} transactions={transactions} setTransactions={setTransactions}/>}
        </main>
      </div>
    </div>
  );
};

export default App;

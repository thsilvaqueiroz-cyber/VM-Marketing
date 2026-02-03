
import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Clock, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Client, Transaction, RecurrenceType } from '../types';
import { formatCurrency, formatDate, getDaysOverdue, mapTransaction, getTodayLocal } from '../utils';
import Badge from '../components/Badge';

const FinancialView = ({ 
  clients, 
  transactions, 
  setTransactions 
}: { 
  clients: Client[], 
  transactions: Transaction[], 
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>> 
}) => {
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState<{
    type: 'Receivable' | 'Payable';
    description: string;
    amount: string;
    dueDate: string;
    clientId: string;
    recurrence: RecurrenceType;
    installmentsTotal: string;
  }>({
    type: 'Receivable',
    description: '',
    amount: '',
    dueDate: getTodayLocal(),
    clientId: '',
    recurrence: 'One-time',
    installmentsTotal: ''
  });

  const toggleStatus = async (id: string) => {
    // Find current status
    const currentTx = transactions.find(t => t.id === id);
    if (!currentTx) return;
    
    const newStatus = currentTx.status === 'Paid' ? 'Pending' : 'Paid';

    // Optimistic
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ));

    // DB
    await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
  };

  const openNewTransactionModal = () => {
    setEditingId(null);
    setNewTransaction({
      type: 'Receivable',
      description: '',
      amount: '',
      dueDate: getTodayLocal(),
      clientId: '',
      recurrence: 'One-time',
      installmentsTotal: ''
    });
    setIsModalOpen(true);
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingId(t.id);
    setNewTransaction({
      type: t.type,
      description: t.description,
      amount: t.amount.toString(),
      dueDate: t.dueDate,
      clientId: t.clientId || '',
      recurrence: t.recurrence,
      installmentsTotal: t.installmentsTotal ? t.installmentsTotal.toString() : ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    // Optimistic
    setTransactions(prev => prev.filter(t => t.id !== id));

    // DB
    await supabase.from('transactions').delete().eq('id', id);
  };

  const handleSaveTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.dueDate) return;

    const payload = {
      type: newTransaction.type,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      due_date: newTransaction.dueDate,
      client_id: newTransaction.type === 'Receivable' ? (newTransaction.clientId || null) : null,
      recurrence: newTransaction.recurrence,
      installments_total: newTransaction.recurrence === 'Installments' && newTransaction.installmentsTotal ? parseInt(newTransaction.installmentsTotal) : null
    };

    if (editingId) {
      // Update existing
      const { error } = await supabase.from('transactions').update(payload).eq('id', editingId);

      if (error) {
        console.error(error);
        return;
      }

      setTransactions(prev => prev.map(t => t.id === editingId ? {
        ...t,
        type: newTransaction.type,
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        dueDate: newTransaction.dueDate,
        clientId: newTransaction.type === 'Receivable' ? (newTransaction.clientId || undefined) : undefined,
        recurrence: newTransaction.recurrence,
        installmentsTotal: payload.installments_total || undefined
      } : t));

    } else {
      // Create new
      const { data, error } = await supabase.from('transactions').insert([{
        ...payload,
        status: 'Pending',
      }]).select();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setTransactions([...transactions, mapTransaction(data[0])]);
      }
    }
    
    setIsModalOpen(false);
  };

  const filteredTransactions = transactions
    .filter(t => t.type === (activeTab === 'receivable' ? 'Receivable' : 'Payable'))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const forecast = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.status === 'Pending')
      .forEach(t => {
        if (!groups[t.dueDate]) groups[t.dueDate] = 0;
        groups[t.dueDate] += t.amount;
      });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredTransactions]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financeiro</h1>
          <p className="text-slate-500">Fluxo de Caixa e Previsões</p>
        </div>
        <button 
          onClick={openNewTransactionModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('receivable')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'receivable' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Contas a Receber
            </button>
            <button 
              onClick={() => setActiveTab('payable')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'payable' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Contas a Pagar
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Descrição / Cliente</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Vencimento</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map(t => {
                    const daysOverdue = getDaysOverdue(t.dueDate);
                    const isOverdue = t.status === 'Pending' && daysOverdue > 0;
                    const client = clients.find(c => c.id === t.clientId);
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{client ? client.company : t.description}</p>
                          <div className="flex items-center gap-2">
                             {client && <span className="text-xs text-slate-500">{t.description}</span>}
                             {t.recurrence === 'Fixed' && (
                               <span className="flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200" title="Recorrência Fixa">
                                 <Calendar size={10} /> Fixa
                               </span>
                             )}
                             {t.recurrence === 'Installments' && t.installmentsTotal && (
                               <span className="flex items-center gap-0.5 text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100" title={`Parcelado em ${t.installmentsTotal}x`}>
                                 <Clock size={10} /> {t.installmentsTotal}x
                               </span>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                            {formatDate(t.dueDate)}
                            {isOverdue && (
                               <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                                 {daysOverdue}d atraso
                               </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4">
                           {t.status === 'Paid' ? (
                             <Badge color="green">Pago</Badge>
                           ) : isOverdue ? (
                             <Badge color="red">Pendente</Badge>
                           ) : (
                             <Badge color="blue">Aberto</Badge>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => toggleStatus(t.id)}
                              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                                t.status === 'Paid' 
                                  ? 'border-slate-200 text-slate-500 hover:bg-slate-50' 
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-medium'
                              }`}
                            >
                              {t.status === 'Paid' ? 'Desfazer' : 'Dar Baixa'}
                            </button>
                            <button 
                              onClick={() => handleEditTransaction(t)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                Nenhuma transação encontrada.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === 'receivable' ? 'Previsão de Entrada' : 'Previsão de Saída'}
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              {activeTab === 'receivable' ? 'Valores a entrar nos próximos dias.' : 'Valores a pagar nos próximos dias.'}
            </p>
            
            <div className="space-y-4">
              {forecast.length > 0 ? forecast.map(([date, amount]) => (
                <div key={date} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${activeTab === 'receivable' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-medium">{formatDate(date)}</span>
                  </div>
                  <span className={`font-bold ${activeTab === 'receivable' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(amount)}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-slate-500 italic">Sem previsões pendentes.</p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 text-sm">Total Previsto</span>
                <span className="text-2xl font-bold">{formatCurrency(forecast.reduce((a, b) => a + b[1], 0))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Transação' : 'Nova Transação'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'Receivable' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    newTransaction.type === 'Receivable' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'Payable' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    newTransaction.type === 'Payable' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Despesa
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Ex: Mensalidade Cliente X"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      placeholder="0,00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                    <input
                      type="date"
                      value={newTransaction.dueDate}
                      onChange={(e) => setNewTransaction({ ...newTransaction, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Periodicidade / Tipo</label>
                <select
                  value={newTransaction.recurrence}
                  onChange={(e) => setNewTransaction({ ...newTransaction, recurrence: e.target.value as RecurrenceType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="One-time">Pontual (Uma única vez)</option>
                  <option value="Fixed">Fixa (Mensal Recorrente)</option>
                  <option value="Installments">Parcelada / Temporária</option>
                </select>
              </div>

              {newTransaction.recurrence === 'Installments' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade de Meses/Parcelas</label>
                  <input
                    type="number"
                    value={newTransaction.installmentsTotal}
                    onChange={(e) => setNewTransaction({ ...newTransaction, installmentsTotal: e.target.value })}
                    placeholder="Ex: 6"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              )}

              {newTransaction.type === 'Receivable' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label>
                  <select
                    value={newTransaction.clientId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.company}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveTransaction}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                {editingId ? 'Atualizar Transação' : 'Salvar Transação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialView;

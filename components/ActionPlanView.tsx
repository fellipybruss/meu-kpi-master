
import React, { useState, useEffect } from 'react';
import { ActionPlan, Indicator } from '../types';
import { 
  Plus, ClipboardCheck, Calendar, User, Info, 
  Trash2, Edit2, CheckCircle2, X, Clock, 
  Activity, AlertTriangle 
} from 'lucide-react';

interface ActionPlanViewProps {
  plans: ActionPlan[];
  indicators: Indicator[];
  onAddPlan: (plan: ActionPlan) => void;
  onUpdatePlan: (plan: ActionPlan) => void;
  onDeletePlan: (id: string) => void;
  preSelectedIndicatorId?: string;
}

const ActionPlanView: React.FC<ActionPlanViewProps> = ({ 
  plans, 
  indicators, 
  onAddPlan, 
  onUpdatePlan, 
  onDeletePlan, 
  preSelectedIndicatorId 
}) => {
  const [showForm, setShowForm] = useState(!!preSelectedIndicatorId);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ActionPlan>>({
    indicatorId: preSelectedIndicatorId || '',
    description: '',
    rootCause: '',
    responsible: '',
    deadline: '',
    status: 'Pendente'
  });

  // Atualiza o formulário quando um indicador é pré-selecionado do dashboard
  useEffect(() => {
    if (preSelectedIndicatorId) {
      setFormData(prev => ({ ...prev, indicatorId: preSelectedIndicatorId }));
      setShowForm(true);
      setEditingPlanId(null);
    }
  }, [preSelectedIndicatorId]);

  const handleEdit = (plan: ActionPlan) => {
    setFormData({
      indicatorId: plan.indicatorId,
      description: plan.description,
      rootCause: plan.rootCause,
      responsible: plan.responsible,
      deadline: plan.deadline,
      status: plan.status
    });
    setEditingPlanId(plan.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlanId(null);
    setFormData({ 
      indicatorId: '', 
      description: '', 
      rootCause: '', 
      responsible: '', 
      deadline: '', 
      status: 'Pendente' 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const indicator = indicators.find(i => i.id === formData.indicatorId);
    if (!indicator) return;

    if (editingPlanId) {
      const updatedPlan: ActionPlan = {
        ...formData as ActionPlan,
        id: editingPlanId,
        indicatorName: indicator.name,
        createdAt: plans.find(p => p.id === editingPlanId)?.createdAt || new Date().toISOString()
      };
      onUpdatePlan(updatedPlan);
    } else {
      const newPlan: ActionPlan = {
        ...formData as ActionPlan,
        id: Math.random().toString(36).substr(2, 9),
        indicatorName: indicator.name,
        createdAt: new Date().toISOString(),
        status: 'Pendente'
      };
      onAddPlan(newPlan);
    }

    handleCancel();
  };

  const getStatusBadge = (status: ActionPlan['status']) => {
    switch (status) {
      case 'Concluído':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> CONCLUÍDO
          </span>
        );
      case 'Em Andamento':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200">
            <Activity size={12} /> EM ANDAMENTO
          </span>
        );
      case 'Atrasado':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
            <AlertTriangle size={12} /> ATRASADO
          </span>
        );
      case 'Pendente':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> PENDENTE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Gerenciamento de Planos de Ação</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> Novo Plano
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="text-blue-600" /> 
              {editingPlanId ? 'Editar Plano de Ação' : 'Registrar Nova Ação Corretiva'}
            </h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Indicador Vinculado</label>
              <select 
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400 font-medium"
                value={formData.indicatorId}
                onChange={e => setFormData({...formData, indicatorId: e.target.value})}
                disabled={!!editingPlanId}
              >
                <option value="">Selecione o indicador...</option>
                {indicators.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.index} - {ind.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status da Ação</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="Pendente">🕒 Pendente</option>
                <option value="Em Andamento">⚙️ Em Andamento</option>
                <option value="Concluído">✅ Concluído</option>
                <option value="Atrasado">⚠️ Atrasado</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Causa Raiz (Por que o desvio ocorreu?)</label>
              <input 
                type="text" required
                placeholder="Ex: Falta de treinamento da equipe noturna"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.rootCause}
                onChange={e => setFormData({...formData, rootCause: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Descrição da Ação (O que será feito?)</label>
              <textarea 
                required
                rows={2}
                placeholder="Descreva detalhadamente a ação corretiva..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Responsável</label>
              <input 
                type="text" required
                placeholder="Nome do colaborador"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.responsible}
                onChange={e => setFormData({...formData, responsible: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Prazo Final</label>
              <input 
                type="date" required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Descartar
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                {editingPlanId ? 'Atualizar Plano' : 'Salvar Plano de Ação'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {plans.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
            <Info className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Nenhum plano de ação registrado ainda.</p>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 block">INDICADOR: {plan.indicatorName}</span>
                  <h4 className="text-lg font-bold text-slate-800 leading-tight">{plan.description}</h4>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {getStatusBadge(plan.status)}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(plan)} 
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDeletePlan(plan.id)} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px] bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-start gap-2.5 text-slate-600">
                  <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-black text-slate-500 uppercase text-[9px] block mb-0.5 tracking-wider">Causa Raiz</span>
                    <p className="font-medium">{plan.rootCause}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-slate-600">
                  <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-black text-slate-500 uppercase text-[9px] block mb-0.5 tracking-wider">Responsável</span>
                    <p className="font-medium">{plan.responsible}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-slate-600">
                  <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-black text-slate-500 uppercase text-[9px] block mb-0.5 tracking-wider">Prazo Final</span>
                    <p className="font-medium">{new Date(plan.deadline).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionPlanView;

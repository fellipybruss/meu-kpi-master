
import React, { useState, useEffect } from 'react';
import { Indicator, IndicatorUnit, GoalFormat } from '../types';
import { Save, X } from 'lucide-react';

interface IndicatorFormProps {
  onSave: (indicator: Indicator) => void;
  onCancel: () => void;
  initialData?: Indicator;
}

const IndicatorForm: React.FC<IndicatorFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<Indicator>>({
    index: '',
    name: '',
    numeratorLabel: '',
    denominatorLabel: '',
    period: '6 MESES',
    unit: IndicatorUnit.PERCENTAGE,
    goal: 0,
    goalFormat: GoalFormat.HIGHER_BETTER,
    data: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.index) return;
    
    onSave({
      ...formData,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      data: initialData?.data || []
    } as Indicator);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">
          {initialData ? `Editando: ${initialData.name}` : 'Configuração de Novo Indicador'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Índice / Código</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: 01"
              value={formData.index}
              onChange={e => setFormData({ ...formData, index: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nome do Indicador</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Taxa de Adesão..."
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Numerador (Descrição)</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Total de fichas preenchidas"
              value={formData.numeratorLabel}
              onChange={e => setFormData({ ...formData, numeratorLabel: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Denominador (Descrição)</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Total de pacientes elegíveis"
              value={formData.denominatorLabel}
              onChange={e => setFormData({ ...formData, denominatorLabel: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Meta</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-blue-700"
              value={formData.goal}
              onChange={e => setFormData({ ...formData, goal: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Formato da Meta</label>
            <select
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.goalFormat}
              onChange={e => setFormData({ ...formData, goalFormat: e.target.value as GoalFormat })}
            >
              <option value={GoalFormat.HIGHER_BETTER}>{GoalFormat.HIGHER_BETTER}</option>
              <option value={GoalFormat.LOWER_BETTER}>{GoalFormat.LOWER_BETTER}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Unidade de Medida</label>
            <select
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value as IndicatorUnit })}
            >
              <option value={IndicatorUnit.PERCENTAGE}>PERCENTUAL</option>
              <option value={IndicatorUnit.DAY}>DIA</option>
              <option value={IndicatorUnit.MINUTES}>MINUTOS</option>
              <option value={IndicatorUnit.HOURS}>HORAS</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Período Referência</label>
            <select
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.period}
              onChange={e => setFormData({ ...formData, period: e.target.value })}
            >
              <option value="BASELINE">BASELINE</option>
              <option value="6 MESES">6 MESES</option>
              <option value="12 MESES">12 MESES</option>
              <option value="18 MESES">18 MESES</option>
              <option value="24 MESES">24 MESES</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-lg shadow-blue-200 font-bold"
          >
            <Save size={18} />
            {initialData ? 'Atualizar Indicador' : 'Salvar Indicador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IndicatorForm;

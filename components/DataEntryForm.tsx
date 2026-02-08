
import React, { useState, useEffect, useMemo } from 'react';
import { Indicator, MonthlyData } from '../types';
import { MONTHS } from '../constants';
// Added missing Database icon to the imports
import { Calendar, Hash, Calculator, Send, CheckCircle2, Database } from 'lucide-react';

interface DataEntryFormProps {
  indicators: Indicator[];
  onAddData: (indicatorId: string, entry: MonthlyData) => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ indicators, onAddData }) => {
  const [selectedIndicatorId, setSelectedIndicatorId] = useState(indicators[0]?.id || '');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(2026);
  
  const [numValue, setNumValue] = useState<string>('');
  const [denValue, setDenValue] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedIndicator = indicators.find(i => i.id === selectedIndicatorId);

  useEffect(() => {
    setNumValue('');
    setDenValue('');
  }, [selectedIndicatorId]);

  const estimatedResult = useMemo(() => {
    const n = parseFloat(numValue) || 0;
    const d = parseFloat(denValue) || 0;
    if (d === 0) return '0.0';
    const res = (n / d) * (selectedIndicator?.unit === 'PERCENTUAL' ? 100 : 1);
    return res.toFixed(1);
  }, [numValue, denValue, selectedIndicator]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIndicator) return;

    const n = parseFloat(numValue) || 0;
    const d = parseFloat(denValue) || 0;

    if (d === 0) {
      alert('O denominador não pode ser zero.');
      return;
    }

    const result = (n / d) * (selectedIndicator.unit === 'PERCENTUAL' ? 100 : 1);
    
    onAddData(selectedIndicatorId, {
      id: Math.random().toString(36).substr(2, 9),
      month,
      year,
      numeratorValue: n,
      denominatorValue: d,
      result: Number(result.toFixed(2))
    });

    setNumValue('');
    setDenValue('');
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">Lançamento de Dados Mensais</h2>
        <p className="text-slate-500 text-sm font-medium">Os dados inseridos são persistidos automaticamente no banco de dados local.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {showSuccess && (
          <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} />
              <div>
                <p className="font-black text-sm uppercase">Dados Registrados!</p>
                <p className="text-xs text-emerald-100">O indicador foi atualizado e salvo localmente com sucesso.</p>
              </div>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-white/60 hover:text-white">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Hash size={12} className="text-blue-600" />
              Indicador
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold bg-white text-black shadow-sm appearance-none"
              value={selectedIndicatorId}
              onChange={e => setSelectedIndicatorId(e.target.value)}
            >
              {indicators.map(ind => (
                <option key={ind.id} value={ind.id}>
                  {ind.index} - {ind.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} className="text-blue-600" />
                Referência
              </label>
              <select
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold bg-white text-black shadow-sm"
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ano</label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold bg-white text-black shadow-sm"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {selectedIndicator && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <Database size={120} />
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-tighter block mb-1">
                  Numerador: <span className="text-slate-400 lowercase font-medium">{selectedIndicator.numeratorLabel}</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none shadow-sm text-black font-black text-2xl"
                  value={numValue}
                  onChange={e => setNumValue(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-tighter block mb-1">
                  Denominador: <span className="text-slate-400 lowercase font-medium">{selectedIndicator.denominatorLabel}</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none shadow-sm text-black font-black text-2xl"
                  value={denValue}
                  onChange={e => setDenValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-inner">
          <div className="flex items-center gap-6">
            <Calculator size={40} className="text-slate-300" />
            <div className="text-center">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Resultado Projetado</span>
              <p className="text-5xl font-black text-slate-900 tracking-tighter">
                {estimatedResult}<span className="text-2xl text-slate-400 ml-1">{selectedIndicator?.unit === 'PERCENTUAL' ? '%' : ''}</span>
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
        >
          <Send size={20} />
          Salvar Dados Permanente
        </button>
      </form>
    </div>
  );
};

export default DataEntryForm;

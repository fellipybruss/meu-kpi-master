
import React, { useMemo, useState } from 'react';
import { Indicator, GoalFormat, IndicatorUnit } from '../types';
import { 
  LineChart, Line, ResponsiveContainer, 
  Tooltip, Cell, ComposedChart, Area, Bar, CartesianGrid, XAxis, YAxis
} from 'recharts';
import { 
  ChevronDown, ArrowDown, ArrowUp, 
  ClipboardPlus, Sparkles, Edit2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { analyzeIndicator } from '../services/geminiService';
import { MONTHS } from '../constants';

interface DashboardProps {
  indicators: Indicator[];
  onNavigateToPlan: (indicatorId: string) => void;
  onEditIndicator: (indicator: Indicator) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ indicators, onNavigateToPlan, onEditIndicator }) => {
  const [selectedId, setSelectedId] = useState<string>(indicators[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [analysis, setAnalysis] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const indicator = useMemo(() => 
    indicators.find(i => i.id === selectedId) || indicators[0]
  , [selectedId, indicators]);

  const unitSymbol = useMemo(() => {
    if (!indicator) return '';
    switch (indicator.unit) {
      case IndicatorUnit.PERCENTAGE: return '%';
      case IndicatorUnit.DAY: return ' d';
      case IndicatorUnit.MINUTES: return ' min';
      case IndicatorUnit.HOURS: return ' h';
      default: return '';
    }
  }, [indicator]);

  const chartData = useMemo(() => {
    if (!indicator) return [];
    return MONTHS.map((name, index) => {
      const monthNum = index + 1;
      const dataPoint = indicator.data.find(d => d.month === monthNum && d.year === selectedYear);
      const realizado = dataPoint ? dataPoint.result : 0;
      const meta = indicator.goal;
      
      // Cálculo do alcance (%)
      let alcance = 0;
      if (meta > 0) {
        if (indicator.goalFormat === GoalFormat.HIGHER_BETTER) {
          alcance = (realizado / meta) * 100;
        } else {
          // Para Menor-Melhor: se realizado <= meta, alcance é 100% ou mais
          alcance = realizado <= meta ? 100 : (meta / realizado) * 100;
        }
      }

      const hitGoal = indicator.goalFormat === GoalFormat.HIGHER_BETTER 
        ? realizado >= meta 
        : realizado <= meta;

      return {
        name,
        shortName: name.substring(0, 3).toLowerCase(),
        realizado,
        meta,
        numerator: dataPoint ? dataPoint.numeratorValue : 0,
        denominator: dataPoint ? dataPoint.denominatorValue : 0,
        alcance: Number(alcance.toFixed(1)),
        hitGoal,
        hasData: !!dataPoint
      };
    });
  }, [indicator, selectedYear]);

  const totals = useMemo(() => {
    const sumNum = chartData.reduce((acc, curr) => acc + curr.numerator, 0);
    const sumDen = chartData.reduce((acc, curr) => acc + curr.denominator, 0);
    const avgRealizado = sumDen === 0 ? 0 : (sumNum / sumDen) * (indicator?.unit === IndicatorUnit.PERCENTAGE ? 100 : 1);
    return { sumNum, sumDen, avgRealizado };
  }, [chartData, indicator]);

  const isAboveMeta = useMemo(() => {
    const lastWithData = [...chartData].reverse().find(d => d.hasData);
    if (!lastWithData) return false;
    return lastWithData.hitGoal;
  }, [chartData]);

  const handleAnalyze = async () => {
    if (!indicator) return;
    setAnalyzing(indicator.id);
    const result = await analyzeIndicator(indicator);
    setAnalysis(prev => ({ ...prev, [indicator.id]: result }));
    setAnalyzing(null);
  };

  if (!indicator) return <div className="p-8 text-center text-slate-500">Nenhum indicador cadastrado.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Filtros Superiores */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[250px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Indicador em Foco</label>
          <div className="relative">
            <select 
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {indicators.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.index} - {ind.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="w-32">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ano Base</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 outline-none"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button 
            onClick={handleAnalyze}
            disabled={analyzing === indicator.id}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 uppercase tracking-wide"
          >
            <Sparkles size={16} />
            {analyzing === indicator.id ? 'Analisando...' : 'AI Insights'}
          </button>
          
          <button 
            onClick={() => onEditIndicator(indicator)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-black hover:bg-slate-900 transition-all uppercase tracking-wide"
          >
            <Edit2 size={16} />
            Editar KPI
          </button>
        </div>
      </div>

      {/* Grid de KPIs Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Atual</span>
          <div className="flex items-center gap-2">
             <div className={`w-3 h-3 rounded-full ${isAboveMeta ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}></div>
             <span className={`text-sm font-black uppercase ${isAboveMeta ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isAboveMeta ? 'Meta Atingida' : 'Abaixo da Meta'}
             </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Formato</span>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            {indicator.goalFormat === GoalFormat.LOWER_BETTER ? <ArrowDown size={14} className="text-blue-500" /> : <ArrowUp size={14} className="text-emerald-500" />}
            {indicator.goalFormat}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Meta Definida</span>
          <span className="text-xl font-black text-blue-900">{indicator.goal}{unitSymbol}</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-xl shadow-lg flex flex-col items-center justify-center text-white">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média do Ano</span>
          <span className="text-xl font-black text-white">{totals.avgRealizado.toFixed(2)}{unitSymbol}</span>
        </div>
      </div>

      {/* Gráfico e Memória */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#0f172a] text-white text-[10px] font-black py-2.5 px-4 uppercase tracking-[0.2em] text-center border-b border-slate-800">
            Comportamento Mensal da Performance
          </div>
          <div className="p-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shortName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(v: any) => `${v}${unitSymbol}`} />
                <Bar dataKey="realizado" barSize={35} radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={!entry.hasData ? '#f1f5f9' : (entry.hitGoal ? '#0f172a' : '#ef4444')} />
                  ))}
                </Bar>
                <Area type="monotone" dataKey="meta" stroke="#b5a642" fill="#b5a642" fillOpacity={0.05} strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#0f172a] text-white text-[10px] font-black py-2.5 px-4 uppercase tracking-[0.2em] text-center border-b border-slate-800">
            Resumo Acumulado
          </div>
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total {indicator.numeratorLabel}</p>
              <p className="text-2xl font-black text-slate-800">{totals.sumNum.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total {indicator.denominatorLabel}</p>
              <p className="text-2xl font-black text-slate-800">{totals.sumDen.toLocaleString('pt-BR')}</p>
            </div>
            {!isAboveMeta && (
               <button 
                  onClick={() => onNavigateToPlan(indicator.id)}
                  className="w-full py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
               >
                  <AlertCircle size={16} /> Abrir Plano de Ação
               </button>
            )}
          </div>
        </div>
      </div>

      {/* TABELA DETALHADA MÊS A MÊS - SOLICITAÇÃO DO USUÁRIO */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-[#0f172a] text-white text-[10px] font-black py-2.5 px-4 uppercase tracking-[0.2em] text-center border-b border-slate-800">
          Tabela de Performance Mensal Detalhada
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mês</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{indicator.numeratorLabel}</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{indicator.denominatorLabel}</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultado</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Alcance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartData.map((row, idx) => (
                <tr key={idx} className={`${row.hasData ? 'bg-white' : 'bg-slate-50/30 opacity-60'} hover:bg-blue-50/30 transition-colors`}>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{row.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">{row.hasData ? row.numerator.toLocaleString('pt-BR') : '-'}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">{row.hasData ? row.denominator.toLocaleString('pt-BR') : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-black ${!row.hasData ? 'text-slate-400' : (row.hitGoal ? 'text-emerald-600' : 'text-rose-600')}`}>
                      {row.hasData ? `${row.realizado}${unitSymbol}` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">{indicator.goal}{unitSymbol}</td>
                  <td className="px-6 py-4 text-center">
                    {row.hasData ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                           <div 
                              className={`h-full rounded-full ${row.hitGoal ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                              style={{ width: `${Math.min(row.alcance, 100)}%` }}
                           ></div>
                        </div>
                        <span className={`text-[10px] font-black ${row.hitGoal ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {row.alcance}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis View */}
      {analysis[indicator.id] && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl flex items-start gap-4 shadow-sm animate-in slide-in-from-bottom-2">
          <Sparkles size={24} className="text-indigo-600 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Análise de Tendência IA</h4>
            <p className="text-sm text-indigo-800 italic leading-relaxed font-medium">
              "{analysis[indicator.id]}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


import React, { useState } from 'react';
import { Indicator } from '../types';
import { 
  Database, Save, FileUp, Github, Key, 
  Link as LinkIcon, Sparkles, Loader2, CheckCircle, 
  Trash2, Globe, Lock, ShieldCheck, AlertCircle
} from 'lucide-react';
import { parsePastedData } from '../services/geminiService';
import { GitHubConfig, createInitialGist } from '../services/storageService';

interface DataImportViewProps {
  indicators: Indicator[];
  onImport: (indicators: Indicator[]) => void;
  githubConfig: GitHubConfig | null;
  onUpdateGithubConfig: (config: GitHubConfig | null) => void;
}

const DataImportView: React.FC<DataImportViewProps> = ({ indicators, onImport, githubConfig, onUpdateGithubConfig }) => {
  const [loading, setLoading] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [token, setToken] = useState('');
  const [gistId, setGistId] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleConnectGithub = async () => {
    if (!token) {
      setStatus({ type: 'error', message: 'Por favor, insira o Personal Access Token.' });
      return;
    }

    setLoading(true);
    try {
      if (!gistId) {
        // Criar novo banco de dados se não houver Gist ID
        const newGist = await createInitialGist(token);
        onUpdateGithubConfig({ token, gistId: newGist.id });
        setStatus({ type: 'success', message: 'Banco de dados criado e conectado no GitHub!' });
      } else {
        // Conectar a um Gist existente
        onUpdateGithubConfig({ token, gistId });
        setStatus({ type: 'success', message: 'Conectado ao banco de dados existente com sucesso!' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Deseja desconectar da nuvem? Os dados continuarão salvos apenas localmente.')) {
      onUpdateGithubConfig(null);
      setToken('');
      setGistId('');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* SEÇÃO GITHUB CLOUD DATABASE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Globe size={120} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <Github size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">GitHub Cloud Database</h3>
              <p className="text-slate-400 text-sm">Transforme o GitHub em seu banco de dados online gratuito.</p>
            </div>
          </div>
          
          {githubConfig ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-400" />
                <div>
                  <p className="text-xs font-black uppercase text-emerald-400">Status: Conectado e Seguro</p>
                  <p className="text-[10px] text-slate-400 font-mono">Gist ID: {githubConfig.gistId}</p>
                </div>
              </div>
              <button onClick={handleDisconnect} className="p-2 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 size={20} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 p-3 rounded-xl">
              <Lock size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Modo Offline - Seus dados podem ser perdidos</span>
            </div>
          )}
        </div>

        {!githubConfig && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} /> Personal Access Token (classic)
                </label>
                <input 
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono text-sm"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                />
                <p className="text-[10px] text-slate-400">Crie um token com permissão 'gist' no GitHub Settings.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon size={14} /> Gist ID (Opcional)
                </label>
                <input 
                  type="text"
                  placeholder="ID de um banco já existente"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono text-sm"
                  value={gistId}
                  onChange={e => setGistId(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleConnectGithub}
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
              {gistId ? 'CONECTAR AO BANCO EXISTENTE' : 'CRIAR NOVO BANCO NA NUVEM'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Smart Paste (IA) */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Copia e Cola IA</h3>
            </div>
            <textarea 
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
              placeholder="Cole dados aqui..."
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
            />
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700">Processar IA</button>
          </div>

          {/* Backup Manual */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-center text-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
               <Database size={20} className="text-blue-600" /> Backup Local
            </h3>
            <p className="text-xs text-slate-500">Sempre baixe uma cópia física dos seus dados por segurança.</p>
            <div className="grid grid-cols-2 gap-3">
               <button className="py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200">Exportar JSON</button>
               <button className="py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200">Importar JSON</button>
            </div>
          </div>
      </div>

      {/* Added AlertCircle to imports above to fix "Cannot find name 'AlertCircle'" */}
      {status && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-bounce ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
          {status.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <p className="font-black text-xs uppercase tracking-tight">{status.message}</p>
        </div>
      )}
    </div>
  );
};

export default DataImportView;

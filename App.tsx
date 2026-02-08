
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import IndicatorForm from './components/IndicatorForm';
import DataEntryForm from './components/DataEntryForm';
import ActionPlanView from './components/ActionPlanView';
import DataImportView from './components/DataImportView';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import { Indicator, ViewType, MonthlyData, ActionPlan, User } from './types';
import { INITIAL_INDICATORS } from './constants';
import { saveToGitHub, loadFromGitHub, GitHubConfig } from './services/storageService';
import { 
  Github, Cloud, CloudOff, RefreshCw, 
  Loader2, AlertTriangle, User as UserIcon, Edit
} from 'lucide-react';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('kpi_users');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'admin-1',
      name: 'Administrador Master',
      email: 'admin@kpi.com',
      password: 'admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    }];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kpi_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [indicators, setIndicators] = useState<Indicator[]>(() => {
    const saved = localStorage.getItem('kpi_indicators');
    return saved ? JSON.parse(saved) : INITIAL_INDICATORS;
  });

  const [plans, setPlans] = useState<ActionPlan[]>(() => {
    const saved = localStorage.getItem('kpi_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [githubConfig, setGithubConfig] = useState<GitHubConfig | null>(() => {
    const saved = localStorage.getItem('kpi_github_config');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedIndicatorForPlan, setSelectedIndicatorForPlan] = useState<string | undefined>();
  const [editingIndicator, setEditingIndicator] = useState<Indicator | undefined>(undefined);
  
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error' | 'idle'>('idle');
  const [isSyncing, setIsSyncing] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    localStorage.setItem('kpi_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kpi_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kpi_session');
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchCloudData = async () => {
      if (!githubConfig || !currentUser) return;
      setIsSyncing(true);
      try {
        const cloudData = await loadFromGitHub(githubConfig);
        if (cloudData) {
          if (cloudData.indicators) setIndicators(cloudData.indicators);
          if (cloudData.plans) setPlans(cloudData.plans);
          setSyncStatus('synced');
        }
      } catch (err) {
        setSyncStatus('error');
      } finally {
        setIsSyncing(false);
      }
    };
    fetchCloudData();
  }, [currentUser]);

  useEffect(() => {
    if (isInitialMount.current || !currentUser) {
      isInitialMount.current = false;
      return;
    }

    localStorage.setItem('kpi_indicators', JSON.stringify(indicators));
    localStorage.setItem('kpi_plans', JSON.stringify(plans));

    const syncWithCloud = async () => {
      if (!githubConfig) {
        setSyncStatus('pending');
        return;
      }
      setIsSyncing(true);
      try {
        await saveToGitHub(githubConfig, { indicators, plans });
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
      } finally {
        setIsSyncing(false);
      }
    };

    const timer = setTimeout(syncWithCloud, 2000);
    return () => clearTimeout(timer);
  }, [indicators, plans, githubConfig, currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAddIndicator = (newIndicator: Indicator) => {
    setIndicators(prev => [...prev, newIndicator]);
    setCurrentView('list');
  };

  const handleUpdateIndicator = (updatedIndicator: Indicator) => {
    setIndicators(prev => prev.map(ind => ind.id === updatedIndicator.id ? updatedIndicator : ind));
    setEditingIndicator(undefined);
    setCurrentView('list');
  };

  const handleStartEditIndicator = (indicator: Indicator) => {
    setEditingIndicator(indicator);
    setCurrentView('create');
  };

  const handleAddData = (indicatorId: string, entry: MonthlyData) => {
    setIndicators(prev => prev.map(ind => {
      if (ind.id === indicatorId) {
        const filteredData = ind.data.filter(d => !(d.month === entry.month && d.year === entry.year));
        return { ...ind, data: [...filteredData, entry] };
      }
      return ind;
    }));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard indicators={indicators} onNavigateToPlan={goToCreatePlan} onEditIndicator={handleStartEditIndicator} />;
      case 'create':
        return <IndicatorForm onSave={editingIndicator ? handleUpdateIndicator : handleAddIndicator} onCancel={() => { setEditingIndicator(undefined); setCurrentView('dashboard'); }} initialData={editingIndicator} />;
      case 'users':
        return <UserManagement users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />;
      case 'list':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Indicador</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Unidade</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Meta</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {indicators.map((ind) => {
                  const unitSym = ind.unit === 'PERCENTUAL' ? '%' : (ind.unit === 'DIA' ? ' d' : (ind.unit === 'MINUTOS' ? ' min' : ' h'));
                  return (
                    <tr key={ind.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{ind.index}</td>
                      <td className="px-6 py-4"><div className="text-sm font-bold text-slate-800">{ind.name}</div></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">{ind.unit}</span></td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-semibold">{ind.goal}{unitSym}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleStartEditIndicator(ind)} 
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar Indicador"
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      case 'entry':
        return <DataEntryForm indicators={indicators} onAddData={handleAddData} />;
      case 'plans':
        return <ActionPlanView plans={plans} indicators={indicators} onAddPlan={(p) => setPlans(prev => [p, ...prev])} onUpdatePlan={(p) => setPlans(prev => prev.map(pl => pl.id === p.id ? p : pl))} onDeletePlan={(id) => setPlans(prev => prev.filter(p => p.id !== id))} preSelectedIndicatorId={selectedIndicatorForPlan} />;
      case 'import':
        return <DataImportView indicators={indicators} onImport={setIndicators} githubConfig={githubConfig} onUpdateGithubConfig={setGithubConfig} />;
      default:
        return <Dashboard indicators={indicators} onNavigateToPlan={goToCreatePlan} onEditIndicator={handleStartEditIndicator} />;
    }
  };

  const goToCreatePlan = (indicatorId: string) => {
    setSelectedIndicatorForPlan(indicatorId);
    setCurrentView('plans');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-black text-slate-800 tracking-tight">KPI MASTER <span className="text-blue-600">CLOUD</span></h1>
            
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${
              syncStatus === 'synced' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
              syncStatus === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700' :
              syncStatus === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              {isSyncing ? <Loader2 size={14} className="animate-spin" /> : 
               syncStatus === 'synced' ? <Cloud size={14} /> : 
               syncStatus === 'pending' ? <RefreshCw size={14} /> : <CloudOff size={14} />}
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {isSyncing ? 'Sincronizando...' : 
                 syncStatus === 'synced' ? `Online (GitHub)` : 
                 syncStatus === 'pending' ? 'Offline (Pendente)' : 'Somente Local'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Acesso Ativo</p>
                  <p className="text-xs font-bold text-slate-700">{currentUser.name}</p>
               </div>
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <UserIcon size={20} />
               </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {!githubConfig && currentView !== 'import' && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><AlertTriangle size={24} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Armazenamento Local Ativo</h4>
                    <p className="text-xs text-amber-700">Conecte o GitHub para sincronizar dados entre diferentes usuários e dispositivos.</p>
                  </div>
               </div>
               <button onClick={() => setCurrentView('import')} className="px-4 py-2 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 transition-colors uppercase">Configurar Cloud</button>
            </div>
          )}

          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;

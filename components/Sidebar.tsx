
import React from 'react';
import { 
  LayoutDashboard, List, PlusCircle, Database, 
  Settings, BarChart3, ClipboardCheck, FileSpreadsheet,
  Users, LogOut 
} from 'lucide-react';
import { ViewType, User } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  currentUser: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, currentUser, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'list', label: 'Indicadores', icon: List },
    { id: 'create', label: 'Novo Indicador', icon: PlusCircle },
    { id: 'entry', label: 'Lançar Dados', icon: Database },
    { id: 'plans', label: 'Planos de Ação', icon: ClipboardCheck },
    { id: 'import', label: 'Base de Dados', icon: FileSpreadsheet },
  ];

  // Adiciona item de usuários apenas para admins
  if (currentUser.role === 'admin') {
    menuItems.push({ id: 'users', label: 'Usuários', icon: Users });
  }

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/40">
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">KpiMaster</h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest -mt-1">Enterprise</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-slate-800">
        <div className="px-4 py-4 bg-slate-800/50 rounded-2xl mb-2">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Acesso Logado</p>
           <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
           <p className="text-[10px] text-blue-400 font-black uppercase">{currentUser.role}</p>
        </div>
        
        <button 
          onClick={() => onNavigate('dashboard')} // Simulação de settings
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <Settings size={20} />
          <span>Configurações</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all text-sm font-black uppercase tracking-widest"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

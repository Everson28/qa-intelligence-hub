import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, setResult, navItems, isCollapsed, setIsCollapsed }) => {
  const { t } = useTranslation();
  
  return (
    <aside className={`transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'} bg-slate-900 text-white p-6 flex flex-col gap-10 border-r border-slate-800 relative`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-blue-600 text-white rounded-full p-1 border-2 border-slate-900 shadow-lg z-50 hover:scale-110 transition-all"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className={`flex items-center gap-4 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <img src="/Logo/qa_white.svg" alt="QA Hub Logo" className="w-8 h-8 object-contain" />
        </div>
        {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-xl font-black tracking-tighter leading-none">{t('common.sidebar_title')}</h1>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Intelligence v1.2</p>
            </div>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {!isCollapsed && <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">MENU</p>}
        <div className="overflow-y-auto max-h-[calc(100vh-350px)] pr-2 scrollbar-none flex flex-col gap-1">
            {navItems.map((item) => (
            <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setResult(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
            >
                <item.icon size={20} className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors shrink-0`} />
                {!isCollapsed && <span className="font-bold text-sm tracking-tight overflow-hidden whitespace-nowrap">{item.label}</span>}
                {!isCollapsed && activeTab === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse shrink-0"></div>
                )}
            </button>
            ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { Construction, Hammer, Clock, RefreshCw } from 'lucide-react';

const Maintenance = ({ theme }) => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon Header */}
        <div className="relative flex justify-center">
          <div className={`absolute inset-0 blur-3xl opacity-20 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
          <div className={`relative p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} shadow-2xl`}>
            <Construction size={64} className="text-blue-500 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight uppercase">
            Mantenimiento <span className="text-blue-500">En Curso</span>
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Estamos ajustando los motores de nuestro <strong>QA Intelligence Hub</strong> para brindarte una mejor experiencia. 
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'} flex items-center gap-3`}>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <Hammer size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider opacity-50">Estado</p>
              <p className="font-semibold text-sm">Mejorando API</p>
            </div>
          </div>
          
          <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'} flex items-center gap-3`}>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <Clock size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider opacity-50">Estimado</p>
              <p className="font-semibold text-sm">Pronto</p>
            </div>
          </div>
        </div>

        {/* Footer/Action */}
        <div className="pt-4 flex flex-col items-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <RefreshCw size={18} />
            REINTENTAR CARGA
          </button>
          <p className="text-xs font-medium opacity-40 uppercase tracking-[0.2em]">
            QA Intelligence Hub &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;

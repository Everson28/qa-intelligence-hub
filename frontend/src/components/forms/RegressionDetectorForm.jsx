import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, Sparkles } from 'lucide-react';

const RegressionDetectorForm = ({ onAction, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ original_code: '', new_code: '' });

  const handleSubmit = async () => {
    if (!formData.original_code || !formData.new_code) return;
    await onAction('/regression-detector', formData);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-red-600 p-4 rounded-2xl">
          <Search size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.regression')}</h2>
          <p className="text-slate-400 text-xs">Detecta riesgos de regresión antes de desplegar código.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Código Estable</label>
            <textarea 
            className="w-full h-80 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-red-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs resize-none shadow-sm font-mono"
            placeholder="Código estable actual..."
            value={formData.original_code}
            onChange={(e) => setFormData({...formData, original_code: e.target.value})}
            />
        </div>
        <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Código Nuevo</label>
            <textarea 
            className="w-full h-80 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-red-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs resize-none shadow-sm font-mono"
            placeholder="Código con cambios..."
            value={formData.new_code}
            onChange={(e) => setFormData({...formData, new_code: e.target.value})}
            />
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !formData.original_code || !formData.new_code}
        className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-red-500/20 bg-red-600 hover:bg-red-700 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {t('forms.run_regression')}
      </button>

      {/* Background Icon */}
      <Search className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default RegressionDetectorForm;

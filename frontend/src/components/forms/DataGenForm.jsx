import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Loader2, Sparkles } from 'lucide-react';

const DataGenForm = ({ onAction, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    structure: '',
    format: 'json',
    count: 10
  });

  const handleSubmit = async () => {
    if (!formData.structure) return;
    await onAction('/generate-data', formData);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-emerald-600 p-4 rounded-2xl">
          <Database size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.data')}</h2>
          <p className="text-slate-400 text-xs">Crea datos sintéticos realistas para tus entornos de prueba.</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.data_structure')}
        </label>
        <textarea 
          className="w-full h-32 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm resize-none shadow-sm font-mono"
          placeholder='{"name": "string", "age": "number", "email": "email"}'
          value={formData.structure}
          onChange={(e) => setFormData({...formData, structure: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Format</label>
            <select 
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm"
                value={formData.format}
                onChange={(e) => setFormData({...formData, format: e.target.value})}
            >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="sql">SQL</option>
            </select>
        </div>
        <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Count</label>
            <input 
                type="number"
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm"
                value={formData.count}
                onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
            />
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !formData.structure}
        className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {t('forms.gen_data')}
      </button>

      {/* Background Icon */}
      <Database className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default DataGenForm;

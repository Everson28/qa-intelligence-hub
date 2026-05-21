import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, Loader2, Sparkles } from 'lucide-react';

const FunctionalForm = ({ onAction, loading }) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');

  const handleSubmit = async () => {
    if (!url) return;
    await onAction('/functional-test', { url });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-purple-600 p-4 rounded-2xl">
          <Terminal size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.functional')}</h2>
          <p className="text-slate-400 text-xs">Simulación de usuarios y validación de flujos críticos.</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.url_label')}
        </label>
        <input 
          className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm shadow-sm"
          placeholder="https://ejemplo.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !url}
        className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {t('forms.run_functional')}
      </button>

      {/* Background Icon */}
      <Terminal className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default FunctionalForm;

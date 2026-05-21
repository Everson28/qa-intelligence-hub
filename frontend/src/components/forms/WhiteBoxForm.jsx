import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Loader2, Sparkles } from 'lucide-react';

const WhiteBoxForm = ({ onAction, loading }) => {
  const { t } = useTranslation();
  const [codeContent, setCodeContent] = useState('');

  const handleSubmit = async () => {
    if (!codeContent) return;
    await onAction('/white-box-audit', { code_content: codeContent });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-red-600 p-4 rounded-2xl">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.whitebox')}</h2>
          <p className="text-slate-400 text-xs">Auditoría profunda de seguridad, rendimiento y deuda técnica.</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.raw_code_label')}
        </label>
        <textarea 
          className="w-full h-80 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-red-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm resize-none shadow-sm font-mono"
          placeholder="Pega tu código fuente aquí..."
          value={codeContent}
          onChange={(e) => setCodeContent(e.target.value)}
        />
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !codeContent}
        className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-red-500/20 bg-red-600 hover:bg-red-700 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {t('forms.run_audit')}
      </button>

      {/* Background Icon */}
      <ShieldAlert className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default WhiteBoxForm;

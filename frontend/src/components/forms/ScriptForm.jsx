import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Code2, Loader2, Sparkles, Terminal } from 'lucide-react';

const ScriptForm = ({ onAction, loading }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!description) return;
    await onAction('/generate-script', { description });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-indigo-600 p-4 rounded-2xl">
          <Code2 size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.scripts')}</h2>
          <p className="text-slate-400 text-xs">Automatización inteligente basada en descripciones funcionales.</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.script_placeholder')}
        </label>
        <textarea 
          className="w-full h-64 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm resize-none shadow-sm"
          placeholder="Escribe qué debe hacer el script (ej: Login con usuario válido, click en perfil y logout)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !description}
        className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Terminal size={20} />}
        {t('forms.gen_script')}
      </button>

      {/* Background Icon */}
      <Code2 className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default ScriptForm;

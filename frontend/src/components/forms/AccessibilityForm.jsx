import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Loader2, Sparkles } from 'lucide-react';

const AccessibilityForm = ({ onAction, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ url: '', code_content: '' });

  const handleSubmit = async () => {
    if (!formData.url && !formData.code_content) return;
    await onAction('/accessibility-audit', formData);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-emerald-600 p-4 rounded-2xl">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.accessibility')}</h2>
          <p className="text-slate-400 text-xs">Auditoría WCAG 2.1: Asegura la inclusión total de tu web.</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.url_label')}
        </label>
        <input 
          className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm shadow-sm"
          placeholder="https://ejemplo.com"
          value={formData.url}
          onChange={(e) => setFormData({...formData, url: e.target.value})}
        />
      </div>

      <div className="space-y-4 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.raw_code_label')}
        </label>
        <textarea 
          className="w-full h-32 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm resize-none shadow-sm font-mono"
          placeholder="O pega el código aquí directamente..."
          value={formData.code_content}
          onChange={(e) => setFormData({...formData, code_content: e.target.value})}
        />
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || (!formData.url && !formData.code_content)}
        className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {t('forms.analyze_accessibility')}
      </button>

      {/* Background Icon */}
      <ShieldCheck className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default AccessibilityForm;

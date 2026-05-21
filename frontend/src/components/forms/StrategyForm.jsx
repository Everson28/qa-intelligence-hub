import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Loader2, Sparkles, LayoutDashboard } from 'lucide-react';

const StrategyForm = ({ onAction, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    project_description: '',
    tech_stack: '',
    focus_areas: []
  });

  const handleSubmit = async () => {
    if (!formData.project_description) return;
    await onAction('/quality-strategy', formData);
  };

  const toggleFocus = (area) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area) 
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-blue-600 p-4 rounded-2xl">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.strategy')}</h2>
          <p className="text-slate-400 text-xs">Define tu visión y deja que la IA cree el mapa de ruta.</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.project_desc_label')}
        </label>
        <textarea 
          className="w-full h-32 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm resize-none shadow-sm"
          placeholder={t('forms.strategy_placeholder')}
          value={formData.project_description}
          onChange={(e) => setFormData({...formData, project_description: e.target.value})}
        />
      </div>

      <div className="space-y-2 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.tech_stack_label')}
        </label>
        <input 
          className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm shadow-sm"
          placeholder={t('forms.tech_stack_placeholder')}
          value={formData.tech_stack}
          onChange={(e) => setFormData({...formData, tech_stack: e.target.value})}
        />
      </div>

      <div className="space-y-3 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Focus Areas</label>
        <div className="flex flex-wrap gap-2">
          {['Performance', 'Security', 'Automation', 'Accessibility', 'Manual Testing'].map(area => (
            <button 
                key={area}
                type="button"
                onClick={() => toggleFocus(area)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    formData.focus_areas.includes(area) 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
                {area}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !formData.project_description}
        className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {t('forms.gen_strategy')}
      </button>

      {/* Background Icon */}
      <Target className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default StrategyForm;

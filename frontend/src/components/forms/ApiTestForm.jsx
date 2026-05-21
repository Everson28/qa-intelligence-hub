import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2, Sparkles, Database } from 'lucide-react';

const ApiTestForm = ({ onAction, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ endpoint_info: '', response_sample: '' });

  const handleSubmit = async () => {
    if (!formData.endpoint_info) return;
    await onAction('/api-test-gen', formData);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative overflow-hidden group">
      <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative z-10">
        <div className="bg-blue-600 p-4 rounded-2xl">
          <Globe size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">{t('common.api')}</h2>
          <p className="text-slate-400 text-xs">Diseña suites de pruebas robustas para tus endpoints.</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.endpoint_info')}
        </label>
        <input 
          className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm shadow-sm"
          placeholder="GET /api/v1/users/{id}"
          value={formData.endpoint_info}
          onChange={(e) => setFormData({...formData, endpoint_info: e.target.value})}
        />
      </div>

      <div className="space-y-4 relative z-10">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
          {t('forms.json_sample')}
        </label>
        <textarea 
          className="w-full h-32 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm resize-none shadow-sm font-mono"
          placeholder='{"id": 1, "name": "John"}'
          value={formData.response_sample}
          onChange={(e) => setFormData({...formData, response_sample: e.target.value})}
        />
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !formData.endpoint_info}
        className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {t('forms.gen_tests')}
      </button>

      {/* Background Icon */}
      <Globe className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default ApiTestForm;

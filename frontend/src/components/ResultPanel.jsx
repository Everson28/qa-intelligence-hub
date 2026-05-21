import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, Download, Copy, Check, Terminal, FileText, ShieldAlert } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_ROOT, API_BASE } from '../config';

const ResultPanel = ({ loading, result, setResult, activeTab }) => {
  const { t } = useTranslation();
  const [currentModel, setCurrentModel] = useState('qwen2.5-coder:7b');
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Detect context theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Detectar si es un resultado de migración (objeto con pdf_path o pdf)
  const isMigration = typeof result === 'object' && result !== null && (result.pdf_path || result.pdf);
  const pdfUrl = isMigration ? `${API_ROOT}/${(result.pdf_path || result.pdf).replace(/\\/g, '/')}` : null;
  const recordsCount = isMigration ? (result.records_count || result.records || 0) : 0;

  // New logic: Detect Gherkin for cross-tool synergy
  const isGherkin = typeof result === 'string' && (result.includes('Feature:') || result.includes('Scenario:') || result.includes('Given '));
  
  // Detect Data types for better exports
  const isJson = typeof result === 'string' && (result.trim().startsWith('{') || result.trim().startsWith('['));
  const isSql = typeof result === 'string' && (result.includes('CREATE TABLE') || result.includes('INSERT INTO'));

  useEffect(() => {
    axios.get(`${API_BASE}/info/model`)
      .then(res => setCurrentModel(res.data.model))
      .catch(() => {});
  }, []);

  const downloadFile = (content, filename) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    toast.success(t('results.download_success') || 'File downloaded');
  };

  const [executing, setExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState(null);
  const [isError, setIsError] = useState(false);
  const [fixing, setFixing] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(t('results.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t('results.copy_error'));
    }
  };

  const handleFix = async () => {
    setFixing(true);
    try {
      const response = await axios.post(`${API_BASE}/fix-script`, { 
        code: result, 
        error: executionLog 
      });
      
      const newCode = response.data.data;
      if (setResult) setResult(newCode);

      setExecutionLog(null);
      setIsError(false);
      toast.success(t('results.fix_generated'));
    } catch (err) {
      toast.error(t('results.fix_error') + err.message);
    } finally {
      setFixing(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setExecutionLog(null);
    setIsError(false);
    toast.loading(t('results.executing'), { id: 'executing' });
    try {
      const response = await axios.post(`${API_BASE}/execute-script`, { code: result });
      setExecutionLog(response.data.data);
      if (response.data.data.toLowerCase().includes("error")) {
        setIsError(true);
        toast.error(t('results.execution_failed') || 'Execution Failed', { id: 'executing' });
      } else {
        toast.success(t('results.execution_success') || 'Success', { id: 'executing' });
      }
    } catch (err) {
      setIsError(true);
      toast.error(t('results.execution_error') || 'Error', { id: 'executing' });
      if (err.response) {
        setExecutionLog(`Error (${err.response.status}): ${JSON.stringify(err.response.data)}`);
      } else {
        setExecutionLog(`Network Error: ${err.message}`);
      }
    } finally {
      setExecuting(false);
    }
  };

  const automateGherkin = () => {
    window.dispatchEvent(new CustomEvent('nav-change', { detail: 'scripts' }));
    toast.success(t('results.nav_to_scripts'));
  };

  return (
    <section className="card flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('results.ai_results')}</span>
        {result && (
          <div className="flex items-center gap-3">
            {isGherkin && (
                <button 
                onClick={automateGherkin}
                className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:opacity-80 transition-all bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-xl border border-purple-100 dark:border-purple-800"
              >
                <Terminal size={14} /> Automate
              </button>
            )}
            {activeTab === 'scripts' && (
                <button 
                onClick={handleExecute}
                disabled={executing}
                className={`flex items-center gap-2 text-xs font-bold transition-all ${executing ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800'}`}
              >
                {executing ? <Loader2 size={14} className="animate-spin" /> : <Terminal size={14} />}
                {executing ? t('results.executing') : t('results.execute')}
              </button>
            )}
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 text-xs font-bold transition-all ${copied ? 'text-green-600' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700'}`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} 
              {copied ? t('results.copied') : t('results.copy')}
            </button>
            <button 
              onClick={() => {
                const ext = isJson ? 'json' : isSql ? 'sql' : 'md';
                downloadFile(typeof result === 'string' ? result : JSON.stringify(result, null, 2), `qa-hub-export-${Date.now()}.${ext}`);
              }}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:opacity-80 text-xs font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800"
            >
              <Download size={14} /> {t('results.export')}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-slate-900 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 dark:border-slate-900 relative min-h-[450px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="relative">
                <Loader2 className="animate-spin w-16 h-16 text-blue-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
                </div>
            </div>
            <p className="font-bold text-sm tracking-widest uppercase animate-pulse">{t('results.processing', { model: currentModel })}</p>
          </div>
        ) : isMigration ? (
          <div className="h-full overflow-y-auto bg-slate-900 dark:bg-slate-950 text-white p-6 sm:p-10 text-center flex flex-col items-center gap-8 custom-scrollbar">
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className="bg-emerald-500/20 p-6 rounded-full border border-emerald-500/50 shadow-2xl shadow-emerald-500/10">
                <Check className="text-emerald-400 w-12 h-12" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">{t('results.migration_success')}</h2>
                <p className="text-slate-400 font-medium">{t('results.records_processed', { count: recordsCount })}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl">
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-red-900/40 active:scale-95"
              >
                <FileText size={18} /> {t('results.view_pdf')}
              </a>

              {result.xlsx_path && (
                <a 
                  href={`${API_ROOT}/${result.xlsx_path.replace(/\\/g, '/')}`} 
                  download
                  className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-900/40 active:scale-95"
                >
                  <Download size={18} /> {t('results.download_excel')}
                </a>
              )}

              {result.csv_path && (
                <a 
                  href={`${API_ROOT}/${result.csv_path.replace(/\\/g, '/')}`} 
                  download
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                >
                  <Download size={18} /> {t('results.download_csv')}
                </a>
              )}

              {(!result.xlsx_path && !result.csv_path && result.transformed) && (
                <a 
                  href={`${API_ROOT}/${result.transformed.replace(/\\/g, '/')}`} 
                  download
                  className="flex items-center gap-3 bg-slate-600 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-900/40 active:scale-95"
                >
                  <Download size={18} /> {t('results.download_converted')}
                </a>
              )}
            </div>

            {/* Insights Section */}
            {result.insights && (
              <div className="mt-8 p-8 bg-slate-800/50 dark:bg-slate-900/50 rounded-[2rem] border border-blue-500/20 w-full max-w-xl text-left backdrop-blur-md">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
                    <h4 className="text-blue-400 font-black uppercase text-[10px] tracking-[0.3em]">{t('results.ia_quality_insight')}</h4>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('results.trend_detected')}</p>
                        <p className="text-white font-bold">{result.insights.trend}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('results.critical_analysis')}</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{result.insights.message}</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                        <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">{t('results.proactive_recommendation')}</p>
                        <p className="text-emerald-400 text-xs font-medium">{result.insights.recommendation}</p>
                    </div>
                </div>
              </div>
            )}
          </div>
        ) : executionLog ? (
            <div className="p-8 text-emerald-400 font-mono text-sm overflow-auto h-full relative">
              <div className="flex justify-between items-center border-b border-emerald-900/30 pb-4 mb-6">
                <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-emerald-500" />
                    <h4 className="font-black text-emerald-100 uppercase tracking-widest text-xs">{t('results.execution_output')}</h4>
                </div>
                {isError && (
                  <button 
                    onClick={handleFix}
                    disabled={fixing}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl border border-red-500/30 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    {fixing ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                    {fixing ? t('results.fixing') : t('results.auto_fix')}
                  </button>
                )}
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{executionLog}</pre>
            </div>
        ) : result ? (
          <SyntaxHighlighter 
            language={activeTab === 'scripts' ? 'python' : 'markdown'} 
            style={theme === 'dark' ? oneDark : oneLight}
            customStyle={{ margin: 0, padding: '2.5rem', height: '100%', fontSize: '0.95rem', background: 'transparent' }}
          >
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </SyntaxHighlighter>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 dark:text-slate-700 italic gap-4">
            <div className="w-16 h-[1px] bg-slate-800 dark:bg-slate-800"></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">{t('results.waiting_input')}</p>
            <div className="w-16 h-[1px] bg-slate-800 dark:bg-slate-800"></div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResultPanel;

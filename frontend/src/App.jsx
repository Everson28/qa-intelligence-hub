import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { 
  ClipboardCheck, 
  Code2, 
  Search, 
  Bug, 
  Terminal,
  ShieldAlert,
  Target,
  Database,
  Globe,
  Clock,
  LogOut,
  Shield,
  FileUp,
  ShieldCheck,
  Activity,
  GitCompare,
  Bot,
  Sun,
  Moon,
  FlaskConical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ResultPanel from './components/ResultPanel';
import Auth from './components/Auth';
import HistoryView from './components/HistoryView';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import Maintenance from './components/Maintenance';

// Forms
import RequirementForm from './components/forms/RequirementForm';
import StrategyForm from './components/forms/StrategyForm';
import ScriptForm from './components/forms/ScriptForm';
import ApiTestForm from './components/forms/ApiTestForm';
import DataGenForm from './components/forms/DataGenForm';
import AuditForm from './components/forms/AuditForm';
import FunctionalForm from './components/forms/FunctionalForm';
import WhiteBoxForm from './components/forms/WhiteBoxForm';
import BugForm from './components/forms/BugForm';
import DataMigrationForm from './components/forms/DataMigrationForm';
import SnowflakeForm from './components/forms/SnowflakeForm';
import MigrationTestForm from './components/forms/MigrationTestForm';
import AccessibilityForm from './components/forms/AccessibilityForm';
import AIValidationForm from './components/forms/AIValidationForm';
import RegressionDetectorForm from './components/forms/RegressionDetectorForm';
import QACopilot from './components/forms/QACopilot';
import { API_ROOT, API_BASE } from './config';

// Maintenance Mode Flag - Change to false to disable
const isMaintenanceMode = false;

// Set initial axios header if token exists to prevent 401 on first requests
const initialToken = localStorage.getItem('token');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

const App = () => {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sincronizar navegación externa
  useEffect(() => {
    const handleNav = (e) => {
      setActiveTab(e.detail);
      setResult('');
    };
    window.addEventListener('nav-change', handleNav);
    return () => window.removeEventListener('nav-change', handleNav);
  }, []);

  // Configurar axios y obtener info del usuario
  useEffect(() => {
    // Sincronizar header de idioma
    axios.defaults.headers.common['Accept-Language'] = i18n.language;

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_BASE}/auth/me`)
        .then(res => setCurrentUser(res.data))
        .catch(() => handleLogout());
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    }
  }, [token, i18n.language]);

  const navItems = [
    { id: 'dashboard', label: t('common.dashboard'), icon: Activity },
    { id: 'requirements', label: t('common.requirements'), icon: ClipboardCheck },
    { id: 'strategy', label: t('common.strategy'), icon: Target },
    { id: 'scripts', label: t('common.scripts'), icon: Code2 },
    { id: 'api', label: t('common.api'), icon: Globe },
    { id: 'data', label: t('common.data'), icon: Database },
    { id: 'migration', label: t('common.migration'), icon: FileUp },
    { id: 'snowflake', label: t('common.snowflake'), icon: Database },
    { id: 'migration_test', label: t('common.migration_test'), icon: FlaskConical },
    { id: 'accessibility', label: t('common.accessibility'), icon: ShieldCheck },
    { id: 'validation', label: t('common.validation'), icon: GitCompare },
    { id: 'regression', label: t('common.regression'), icon: Search },
    { id: 'copilot', label: t('common.copilot'), icon: Bot },
    { id: 'audit', label: t('common.audit'), icon: Search },
    { id: 'functional', label: t('common.functional'), icon: Terminal },
    { id: 'whitebox', label: t('common.whitebox'), icon: ShieldAlert },
    { id: 'bugs', label: t('common.bugs'), icon: Bug },
    { id: 'history', label: t('common.history'), icon: Clock },
    ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: t('common.admin'), icon: Shield }] : []),
  ];

  const handleAction = async (endpoint, payload) => {
    setLoading(true);
    setResult('');
    try {
      const response = await axios.post(`${API_BASE}${endpoint}`, payload);
      let data = response.data.data;
      
      if (data && data.analysis) {
        setResult(data.analysis);
      } else if (typeof data === 'string') {
        setResult(data);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        const errorMsg = error.response?.data?.detail || error.message;
        toast.error(t('common.error_system') + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setCurrentUser(null);
    window.location.reload(); 
  };

  if (isMaintenanceMode) {
    return <Maintenance theme={theme} />;
  }

  if (!token) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth onLogin={setToken} />
      </>
    );
  }

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <div className={`flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          setResult={setResult} 
          navItems={navItems}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        
        <div className={`mt-auto flex flex-col gap-2 p-6 transition-all duration-300 ${isCollapsed ? 'items-center px-4' : ''}`}>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-slate-800 group ${isCollapsed ? 'justify-center w-12 h-12 p-0' : 'w-full'}`}
            title={isCollapsed ? (theme === 'dark' ? 'LIGHT' : 'DARK') : ''}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={20} className="group-hover:rotate-45 transition-transform shrink-0" />
                {!isCollapsed && <span className="font-bold text-sm uppercase tracking-widest">LIGHT</span>}
              </>
            ) : (
              <>
                <Moon size={20} className="group-hover:-rotate-12 transition-transform shrink-0" />
                {!isCollapsed && <span className="font-bold text-sm uppercase tracking-widest">DARK</span>}
              </>
            )}
          </button>

          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all border border-slate-800 group ${isCollapsed ? 'justify-center w-12 h-12 p-0' : 'w-full'}`}
            title={isCollapsed ? t('common.logout') : ''}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="font-bold text-sm uppercase tracking-widest">{t('common.logout')}</span>}
          </button>
        </div>
      </div>

      <main className="flex-1 p-10 overflow-auto flex flex-col">
        <Header activeTab={activeTab} currentUser={currentUser} onLogout={handleLogout} />

        <div className="flex-1">
          {activeTab === 'history' ? (
            <HistoryView />
          ) : activeTab === 'admin' ? (
            <AdminPanel />
          ) : activeTab === 'dashboard' ? (
            <Dashboard />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className={`card transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                {activeTab === 'requirements' && <RequirementForm onAction={handleAction} loading={loading} />}
                {activeTab === 'strategy' && <StrategyForm onAction={handleAction} loading={loading} />}
                {activeTab === 'scripts' && <ScriptForm onAction={handleAction} loading={loading} />}
                {activeTab === 'api' && <ApiTestForm onAction={handleAction} loading={loading} />}
                {activeTab === 'data' && <DataGenForm onAction={handleAction} loading={loading} />}
                {activeTab === 'audit' && <AuditForm onAction={handleAction} loading={loading} />}
                {activeTab === 'functional' && <FunctionalForm onAction={handleAction} loading={loading} />}
                {activeTab === 'whitebox' && <WhiteBoxForm onAction={handleAction} loading={loading} />}
                {activeTab === 'bugs' && <BugForm onAction={handleAction} loading={loading} />}
                {activeTab === 'migration' && <DataMigrationForm onUploadSuccess={(data) => setResult(data)} loading={loading} setLoading={setLoading} />}
                {activeTab === 'snowflake' && <SnowflakeForm onUploadSuccess={(data) => setResult(data)} loading={loading} setLoading={setLoading} />}
                {activeTab === 'migration_test' && <MigrationTestForm onUploadSuccess={(data) => setResult(data)} loading={loading} setLoading={setLoading} />}
                {activeTab === 'accessibility' && <AccessibilityForm onAction={handleAction} loading={loading} />}
                {activeTab === 'validation' && <AIValidationForm onAction={handleAction} loading={loading} />}
                {activeTab === 'regression' && <RegressionDetectorForm onAction={handleAction} loading={loading} />}
              </section>

              {activeTab === 'copilot' ? (
                <QACopilot />
              ) : (
                <ResultPanel 
                  loading={loading} 
                  result={result} 
                  setResult={setResult}
                  activeTab={activeTab} 
                />
              )}

            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default App;

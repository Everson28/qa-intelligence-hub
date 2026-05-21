import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Clock, Eye, Trash2, Loader2, Search } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_ROOT, API_BASE } from '../config';

const HistoryView = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error(t('history.fetch_error') || 'Error fetching history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t('history.confirm_delete'))) return;
    try {
      await axios.delete(`${API_BASE}/history/${id}`);
      toast.success(t('history.delete_success') || 'Report deleted');
      fetchHistory();
    } catch (error) {
      toast.error(t('history.delete_error') || 'Error deleting report');
    }
  };

  if (selectedReport) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedReport(null)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            &larr; {t('history.back_to_list')}
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
            {selectedReport.type}
          </span>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedReport.title}</h3>
          <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
            <Clock size={14} /> {new Date(selectedReport.created_at).toLocaleString()}
            {selectedReport.source && <span> | {t('history.origin')}: {selectedReport.source}</span>}
          </p>
          
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            <SyntaxHighlighter 
              language="markdown" 
              style={oneLight}
              customStyle={{ margin: 0, padding: '2rem', fontSize: '0.9rem' }}
            >
              {selectedReport.content}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder={t('history.search_placeholder')}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
          <p>{t('history.loading')}</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((item) => (
            <div 
              key={item.id}
              className="group bg-white p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
              onClick={() => setSelectedReport(item)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  item.type === 'bug' ? 'bg-red-50 text-red-500' :
                  item.type === 'security' ? 'bg-orange-50 text-orange-500' :
                  item.type === 'audit' ? 'bg-indigo-50 text-indigo-500' :
                  'bg-blue-50 text-blue-500'
                }`}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <span className="font-semibold uppercase">{item.type}</span> • {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => handleDelete(e, item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title={t('history.delete')}
                >
                  <Trash2 size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 italic">{t('history.empty')}</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;

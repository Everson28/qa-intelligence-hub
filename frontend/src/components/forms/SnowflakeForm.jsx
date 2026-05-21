import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Loader2, Code, FileCode, Upload, FolderOpen, FileCheck, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_ROOT, API_BASE } from '../../config';

const SnowflakeForm = ({ onUploadSuccess, loading: parentLoading, setLoading }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(t('forms.file_ready') || 'File ready');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(ext)) {
        setFile(droppedFile);
        toast.success(t('forms.file_ready') || 'File ready');
      } else {
        toast.error("Formato no soportado.");
      }
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleGenerateSQL = async () => {
    if (!file) {
      toast.error("No hay archivo seleccionado");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (instructions) {
      formData.append('instructions', instructions);
    }

    try {
      const response = await axios.post(`${API_BASE}/generate-snowflake-sql`, formData);
      setFile(null);
      setInstructions('');
      onUploadSuccess(response.data.data);
      toast.success('SQL generado con éxito');
    } catch (error) {
      console.error("Snowflake: Error:", error);
      toast.error(t('forms.sql_error') + ": " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 relative overflow-hidden group">
      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 relative z-10">
        <h3 className="text-indigo-800 dark:text-indigo-300 font-bold mb-2 flex items-center gap-2">
          <Database size={18} /> {t('forms.snowflake_title')}
        </h3>
        <p className="text-indigo-600 dark:text-indigo-400 text-sm">
          {t('forms.snowflake_desc')}
        </p>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '1px', height: '1px' }}
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls"
      />
      
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-4 transition-all relative z-10 ${
          file ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm' :
          (isDragging ? 'border-indigo-500 bg-indigo-50 shadow-inner' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50')
        }`}
      >
        {file ? <FileCheck className="text-emerald-600" size={48} /> : (isDragging ? <Upload size={48} className="text-indigo-500 animate-bounce" /> : <FileCode size={48} className="text-slate-400" />)}
        
        <div className="text-center flex flex-col items-center gap-4">
          <p className={`font-medium ${file ? 'text-emerald-700' : (isDragging ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400')}`}>
            {file ? file.name : (isDragging ? "Suelta el archivo aquí" : t('forms.select_legacy'))}
          </p>
          
          <button 
            type="button"
            onClick={handleButtonClick}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-sm ${
              file ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200' : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <FolderOpen size={18} />
            {file ? "Cambiar archivo" : "Seleccionar archivo"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Instrucciones de Formato (Opcional)</label>
        <textarea 
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Ej: Genera comentarios detallados para cada columna y usa CamelCase para los nombres de tabla..."
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 text-sm text-slate-600 dark:text-slate-300"
        />
      </div>

      <button 
        onClick={handleGenerateSQL}
        disabled={parentLoading || !file}
        className={`bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all disabled:opacity-50 ${file ? 'scale-105 shadow-xl shadow-indigo-500/20' : ''} relative z-10`}
      >
        {parentLoading ? <Loader2 className="animate-spin" /> : <Code size={20} />}
        {t('forms.gen_snowflake')}
      </button>

      {/* Background Icon */}
      <Database className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default SnowflakeForm;

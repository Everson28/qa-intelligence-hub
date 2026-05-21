import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Loader2, Code, FileCode, Upload, FolderOpen, FileCheck, FlaskConical } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { API_BASE } from '../../config';

const MigrationTestForm = ({ onUploadSuccess, loading: parentLoading, setLoading }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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

  const handleGenerateTests = async () => {
    if (!file) {
      toast.error("No hay archivo seleccionado");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/generate-migration-tests`, formData);
      setFile(null);
      onUploadSuccess(response.data.data);
      toast.success('Tests de validación generados');
    } catch (error) {
      console.error("Migration Test Error:", error);
      toast.error("Error al generar tests: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 relative overflow-hidden group">
      <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 relative z-10">
        <h3 className="text-emerald-800 dark:text-emerald-300 font-bold mb-2 flex items-center gap-2">
          <ShieldCheck size={18} /> QA Data Validation (Pytest)
        </h3>
        <p className="text-emerald-600 dark:text-emerald-400 text-sm leading-relaxed">
            Sube tu archivo origen (Access/Excel/CSV) para generar una suite de pruebas automatizada en Pytest que valide la integridad de la migración en Snowflake.
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
          (isDragging ? 'border-emerald-500 bg-emerald-50 shadow-inner' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50')
        }`}
      >
        {file ? <FileCheck className="text-emerald-600" size={48} /> : (isDragging ? <Upload size={48} className="text-emerald-500 animate-bounce" /> : <FlaskConical size={48} className="text-slate-400" />)}
        
        <div className="text-center flex flex-col items-center gap-4">
          <p className={`font-medium ${file ? 'text-emerald-700' : (isDragging ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400')}`}>
            {file ? file.name : (isDragging ? "Suelta el archivo aquí" : "Selecciona el archivo origen de datos")}
          </p>
          
          <button 
            type="button"
            onClick={handleButtonClick}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-sm ${
              file ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200' : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <FolderOpen size={18} />
            {file ? "Cambiar archivo" : "Seleccionar archivo"}
          </button>
        </div>
      </div>

      <button 
        onClick={handleGenerateTests}
        disabled={parentLoading || !file}
        className={`bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all disabled:opacity-50 ${file ? 'scale-105 shadow-xl shadow-emerald-500/20' : ''} relative z-10`}
      >
        {parentLoading ? <Loader2 className="animate-spin" /> : <Code size={20} />}
        Generar Suite de Validación (Pytest)
      </button>

      {/* Background Icon */}
      <FlaskConical className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 dark:text-slate-800 group-hover:rotate-12 transition-transform duration-500" />
    </div>
  );
};

export default MigrationTestForm;

import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { User, Upload, X } from 'lucide-react';
import { API_ROOT, API_BASE } from '../config';

const ProfileAvatar = ({ user, onUpdate }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post(`${API_BASE}/user/avatar`, formData);
      onUpdate(res.data.avatar_url);
      toast.success('Avatar actualizado');
    } catch (err) {
      toast.error('Error al subir avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
        {user?.avatar_url ? (
          <img src={`${API_ROOT}${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <User size={40} className="text-slate-400" />
        )}
      </div>
      <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-all shadow-lg">
        <Upload size={16} />
        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
      </label>
    </div>
  );
};

export default ProfileAvatar;

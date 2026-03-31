import { useState, useRef } from 'react';
import { useAuthStore } from '../store';
import api from '../lib/api';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await api.upload('/api/auth/profile-picture', file, {
        method: 'PUT',
      });
      setUser(data.user);
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl">
              {user?.email?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="text-gray-600">{user?.email}</p>
          <p className="text-gray-500 text-sm">Plan: {user?.plan}</p>
          <button
            type="button"
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Uploading...' : 'Change profile picture'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}

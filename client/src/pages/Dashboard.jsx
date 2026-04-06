import { useRef } from 'react';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import { useAuthStore } from '../store';
import useUploadProfilePicture from '../hooks/useUploadProfilePicture';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const upload = useUploadProfilePicture();
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 2MB.');
      e.target.value = '';
      return;
    }

    try {
      await upload.mutateAsync(file);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
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
            disabled={upload.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={14} className="inline mr-1" />
              {upload.isPending ? 'Uploading...' : 'Change profile picture'}
          </button>
          <p className="text-gray-400 text-xs mt-1">JPEG, PNG, or WebP. Max 2MB.</p>
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

import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function useAuth() {
  const { setUser, clearUser } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await api.get('/api/auth/me');
      setUser(data.user);
      return data.user;
    },
    retry: false,
    onError: () => clearUser(),
  });
}

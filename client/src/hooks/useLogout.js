import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import queryClient from '../lib/queryClient';
import useAuthStore from '../store/authStore';

export default function useLogout() {
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: () => api.post('/api/auth/logout'),
    onSuccess: () => {
      clearUser();
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import queryClient from '../lib/queryClient';

export default function useRegister() {
  return useMutation({
    mutationFn: (data) => api.post('/api/auth/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

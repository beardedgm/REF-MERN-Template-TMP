import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import queryClient from '../lib/queryClient';

export default function useLogin() {
  return useMutation({
    mutationFn: (data) => api.post('/api/auth/login', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

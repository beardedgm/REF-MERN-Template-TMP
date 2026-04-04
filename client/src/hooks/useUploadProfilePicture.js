import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import queryClient from '../lib/queryClient';

export default function useUploadProfilePicture() {
  return useMutation({
    mutationFn: (file) =>
      api.upload('/api/auth/profile-picture', file, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

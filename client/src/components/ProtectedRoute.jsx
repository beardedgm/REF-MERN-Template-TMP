import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';

export default function ProtectedRoute() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

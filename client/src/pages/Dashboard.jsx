import { useAuthStore } from '../store';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome, {user?.email}</p>
      <p className="text-gray-500 text-sm">Plan: {user?.plan}</p>
    </div>
  );
}

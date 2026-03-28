import { useAuthStore } from '../store';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <p>Plan: {user?.plan}</p>
    </div>
  );
}

import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';
import { useLogout } from '../hooks';

export default function Layout() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <Link to="/" className="text-lg font-semibold">App</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm hover:underline">Dashboard</Link>
              <button
                onClick={() => logout.mutate()}
                className="text-sm hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:underline">Login</Link>
              <Link
                to="/register"
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

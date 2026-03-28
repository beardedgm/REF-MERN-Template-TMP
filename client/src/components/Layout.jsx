import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';
import { useLogout } from '../hooks';

export default function Layout() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={() => logout.mutate()}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

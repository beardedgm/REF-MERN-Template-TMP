import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Welcome</h1>
      <p>Get started by creating an account.</p>
      <Link to="/register">Get Started</Link>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Welcome</h1>
      <p className="text-gray-600 mb-8">Get started by creating an account.</p>
      <Link
        to="/register"
        className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800"
      >
        Get Started
      </Link>
    </div>
  );
}

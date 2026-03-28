import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../hooks';
import { registerSchema } from 'shared/schemas/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const register = useRegister();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: ['Passwords do not match'] });
      return;
    }

    const result = registerSchema.safeParse({ email, password });
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    try {
      await register.mutateAsync(result.data);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ form: [err.message] });
    }
  }

  return (
    <div className="max-w-sm mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword[0]}</p>}
        </div>
        {errors.form && <p className="text-red-600 text-sm">{errors.form[0]}</p>}
        <button
          type="submit"
          disabled={register.isPending}
          className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {register.isPending ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Already have an account? <Link to="/login" className="underline">Login</Link>
      </p>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403 && err.response.data.userId) {
        navigate('/verify-otp', { state: { userId: err.response.data.userId } });
        return;
      }
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <h1 className="text-3xl mb-6">Welcome back</h1>
      {error && <p className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="email" placeholder="Campus email" required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-campus-navy/20 rounded-lg px-4 py-2.5" />
        <input type="password" placeholder="Password" required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-campus-navy/20 rounded-lg px-4 py-2.5" />
        <button disabled={loading} className="w-full bg-campus-navy text-campus-sand rounded-lg py-2.5 font-medium hover:bg-campus-navy/90 transition disabled:opacity-50">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-campus-navy/60">
        New here? <Link to="/register" className="text-campus-moss font-medium">Create an account</Link>
      </p>
    </div>
  );
}

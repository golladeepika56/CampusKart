import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', hostelBlock: '', year: '', branch: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <h1 className="text-3xl mb-1">Join CampusKart</h1>
      <p className="text-campus-navy/60 mb-6 text-sm">Use your campus email — we'll send a code to verify you're a student here.</p>

      {error && <p className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" placeholder="Full name" required onChange={handleChange}
          className="w-full border border-campus-navy/20 rounded-lg px-4 py-2.5" />
        <input name="email" type="email" placeholder="you@yourcollege.edu.in" required onChange={handleChange}
          className="w-full border border-campus-navy/20 rounded-lg px-4 py-2.5" />
        <input name="password" type="password" placeholder="Password" required minLength={6} onChange={handleChange}
          className="w-full border border-campus-navy/20 rounded-lg px-4 py-2.5" />
        <div className="grid grid-cols-3 gap-2">
          <input name="hostelBlock" placeholder="Block" onChange={handleChange}
            className="border border-campus-navy/20 rounded-lg px-3 py-2.5" />
          <input name="year" placeholder="Year" onChange={handleChange}
            className="border border-campus-navy/20 rounded-lg px-3 py-2.5" />
          <input name="branch" placeholder="Branch" onChange={handleChange}
            className="border border-campus-navy/20 rounded-lg px-3 py-2.5" />
        </div>
        <button disabled={loading} className="w-full bg-campus-navy text-campus-sand rounded-lg py-2.5 font-medium hover:bg-campus-navy/90 transition disabled:opacity-50">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-campus-navy/60">
        Already have an account? <Link to="/login" className="text-campus-moss font-medium">Log in</Link>
      </p>
    </div>
  );
}

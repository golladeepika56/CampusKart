import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function VerifyOtp() {
  const { state } = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId: state?.userId, otp });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await api.post('/auth/resend-otp', { userId: state?.userId });
    } catch {
      // silent — a duplicate resend click isn't worth surfacing an error for
    }
  };

  if (!state?.userId) {
    return <p className="text-center mt-12">Missing registration info — please register again.</p>;
  }

  return (
    <div className="max-w-sm mx-auto mt-12 px-4 text-center">
      <h1 className="text-3xl mb-2">Check your inbox</h1>
      <p className="text-campus-navy/60 mb-6 text-sm">Enter the 6-digit code we emailed to your campus address.</p>

      {error && <p className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="••••••"
          className="w-full text-center text-2xl tracking-[0.5em] border border-campus-navy/20 rounded-lg py-3" />
        <button disabled={loading} className="w-full bg-campus-navy text-campus-sand rounded-lg py-2.5 font-medium hover:bg-campus-navy/90 transition disabled:opacity-50">
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      <button onClick={resend} className="text-sm text-campus-moss mt-4">Resend code</button>
    </div>
  );
}

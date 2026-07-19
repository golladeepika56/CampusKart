import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    api.get('/admin/reports').then(({ data }) => setReports(data));
  }, []);

  if (!reports) return <p className="text-center mt-12">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-6">Admin overview</h1>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(reports).map(([key, value]) => (
          <div key={key} className="border border-campus-navy/10 rounded-xl p-4">
            <p className="text-3xl font-display font-semibold">{value}</p>
            <p className="text-sm text-campus-navy/60 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

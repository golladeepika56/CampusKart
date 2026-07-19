import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications').then(({ data }) => setNotifications(data.notifications));
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-campus-navy/50">You're all caught up.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n._id}
              onClick={() => markRead(n._id)}
              className={`border rounded-xl p-3 text-sm cursor-pointer ${n.read ? 'border-campus-navy/10 text-campus-navy/50' : 'border-campus-gold bg-campus-gold/10'}`}
            >
              {n.payload?.message || n.payload?.preview || `New ${n.type} notification`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

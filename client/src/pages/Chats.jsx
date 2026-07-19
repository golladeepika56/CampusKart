import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Chats() {
  const [chats, setChats] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/chats').then(({ data }) => setChats(data.chats));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-6">Messages</h1>
      {chats.length === 0 ? (
        <p className="text-campus-navy/50">No conversations yet — message a seller from a listing to start one.</p>
      ) : (
        <ul className="divide-y divide-campus-navy/10 border border-campus-navy/10 rounded-xl overflow-hidden">
          {chats.map((chat) => {
            const other = chat.participants.find((p) => p._id !== user.id);
            return (
              <li key={chat._id}>
                <Link to={`/chats/${chat._id}`} className="flex items-center gap-3 p-4 hover:bg-campus-navy/5 transition">
                  <div className="w-10 h-10 rounded-full bg-campus-navy/10 flex items-center justify-center font-medium">
                    {other?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{other?.name}</p>
                    <p className="text-sm text-campus-navy/50 truncate">{chat.listing?.title}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

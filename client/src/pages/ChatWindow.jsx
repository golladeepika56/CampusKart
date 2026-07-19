import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';

export default function ChatWindow() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { user } = useAuthStore();
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    api.get(`/chats/${id}/messages`).then(({ data }) => setMessages(data.messages));

    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) socket.connect();
    socket.emit('chat:join', id);

    const onReceive = (msg) => {
      if (msg.chat === id) setMessages((prev) => [...prev, msg]);
    };
    socket.on('message:receive', onReceive);

    return () => socket.off('message:receive', onReceive);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current.emit('message:send', { chatId: id, text });
    setText('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
        {messages.map((m) => (
          <div key={m._id} className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
            m.sender === user.id ? 'bg-campus-navy text-campus-sand ml-auto' : 'bg-campus-navy/5'
          }`}>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..."
          className="flex-1 border border-campus-navy/20 rounded-full px-4 py-2.5" />
        <button className="bg-campus-navy text-campus-sand rounded-full px-5 font-medium">Send</button>
      </form>
    </div>
  );
}

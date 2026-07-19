import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MessageCircle, Bell, PlusCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="border-b border-campus-navy/10 bg-campus-sand/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-campus-navy">
          <ShoppingBag size={22} className="text-campus-gold" />
          CampusKart
        </Link>

        {user ? (
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link to="/create" className="flex items-center gap-1 text-campus-moss hover:text-campus-navy transition">
              <PlusCircle size={18} /> Sell
            </Link>
            <Link to="/chats" className="text-campus-navy/80 hover:text-campus-navy transition">
              <MessageCircle size={18} />
            </Link>
            <Link to="/notifications" className="text-campus-navy/80 hover:text-campus-navy transition">
              <Bell size={18} />
            </Link>
            <Link to="/profile" className="text-campus-navy/80 hover:text-campus-navy transition">
              {user.name?.split(' ')[0]}
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-campus-navy/50 hover:text-campus-navy transition"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/login" className="text-campus-navy/80 hover:text-campus-navy">Log in</Link>
            <Link to="/register" className="bg-campus-navy text-campus-sand px-4 py-2 rounded-full hover:bg-campus-navy/90 transition">
              Join CampusKart
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

import { create } from 'zustand';

const storedUser = localStorage.getItem('campuskart_user');

export const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('campuskart_token') || null,

  login: (user, token) => {
    localStorage.setItem('campuskart_user', JSON.stringify(user));
    localStorage.setItem('campuskart_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('campuskart_user');
    localStorage.removeItem('campuskart_token');
    set({ user: null, token: null });
  },
}));

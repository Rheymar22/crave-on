import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      isLoading:       false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', credentials);
          const { user, token } = res.data.data;

          localStorage.setItem('craveon_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });

          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            message: err.response?.data?.message || 'Login failed.',
          };
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          const { user, token } = res.data.data;

          localStorage.setItem('craveon_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });

          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            message: err.response?.data?.message || 'Registration failed.',
            errors:  err.response?.data?.errors || {},
          };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (_) {}
        localStorage.removeItem('craveon_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.data, isAuthenticated: true });
        } catch (_) {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('craveon_token');
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'craveon_auth',
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
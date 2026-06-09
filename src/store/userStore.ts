import { create } from 'zustand';
import { User, UserRole } from '../types';

interface UserState {
  user: User | null;
  currentRole: UserRole;
  setUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

const mockUser: User = {
  id: 'u001',
  name: '张丰收',
  phone: '138****5678',
  role: 'farmer',
  village: '红星村',
  group: '三组'
};

export const useUserStore = create<UserState>((set) => ({
  user: mockUser,
  currentRole: 'farmer',
  setUser: (user) => set({ user }),
  setRole: (role) => set({ currentRole: role }),
  logout: () => set({ user: null }),
}));

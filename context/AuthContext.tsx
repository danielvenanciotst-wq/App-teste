import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string) => Promise<boolean>;
  register: (user: User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { users, addUser } = useData();

  useEffect(() => {
    const storedId = localStorage.getItem('educa_current_user_id');
    if (storedId) {
      const found = users.find(u => u.id === storedId);
      if (found) setCurrentUser(found);
    }
  }, [users]);

  const login = async (email: string): Promise<boolean> => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('educa_current_user_id', user.id);
      return true;
    }
    return false;
  };

  const register = async (user: User): Promise<void> => {
    addUser(user);
    if (user.role === UserRole.STUDENT) {
      // Auto login students
      setCurrentUser(user);
      localStorage.setItem('educa_current_user_id', user.id);
    }
    // Teachers need approval, so no auto-login to dashboard, but we might redirect them to a "pending" page.
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('educa_current_user_id');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, name: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  verifyEmailSimulate: () => void;
  logout: () => Promise<void>;
  isEmulator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const user = await authService.register(email, password, name);
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const user = await authService.loginWithGoogle();
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await authService.sendPasswordReset(email);
    } catch (error) {
      throw error;
    }
  };

  const sendVerification = async () => {
    try {
      await authService.sendVerification();
    } catch (error) {
      throw error;
    }
  };

  const verifyEmailSimulate = () => {
    authService.verifyEmailSimulate();
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    loginWithGoogle,
    sendPasswordReset,
    sendVerification,
    verifyEmailSimulate,
    logout,
    isEmulator: authService.isEmulator
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

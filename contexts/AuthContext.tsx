'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, login as loginDirectus, logout as logoutDirectus, getCurrentUser, updateCurrentUser } from '@/lib/directus';
import { useSession } from '@/lib/useSession';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { session, saveSession, clearSession, isValid } = useSession();

  // Verificar si hay un usuario autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Si hay una sesión válida, obtener el usuario
        if (isValid()) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isValid, clearSession]);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginDirectus(email, password);

      // Guardamos la sesión en localStorage
      // La respuesta de loginDirectus ya es data.data, por lo que accedemos directamente a las propiedades
      if (response && response.access_token) {
        const sessionData = {
          accessToken: response.access_token,
          refreshToken: response.refresh_token || '',
          expires: Date.now() + (response.expires_in || 3600) * 1000, // Por defecto 1 hora
        };
        saveSession(sessionData);

        // Actualizamos el usuario actual
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        throw new Error('Invalid response from login');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutDirectus();
    } catch (error) {
      console.error('Logout error:', error);
      // Continuamos incluso si hay un error en el logout del servidor
    } finally {
      // Limpiamos la sesión local
      clearSession();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      clearSession();
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await updateCurrentUser(userData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    updateUser,
    isAuthenticated: isValid() && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
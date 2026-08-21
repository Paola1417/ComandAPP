import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { login as loginAPI } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

const getStoredUser = () => {
  try {
    const u = localStorage.getItem('comandapp_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem('comandapp_token') || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = useCallback(async (correo, password) => {
    const result = await loginAPI(correo, password);
    const userData = result.user;
    const userToken = result.token;

    setUser(userData);
    setToken(userToken);
    localStorage.setItem('comandapp_token', userToken);
    localStorage.setItem('comandapp_user', JSON.stringify(userData));

    return result;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('comandapp_token');
    localStorage.removeItem('comandapp_user');
  }, []);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);
  const rol = useMemo(() => user?.rol || null, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    rol,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

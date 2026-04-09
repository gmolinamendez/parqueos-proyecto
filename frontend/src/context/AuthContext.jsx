import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getToken());

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    const userInfo = authService.getUserFromToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(data.access_token);
    setUser(userInfo);
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const isAdmin = user?.rol === 'administrador';
  const isVigilante = user?.rol === 'vigilante';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isVigilante, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

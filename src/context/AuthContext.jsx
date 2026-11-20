import { createContext, useContext, useState } from 'react';

const ADMIN_CREDENTIALS = {
  email: 'comidaria@admin.com',
  password: 'admin@comidaria',
};

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('comidaria_admin') === 'true'
  );
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setUser({ email, role: 'admin' });
      localStorage.setItem('comidaria_admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('comidaria_admin');
  };

  const value = { isAuthenticated, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

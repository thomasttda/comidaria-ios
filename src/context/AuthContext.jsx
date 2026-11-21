import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser({
          email: session.user.email,
          role: session.user.app_metadata?.role || 'admin',
        });
        localStorage.setItem('comidaria_admin', 'true');
      }
    });
  }, []);

  const login = async (email, password) => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error(error);
        return false;
      }
      setIsAuthenticated(true);
      setUser({ email, role: 'admin' });
      localStorage.setItem('comidaria_admin', 'true');
      return true;
    }
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('comidaria_admin');
  };

  const value = { isAuthenticated, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

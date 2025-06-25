import { useState, useEffect } from 'react';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: any | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    // Try to get token from localStorage or sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (token) {
      setAuthState({
        token,
        isAuthenticated: true,
        user: null, // Could parse user info from token if needed
      });
    }
  }, []);

  const login = (token: string, user?: any) => {
    localStorage.setItem('authToken', token);
    setAuthState({
      token,
      isAuthenticated: true,
      user: user || null,
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    setAuthState({
      token: null,
      isAuthenticated: false,
      user: null,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
}; 
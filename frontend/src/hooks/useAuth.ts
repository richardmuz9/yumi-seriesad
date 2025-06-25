import { useEffect, useState } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
  billing?: {
    hasAccessToImageGen: boolean;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    api.get('/api/auth/me')
      .then(response => {
        setUser(response.data);
        setError(null);
      })
      .catch(err => {
        setUser(null);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user
  };
} 
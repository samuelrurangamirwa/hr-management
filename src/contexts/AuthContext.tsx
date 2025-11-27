import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../App';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  hasPermission: (requiredRole: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  employee: 1
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh', data.refresh);
        return true;
      } else {
        // Handle error response
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          } else if (errorData.email) {
            errorMessage = errorData.email[0];
          } else if (errorData.password) {
            errorMessage = errorData.password[0];
          }
        } catch (e) {
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw so the Login component can handle it
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    // Check if user's role is in the required roles
    return requiredRoles.includes(user.role);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

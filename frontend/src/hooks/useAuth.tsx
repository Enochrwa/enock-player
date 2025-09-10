import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { authAPI, User } from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const isAuthenticated = !!user;

  // Initialize auth state from cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is authenticated by fetching profile
        const response = await authAPI.getProfile();
        if (response.success && response.data) {
          setUser(response.data.user);
        }
      } catch (error) {
        // User is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ identifier, password });

      if (response.success && response.data) {
        const { user: userData } = response.data;
        
        setUser(userData);
        dispatch(setCredentials({ user: userData }));

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);

      if (response.success && response.data) {
        const { user: newUser } = response.data;
        
        setUser(newUser);
        dispatch(setCredentials({ user: newUser }));

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(profileData);

      if (response.success && response.data) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Profile update failed' };
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Profile update failed'
      };
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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

export default useAuth;


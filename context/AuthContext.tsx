import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../lib/authService';
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';

interface User {
  id: number;
  email: string;
  name?: string;
  username?: string;
  phone?: string;
  imageUrl?: string;
  googleId?: string;
  createdAt: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginOrRegister: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserCredits: (newCredits: number) => void;
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
  const [isLoading, setIsLoading] = useState(true);

  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Handle notification data for credit updates
      const data = notification.request.content.data as any;
      
      if (data?.action === 'credits_updated' && typeof data?.newBalance === 'number') {
        // Update user credits immediately when notification is received
        setUser(prevUser => {
          if (prevUser) {
            return {
              ...prevUser,
              credits: data.newBalance as number
            };
          }
          return prevUser;
        });
      }

      return {
        shouldShowAlert: true, 
        shouldPlaySound: true, 
        shouldSetBadge: false, 
        shouldShowBanner: true,
        shouldShowList: false,
      };
    },
  });

  // Handle notification responses (when user taps on notification)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      
      if (data?.action === 'credits_updated') {
        // Refresh user data when notification is tapped
        refreshUser();
      }
    });

    return () => subscription.remove();
  }, []);

  // Handle app state changes to refresh user data when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // Refresh user data when app becomes active
        refreshUser();
      }
    });

    return () => subscription.remove();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token && token != 'mobile-token-placeholder') {
        const userData = await authService.getProfile();
        setUser(userData);
      }
      else {
        setUser(null)
      }
    } catch (error) {
      await AsyncStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      await AsyncStorage.setItem('authToken', response.token);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const loginOrRegister = async (email: string, password: string) => {
    try {
      const response = await authService.loginOrRegister(email, password);
      await AsyncStorage.setItem('authToken', response.token);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión o registrar');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      // console.error('Error during logout:', error);
      // Even if logout fails, clear local state
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const userData = await authService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      // console.error('Error refreshing user:', error);
    }
  };

  const updateUserCredits = (newCredits: number) => {
    setUser(prevUser => {
      if (prevUser) {
        return {
          ...prevUser,
          credits: newCredits
        };
      }
      return prevUser;
    });
  };

  useEffect(() => {
    checkAuthStatus();
  },[]);

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginOrRegister,
    logout,
    checkAuthStatus,
    refreshUser,
    updateUserCredits,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
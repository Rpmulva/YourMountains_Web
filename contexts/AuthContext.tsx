import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  provider: 'google' | 'facebook' | 'instagram' | 'email';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithInstagram: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth session
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // TODO: Implement actual email/password authentication
    // For now, mock authentication
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      provider: 'email',
    };
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signUp = async (email: string, password: string, name: string) => {
    // TODO: Implement actual email/password signup
    // For now, mock signup
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
      provider: 'email',
    };
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signInWithGoogle = async () => {
    // TODO: Implement Google OAuth
    // For now, mock Google signin
    const mockUser: User = {
      id: 'google_' + Date.now().toString(),
      email: 'user@gmail.com',
      name: 'Google User',
      photo: 'https://via.placeholder.com/150',
      provider: 'google',
    };
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signInWithFacebook = async () => {
    // TODO: Implement Facebook Login
    // For now, mock Facebook signin
    const mockUser: User = {
      id: 'facebook_' + Date.now().toString(),
      email: 'user@facebook.com',
      name: 'Facebook User',
      photo: 'https://via.placeholder.com/150',
      provider: 'facebook',
    };
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signInWithInstagram = async () => {
    // TODO: Implement Instagram / Facebook Login (Instagram Basic Display or FB with Instagram scope)
    // For now, mock Instagram signin
    const mockUser: User = {
      id: 'instagram_' + Date.now().toString(),
      email: 'user@instagram.com',
      name: 'Instagram User',
      photo: 'https://via.placeholder.com/150',
      provider: 'instagram',
    };
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithFacebook,
        signInWithInstagram,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

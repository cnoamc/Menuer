
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      console.log('Loading user from storage:', userData);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email);
      
      // Check if user exists in storage
      const usersData = await AsyncStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : {};
      
      if (users[email] && users[email].password === password) {
        // User exists and password matches
        const mockUser = {
          id: users[email].id,
          email,
          name: users[email].name,
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        console.log('Sign in successful');
      } else {
        // For demo purposes, allow any email/password combination
        const mockUser = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        console.log('Sign in successful (demo mode)');
      }
    } catch (error) {
      console.log('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      console.log('Signing up with name:', name, 'email:', email);
      
      // Store user credentials
      const usersData = await AsyncStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : {};
      
      const userId = Date.now().toString();
      users[email] = {
        id: userId,
        name,
        password,
      };
      
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      // Create user session
      const mockUser = {
        id: userId,
        email,
        name,
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      console.log('Sign up successful');
    } catch (error) {
      console.log('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.log('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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

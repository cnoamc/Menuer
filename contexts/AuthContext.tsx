
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  dietStartDate?: string;
  currentWeight?: number;
  goalWeight?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Profile images from Unsplash
const profileImages = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
];

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
          profileImage: users[email].profileImage,
          dietStartDate: users[email].dietStartDate,
          currentWeight: users[email].currentWeight,
          goalWeight: users[email].goalWeight,
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        console.log('Sign in successful');
      } else {
        // For demo purposes, allow any email/password combination
        const randomImage = profileImages[Math.floor(Math.random() * profileImages.length)];
        const mockUser = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          profileImage: randomImage,
          dietStartDate: new Date().toISOString(),
          currentWeight: 75,
          goalWeight: 70,
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
      const randomImage = profileImages[Math.floor(Math.random() * profileImages.length)];
      
      users[email] = {
        id: userId,
        name,
        password,
        profileImage: randomImage,
        dietStartDate: new Date().toISOString(),
        currentWeight: 75,
        goalWeight: 70,
      };
      
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      // Create user session
      const mockUser = {
        id: userId,
        email,
        name,
        profileImage: randomImage,
        dietStartDate: new Date().toISOString(),
        currentWeight: 75,
        goalWeight: 70,
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
      console.log('Starting sign out process...');
      
      // Clear user session from AsyncStorage first
      await AsyncStorage.removeItem('user');
      console.log('User session cleared from AsyncStorage');
      
      // Then clear user state - this will trigger the navigation in _layout.tsx
      setUser(null);
      console.log('User state set to null - sign out complete');
      
      // The navigation will be handled automatically by the useEffect in _layout.tsx
    } catch (error) {
      console.log('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Also update in users storage
      const usersData = await AsyncStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : {};
      if (users[user.email]) {
        users[user.email] = { ...users[user.email], ...updates };
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
      
      setUser(updatedUser);
      console.log('User profile updated');
    } catch (error) {
      console.log('Error updating user profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateUserProfile }}>
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

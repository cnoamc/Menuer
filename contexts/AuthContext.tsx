
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logAuth } from '@/utils/activityLogger';

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
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        await logAuth('USER_LOADED', 'User session restored from storage', { userId: parsedUser.id, email: parsedUser.email }, parsedUser.id, parsedUser.name);
      } else {
        await logAuth('NO_USER_SESSION', 'No existing user session found');
      }
    } catch (error) {
      console.log('Error loading user:', error);
      await logAuth('USER_LOAD_ERROR', 'Failed to load user session', { error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email);
      await logAuth('SIGN_IN_ATTEMPT', `User attempting to sign in with email: ${email}`, { email });
      
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
        await logAuth('SIGN_IN_SUCCESS', `User signed in successfully: ${mockUser.name}`, { userId: mockUser.id, email: mockUser.email }, mockUser.id, mockUser.name);
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
        await logAuth('SIGN_IN_SUCCESS_DEMO', `User signed in (demo mode): ${mockUser.name}`, { userId: mockUser.id, email: mockUser.email }, mockUser.id, mockUser.name);
      }
    } catch (error) {
      console.log('Error signing in:', error);
      await logAuth('SIGN_IN_ERROR', `Sign in failed for email: ${email}`, { email, error: String(error) });
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      console.log('Signing up with name:', name, 'email:', email);
      await logAuth('SIGN_UP_ATTEMPT', `New user attempting to sign up: ${name} (${email})`, { name, email });
      
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
      await logAuth('SIGN_UP_SUCCESS', `New user account created: ${name}`, { userId, email, name }, userId, name);
    } catch (error) {
      console.log('Error signing up:', error);
      await logAuth('SIGN_UP_ERROR', `Sign up failed for: ${name} (${email})`, { name, email, error: String(error) });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      const currentUser = user;
      
      await logAuth('SIGN_OUT_ATTEMPT', `User attempting to sign out: ${currentUser?.name}`, { userId: currentUser?.id, email: currentUser?.email }, currentUser?.id, currentUser?.name);
      
      // Clear user session from AsyncStorage first
      await AsyncStorage.removeItem('user');
      console.log('User session cleared from AsyncStorage');
      
      // Then clear user state - this will trigger the navigation in _layout.tsx
      setUser(null);
      console.log('User state set to null - sign out complete');
      
      await logAuth('SIGN_OUT_SUCCESS', `User signed out successfully: ${currentUser?.name}`, { userId: currentUser?.id, email: currentUser?.email });
      
      // The navigation will be handled automatically by the useEffect in _layout.tsx
    } catch (error) {
      console.log('Error signing out:', error);
      await logAuth('SIGN_OUT_ERROR', 'Sign out failed', { error: String(error), userId: user?.id }, user?.id, user?.name);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) return;
      
      console.log('Updating user profile:', updates);
      await logAuth('PROFILE_UPDATE_ATTEMPT', `User attempting to update profile: ${user.name}`, { userId: user.id, updates }, user.id, user.name);
      
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
      
      // Log specific update details
      const updateDetails = Object.keys(updates).map(key => `${key}: ${JSON.stringify(updates[key as keyof User])}`).join(', ');
      await logAuth('PROFILE_UPDATE_SUCCESS', `Profile updated for ${user.name}: ${updateDetails}`, { userId: user.id, updates }, user.id, user.name);
    } catch (error) {
      console.log('Error updating user profile:', error);
      await logAuth('PROFILE_UPDATE_ERROR', `Profile update failed for ${user?.name}`, { userId: user?.id, updates, error: String(error) }, user?.id, user?.name);
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

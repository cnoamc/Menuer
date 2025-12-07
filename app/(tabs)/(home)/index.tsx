
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      // If user is authenticated, redirect to dashboard
      console.log('User authenticated, redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
    } else {
      // If user is not authenticated, redirect to welcome screen
      console.log('User not authenticated, redirecting to welcome');
      router.replace('/auth/welcome');
    }
  }, [user, isLoading]);

  // Show loading state while checking authentication
  return (
    <View style={[styles.container, styles.centerContent]}>
      <IconSymbol 
        ios_icon_name="fork.knife" 
        android_material_icon_name="restaurant" 
        size={60} 
        color={colors.primary}
      />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
  },
});

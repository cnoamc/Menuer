
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting sign in with:', email);
      await signIn(email, password);
      console.log('Sign in successful, navigating to dashboard');
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.log('Sign in error:', error);
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <IconSymbol 
          ios_icon_name="chevron.left" 
          android_material_icon_name="arrow_back" 
          size={24} 
          color={colors.text}
        />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconSymbol 
            ios_icon_name="person.circle" 
            android_material_icon_name="account_circle" 
            size={40} 
            color={colors.primary}
          />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol 
              ios_icon_name="envelope" 
              android_material_icon_name="email" 
              size={18} 
              color={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol 
              ios_icon_name="lock" 
              android_material_icon_name="lock" 
              size={18} 
              color={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.secondaryButtonText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: colors.text,
    marginLeft: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.card,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.secondary,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});

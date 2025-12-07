
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      icon: 'sparkles',
      androidIcon: 'auto_awesome',
      title: 'Unlimited Menus',
      description: 'Generate unlimited personalized meal plans',
    },
    {
      icon: 'fork.knife',
      androidIcon: 'restaurant',
      title: 'Multiple Diets',
      description: 'Support for various diet types',
    },
    {
      icon: 'clock.arrow.circlepath',
      androidIcon: 'history',
      title: 'Track History',
      description: 'Access all your previous meal plans',
    },
    {
      icon: 'heart.circle',
      androidIcon: 'favorite',
      title: 'Health Focused',
      description: 'Nutritionally balanced meals',
    },
  ];

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting sign up with:', { name, email });
      await signUp(name, email, password);
      console.log('Sign up successful, navigating to survey');
      router.replace('/auth/survey');
    } catch (error) {
      console.log('Sign up error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
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
            ios_icon_name="person.badge.plus" 
            android_material_icon_name="person_add" 
            size={60} 
            color={colors.primary}
          />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Generate unlimited personalized meal plans for any diet type</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol 
              ios_icon_name="person" 
              android_material_icon_name="person" 
              size={20} 
              color={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol 
              ios_icon_name="envelope" 
              android_material_icon_name="email" 
              size={20} 
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
              size={20} 
              color={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol 
              ios_icon_name="lock" 
              android_material_icon_name="lock" 
              size={20} 
              color={colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.primaryButtonText}>Get Started</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/signin')}
        >
          <Text style={styles.secondaryButtonText}>Sign In with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tertiaryButton}
          onPress={() => router.push('/auth/signin')}
        >
          <Text style={styles.tertiaryButtonText}>Already have an account?</Text>
        </TouchableOpacity>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresSection}>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <View style={styles.featureItem}>
                <IconSymbol 
                  ios_icon_name={feature.icon} 
                  android_material_icon_name={feature.androidIcon as any} 
                  size={24} 
                  color={colors.primary}
                />
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>
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
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.secondary,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  secondaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
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
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
  },
  tertiaryButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

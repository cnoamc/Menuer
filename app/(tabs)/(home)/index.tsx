
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      icon: 'restaurant_menu',
      title: 'Unlimited Menus',
      description: 'Generate personalized meal plans tailored to your diet',
    },
    {
      icon: 'favorite',
      title: 'Health Focused',
      description: 'Nutritionally balanced meals for your wellness goals',
    },
    {
      icon: 'history',
      title: 'Track History',
      description: 'Access all your previous menus anytime',
    },
    {
      icon: 'restaurant',
      title: 'Multiple Diets',
      description: 'Support for Keto, Vegan, Paleo, and more',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconSymbol 
            ios_icon_name="fork.knife" 
            android_material_icon_name="restaurant" 
            size={60} 
            color={colors.primary}
          />
        </View>
        <Text style={styles.title}>DietMenu Pro</Text>
        <Text style={styles.subtitle}>Your Personal Menu Generator</Text>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroText}>
          Generate unlimited personalized meal plans for any diet type
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Features</Text>
        {features.map((feature, index) => (
          <React.Fragment key={index}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <IconSymbol 
                  ios_icon_name={feature.icon} 
                  android_material_icon_name={feature.icon as any} 
                  size={32} 
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>

      <View style={styles.ctaSection}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/auth/signin')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <IconSymbol 
            ios_icon_name="arrow.right" 
            android_material_icon_name="arrow_forward" 
            size={20} 
            color={colors.card}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Join thousands of users creating healthy meal plans
        </Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  heroSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  heroText: {
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ctaSection: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    boxShadow: '0px 4px 12px rgba(143, 188, 143, 0.3)',
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

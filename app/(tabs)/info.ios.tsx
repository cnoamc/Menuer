
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { logNavigation } from '@/utils/activityLogger';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function InfoScreen() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logNavigation('SCREEN_VIEW', 'User viewed Info screen', { userId: user?.id }, user?.id, user?.name);
  }, []);

  const infoSections = [
    {
      icon: 'info.circle.fill',
      androidIcon: 'info',
      title: 'About Menuer',
      description: 'Menuer is your personal AI-powered meal planning assistant. We help you achieve your health goals through personalized nutrition plans.',
      color: colors.primary,
    },
    {
      icon: 'sparkles',
      androidIcon: 'auto_awesome',
      title: 'AI-Powered Menus',
      description: 'Our advanced AI generates customized meal plans based on your dietary preferences, goals, and nutritional needs.',
      color: colors.secondary,
    },
    {
      icon: 'heart.fill',
      androidIcon: 'favorite',
      title: 'Health Tracking',
      description: 'Track your weight, calories, macros, and progress towards your health goals with our comprehensive tracking tools.',
      color: colors.accent,
    },
    {
      icon: 'leaf.fill',
      androidIcon: 'eco',
      title: 'Multiple Diet Types',
      description: 'Support for Keto, Vegan, Mediterranean, Paleo, and many more diet types to match your lifestyle.',
      color: colors.success,
    },
  ];

  const features = [
    { icon: 'chart.bar.fill', androidIcon: 'bar_chart', title: 'Progress Tracking', description: 'Monitor your journey' },
    { icon: 'calendar', androidIcon: 'calendar_today', title: 'Menu History', description: 'Access past meal plans' },
    { icon: 'person.fill', androidIcon: 'person', title: 'Profile Management', description: 'Customize your experience' },
    { icon: 'bell.fill', androidIcon: 'notifications', title: 'Reminders', description: 'Stay on track' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <IconSymbol 
            ios_icon_name="fork.knife.circle.fill" 
            android_material_icon_name="restaurant" 
            size={64} 
            color={colors.primary}
          />
        </View>
        <Text style={styles.headerTitle}>Menuer</Text>
        <Text style={styles.headerSubtitle}>Your Personal Meal Planning Assistant</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What We Offer</Text>
        {infoSections.map((section, index) => (
          <View key={index} style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: section.color }]}>
              <IconSymbol 
                ios_icon_name={section.icon} 
                android_material_icon_name={section.androidIcon as any} 
                size={32} 
                color={colors.card}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{section.title}</Text>
              <Text style={styles.infoDescription}>{section.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <IconSymbol 
                  ios_icon_name={feature.icon} 
                  android_material_icon_name={feature.androidIcon as any} 
                  size={28} 
                  color={colors.primary}
                />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get Started</Text>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to transform your diet?</Text>
          <Text style={styles.ctaDescription}>
            Start your journey to better health with personalized meal plans tailored to your goals.
          </Text>
          {!user && (
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => {
                logNavigation('NAVIGATION', 'User navigating to Welcome from Info', { from: 'info', to: 'welcome' });
                router.push('/auth/welcome');
              }}
            >
              <Text style={styles.ctaButtonText}>Get Started</Text>
              <IconSymbol 
                ios_icon_name="arrow.right.circle.fill" 
                android_material_icon_name="arrow_circle_right" 
                size={24} 
                color={colors.card}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
        <Text style={styles.footerText}>© 2024 Menuer. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  infoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ctaCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    color: colors.card,
    opacity: 0.9,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.highlight,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});

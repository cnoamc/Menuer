
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const getStreak = () => {
    if (!user?.surveyCompletedAt) return 0;
    const startDate = new Date(user.surveyCompletedAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const streak = getStreak();
  const progress = Math.min(100, (streak / 30) * 100);

  const features = [
    {
      icon: 'sparkles',
      androidIcon: 'auto_awesome',
      title: 'AI-Powered Menus',
      description: 'Generate personalized meal plans tailored to your diet',
      color: colors.primary,
    },
    {
      icon: 'chart.line.uptrend.xyaxis',
      androidIcon: 'trending_up',
      title: 'Track Progress',
      description: 'Monitor your weight and diet journey over time',
      color: colors.secondary,
    },
    {
      icon: 'fork.knife',
      androidIcon: 'restaurant',
      title: 'Multiple Diets',
      description: 'Support for Keto, Vegan, Mediterranean, and more',
      color: colors.accent,
    },
    {
      icon: 'calendar',
      androidIcon: 'calendar_today',
      title: 'Menu History',
      description: 'Access all your previous meal plans anytime',
      color: colors.primary,
    },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={true}
      bounces={true}
    >
      {user && (
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Good morning,</Text>
          <Text style={styles.greetingSubtitle}>Track your diet</Text>
        </View>
      )}

      {user && (
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>Welcome back, {user.name}!</Text>
              <Text style={styles.welcomeSubtitle}>Ready to plan your next meal?</Text>
            </View>
            {user.profileImage && (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.welcomeProfileImage}
              />
            )}
          </View>
          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={() => router.push('/(tabs)/dashboard')}
          >
            <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
            <IconSymbol 
              ios_icon_name="arrow.right" 
              android_material_icon_name="arrow_forward" 
              size={20} 
              color={colors.card}
            />
          </TouchableOpacity>
        </View>
      )}

      {user && (
        <View style={styles.streakSection}>
          <View style={styles.streakCard}>
            <View style={styles.streakCircleContainer}>
              <View style={styles.streakCircleOuter}>
                <View style={styles.streakCircleMiddle}>
                  <View style={styles.streakCircleInner}>
                    <IconSymbol 
                      ios_icon_name="flame.fill" 
                      android_material_icon_name="local_fire_department" 
                      size={48} 
                      color={colors.accent}
                    />
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <Text style={styles.streakLabel}>Days</Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.streakTitle}>Your Streak</Text>
            <Text style={styles.streakDescription}>
              Keep going! You&apos;ve been consistent for {streak} days
            </Text>
          </View>
        </View>
      )}

      {!user && (
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: feature.color }]}>
                  <IconSymbol 
                    ios_icon_name={feature.icon} 
                    android_material_icon_name={feature.androidIcon as any} 
                    size={32} 
                    color={colors.card}
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!user && (
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Start Your Journey?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of users achieving their diet goals
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/auth/welcome')}
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
            <IconSymbol 
              ios_icon_name="arrow.right.circle.fill" 
              android_material_icon_name="arrow_circle_right" 
              size={24} 
              color={colors.card}
            />
          </TouchableOpacity>
        </View>
      )}

      {user && (
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/diet/select')}
            >
              <IconSymbol 
                ios_icon_name="fork.knife" 
                android_material_icon_name="restaurant" 
                size={32} 
                color={colors.primary}
              />
              <Text style={styles.quickActionText}>Change Diet</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/menus/history')}
            >
              <IconSymbol 
                ios_icon_name="clock.arrow.circlepath" 
                android_material_icon_name="history" 
                size={32} 
                color={colors.secondary}
              />
              <Text style={styles.quickActionText}>Menu History</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <IconSymbol 
                ios_icon_name="person.circle" 
                android_material_icon_name="account_circle" 
                size={32} 
                color={colors.accent}
              />
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  greetingSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  streakSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  streakCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  streakCircleContainer: {
    marginBottom: 24,
  },
  streakCircleOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCircleMiddle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  streakTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  streakDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    marginHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.card,
    opacity: 0.9,
  },
  welcomeProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.card,
  },
  dashboardButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 8,
  },
  featuresSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featureIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    marginHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: colors.card,
    opacity: 0.9,
    marginBottom: 24,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 12,
  },
  quickActionsSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
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
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
});

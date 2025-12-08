
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { streakManager } from '@/utils/streakManager';
import { notificationManager } from '@/utils/notificationManager';
import { logSystem } from '@/utils/activityLogger';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [canTapToday, setCanTapToday] = useState(true);
  const [bounceAnim] = useState(new Animated.Value(1));
  const [fireAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (user) {
      loadStreak();
      setupNotifications();
    }
  }, [user]);

  const loadStreak = async () => {
    if (!user) return;
    
    try {
      const streakData = await streakManager.getStreakData(user.id);
      setStreak(streakData.count);
      
      // Check if already tapped today
      const today = new Date().toDateString();
      setCanTapToday(streakData.lastTapDate !== today);
      
      console.log('Streak loaded:', streakData.count, 'Can tap today:', streakData.lastTapDate !== today);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const setupNotifications = async () => {
    try {
      const hasPermission = await notificationManager.requestPermissions();
      if (hasPermission) {
        await notificationManager.scheduleDailyStreakReminder();
        console.log('Streak reminder notifications set up');
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const handleStreakTap = async () => {
    if (!user) return;
    
    if (!canTapToday) {
      Alert.alert(
        'Already Tapped Today!',
        'You\'ve already maintained your streak today. Come back tomorrow!',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Animate bounce and fire
      Animated.sequence([
        Animated.parallel([
          Animated.spring(bounceAnim, {
            toValue: 1.2,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(fireAnim, {
            toValue: 1.3,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(fireAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Increment streak
      const newStreakData = await streakManager.incrementStreak(user.id);
      setStreak(newStreakData.count);
      setCanTapToday(false);
      
      await logSystem('STREAK_TAPPED', `User tapped streak, new count: ${newStreakData.count}`, {
        userId: user.id,
        newStreak: newStreakData.count,
      });

      // Show success message
      Alert.alert(
        '🔥 Streak Updated!',
        `Great job! Your streak is now ${newStreakData.count} days!`,
        [{ text: 'Awesome!' }]
      );

      // Haptic success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating streak:', error);
      Alert.alert('Error', 'Failed to update streak. Please try again.');
    }
  };

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

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

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
          <TouchableOpacity 
            style={styles.streakCard}
            onPress={handleStreakTap}
            activeOpacity={0.8}
          >
            <Animated.View 
              style={[
                styles.streakGlow,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: bounceAnim }],
                },
              ]}
            />
            <Animated.View 
              style={[
                styles.streakCircleContainer,
                { transform: [{ scale: bounceAnim }] },
              ]}
            >
              <View style={styles.streakCircleOuter}>
                <View style={styles.streakCircleMiddle}>
                  <View style={styles.streakCircleInner}>
                    <Animated.View style={{ transform: [{ scale: fireAnim }] }}>
                      <IconSymbol 
                        ios_icon_name="flame.fill" 
                        android_material_icon_name="local_fire_department" 
                        size={48} 
                        color={colors.accent}
                      />
                    </Animated.View>
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <Text style={styles.streakLabel}>Days</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
            <Text style={styles.streakTitle}>Your Streak</Text>
            <Text style={styles.streakDescription}>
              {canTapToday 
                ? 'Tap to maintain your streak today!' 
                : `Great! You've maintained your streak for ${streak} days`}
            </Text>
            {canTapToday && (
              <View style={styles.tapIndicator}>
                <IconSymbol 
                  ios_icon_name="hand.tap" 
                  android_material_icon_name="touch_app" 
                  size={20} 
                  color={colors.primary}
                />
                <Text style={styles.tapIndicatorText}>Tap to continue streak</Text>
              </View>
            )}
          </TouchableOpacity>
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
    position: 'relative',
    overflow: 'hidden',
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
  streakGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: colors.accent,
    borderRadius: 200,
  },
  streakCircleContainer: {
    marginBottom: 24,
    zIndex: 1,
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
    zIndex: 1,
  },
  streakDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    zIndex: 1,
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.lightPurple,
    borderRadius: 20,
    zIndex: 1,
  },
  tapIndicatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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

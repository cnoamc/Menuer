
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';
import { logNavigation } from '@/utils/activityLogger';
import { StreakWidget } from '@/components/widgets/StreakWidget';
import { WeightWidget } from '@/components/widgets/WeightWidget';
import { CaloriesWidget } from '@/components/widgets/CaloriesWidget';
import { MiniCalendarWidget } from '@/components/widgets/MiniCalendarWidget';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { menus, currentDiet } = useMenu();

  useEffect(() => {
    if (!user && !isLoading) {
      console.log('User not authenticated, redirecting to sign in');
      logNavigation('REDIRECT', 'User redirected to sign in (not authenticated)', { from: 'dashboard', to: 'signin' });
      router.replace('/auth/signin');
    } else if (user) {
      logNavigation('SCREEN_VIEW', 'User viewed Dashboard screen', { userId: user.id, menuCount: menus.length, hasDiet: !!currentDiet }, user.id, user.name);
    }
  }, [user, isLoading]);

  const handleLogWeight = () => {
    logNavigation('NAVIGATION', 'User navigating to Profile to log weight', { from: 'dashboard', to: 'profile' }, user?.id, user?.name);
    router.push('/(tabs)/profile');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const getDaysSinceDietStarted = () => {
    if (!user.surveyCompletedAt) return 0;
    const startDate = new Date(user.surveyCompletedAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAverageCalories = () => {
    if (menus.length === 0) return 0;
    const total = menus.reduce((sum, menu) => sum + menu.totalCalories, 0);
    return Math.round(total / menus.length);
  };

  const getActiveDaysThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const activeDays: number[] = [];
    menus.forEach(menu => {
      const menuDate = new Date(menu.date);
      if (menuDate >= startOfWeek && menuDate <= today) {
        activeDays.push(menuDate.getDay());
      }
    });
    
    return [...new Set(activeDays)];
  };

  const daysSinceDietStarted = getDaysSinceDietStarted();
  const averageCalories = getAverageCalories();
  const activeDays = getActiveDaysThisWeek();
  const currentWeight = user.currentWeight || user.weight || 0;
  const goalWeight = user.goalWeight || 0;
  const initialWeight = user.initialWeight || user.weight || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pageTitle}>Dashboard</Text>
          <Text style={styles.pageSubtitle}>Track your progress</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => {
            logNavigation('NAVIGATION', 'User navigating to Profile from Dashboard', { from: 'dashboard', to: 'profile' }, user?.id, user?.name);
            router.push('/(tabs)/profile');
          }}
        >
          {user.profileImage ? (
            <Image 
              source={{ uri: user.profileImage }} 
              style={styles.profileImage}
            />
          ) : (
            <IconSymbol 
              ios_icon_name="person.circle.fill" 
              android_material_icon_name="account_circle" 
              size={48} 
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.thisWeekSection}>
        <MiniCalendarWidget activeDays={activeDays} />
      </View>

      <Text style={styles.sectionTitle}>Your Progress</Text>

      <View style={styles.widgetsSection}>
        <View style={styles.widgetRow}>
          <View style={styles.widgetHalf}>
            <WeightWidget 
              currentWeight={currentWeight}
              goalWeight={goalWeight}
              initialWeight={initialWeight}
              onLogWeight={handleLogWeight}
            />
          </View>
          <View style={styles.widgetHalf}>
            <StreakWidget streak={daysSinceDietStarted} />
          </View>
        </View>

        <CaloriesWidget 
          averageCalories={averageCalories}
          percentageChange={90}
        />
      </View>

      {currentDiet && (
        <View style={styles.dietCard}>
          <View style={styles.dietCardHeader}>
            <Text style={styles.dietCardTitle}>Your Diet Plan</Text>
            <TouchableOpacity onPress={() => {
              logNavigation('NAVIGATION', 'User navigating to Diet Selection from Dashboard diet card', { from: 'dashboard', to: 'diet-select' }, user?.id, user?.name);
              router.push('/diet/select');
            }}>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dietInfo}>
            <View style={styles.dietIconContainer}>
              <IconSymbol 
                ios_icon_name={currentDiet.icon} 
                android_material_icon_name={currentDiet.icon as any} 
                size={40} 
                color={colors.primary}
              />
            </View>
            <View style={styles.dietDetails}>
              <Text style={styles.dietName}>{currentDiet.name}</Text>
              <Text style={styles.dietDescription}>{currentDiet.description}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.menusSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Menus</Text>
          <TouchableOpacity onPress={() => {
            logNavigation('NAVIGATION', 'User navigating to Menu History from Dashboard', { from: 'dashboard', to: 'menu-history', menuCount: menus.length }, user?.id, user?.name);
            router.push('/menus/history');
          }}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        {menus.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              ios_icon_name="tray" 
              android_material_icon_name="inbox" 
              size={48} 
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No menus yet</Text>
            <Text style={styles.emptyStateSubtext}>Use AI Planner to generate your first menu</Text>
          </View>
        ) : (
          menus.slice(0, 3).map((menu, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuCard}
              onPress={() => {
                logNavigation('NAVIGATION', 'User viewing menu details from Dashboard', { from: 'dashboard', to: 'menu-detail', menuId: menu.id, dietType: menu.dietType }, user?.id, user?.name);
                router.push(`/menus/${menu.id}`);
              }}
            >
              <View style={styles.menuCardHeader}>
                <View style={styles.menuIconContainer}>
                  <IconSymbol 
                    ios_icon_name="fork.knife" 
                    android_material_icon_name="restaurant" 
                    size={24} 
                    color={colors.primary}
                  />
                </View>
                <View style={styles.menuCardInfo}>
                  <Text style={styles.menuCardTitle}>{menu.dietType} Menu</Text>
                  <Text style={styles.menuCardDate}>
                    {new Date(menu.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.menuCardFooter}>
                <View style={styles.calorieInfo}>
                  <IconSymbol 
                    ios_icon_name="flame" 
                    android_material_icon_name="local_fire_department" 
                    size={16} 
                    color={colors.accent}
                  />
                  <Text style={styles.calorieText}>{menu.totalCalories} cal</Text>
                </View>
                <Text style={styles.mealCount}>
                  {3 + menu.snacks.length} meals
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity 
        style={styles.aiPlannerButton}
        onPress={() => {
          logNavigation('NAVIGATION', 'User navigating to AI Planner from Dashboard', { from: 'dashboard', to: 'ai-planner' }, user?.id, user?.name);
          router.push('/(tabs)/ai-planner');
        }}
      >
        <IconSymbol 
          ios_icon_name="sparkles" 
          android_material_icon_name="auto_awesome" 
          size={24} 
          color={colors.card}
        />
        <Text style={styles.aiPlannerButtonText}>Open AI Planner</Text>
      </TouchableOpacity>
    </ScrollView>
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
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  profileButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  thisWeekSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  widgetsSection: {
    gap: 16,
    marginBottom: 24,
  },
  widgetRow: {
    flexDirection: 'row',
    gap: 16,
  },
  widgetHalf: {
    flex: 1,
  },
  dietCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  dietCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dietCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  dietInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dietIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dietDetails: {
    flex: 1,
  },
  dietName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  dietDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  menusSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuCardInfo: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuCardDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.highlight,
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
  },
  mealCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  aiPlannerButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  aiPlannerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
    marginLeft: 12,
  },
});

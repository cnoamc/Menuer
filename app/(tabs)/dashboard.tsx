
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';
import { logNavigation } from '@/utils/activityLogger';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { menus, currentDiet, generateMenu } = useMenu();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (!user && !isLoading) {
      console.log('User not authenticated, redirecting to sign in');
      logNavigation('REDIRECT', 'User redirected to sign in (not authenticated)', { from: 'dashboard', to: 'signin' });
      router.replace('/auth/signin');
    } else if (user) {
      logNavigation('SCREEN_VIEW', 'User viewed Dashboard screen', { userId: user.id, menuCount: menus.length, hasDiet: !!currentDiet }, user.id, user.name);
    }
  }, [user, isLoading]);

  const handleGenerateMenu = async () => {
    if (!currentDiet) {
      logNavigation('MENU_GENERATION_BLOCKED', 'Menu generation blocked - no diet selected', { userId: user?.id }, user?.id, user?.name);
      Alert.alert('Select a Diet', 'Please select a diet type first', [
        { 
          text: 'Select Diet', 
          onPress: () => {
            logNavigation('NAVIGATION', 'User navigating to Diet Selection from alert', { from: 'dashboard', to: 'diet-select' }, user?.id, user?.name);
            router.push('/diet/select');
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    setIsGenerating(true);
    try {
      await generateMenu();
      Alert.alert('Success', 'New menu generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate menu. Please try again.');
      console.log('Generate menu error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Calculate days since diet started
  const getDaysSinceDietStarted = () => {
    if (!user.surveyCompletedAt) return 0;
    const startDate = new Date(user.surveyCompletedAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate weight progress based on actual logged data
  const getWeightProgress = () => {
    // Use initialWeight from survey, or fall back to weight field
    const startWeight = user.initialWeight || user.weight || user.currentWeight || 0;
    const currentWeight = user.currentWeight || user.weight || 0;
    const goalWeight = user.goalWeight || 0;

    console.log('Weight Progress Calculation:', {
      startWeight,
      currentWeight,
      goalWeight,
      user: {
        initialWeight: user.initialWeight,
        weight: user.weight,
        currentWeight: user.currentWeight,
        goalWeight: user.goalWeight,
      }
    });

    // If we don't have valid data, return 0
    if (!startWeight || !goalWeight || startWeight === goalWeight) {
      return 0;
    }

    // Calculate total weight to lose/gain
    const totalChange = startWeight - goalWeight;
    
    // Calculate weight already lost/gained
    const currentChange = startWeight - currentWeight;
    
    // Calculate percentage (ensure it's between 0 and 100)
    const percentage = Math.max(0, Math.min(100, (currentChange / totalChange) * 100));
    
    return percentage;
  };

  // Calculate weight remaining to goal
  const getWeightToGo = () => {
    const currentWeight = user.currentWeight || user.weight || 0;
    const goalWeight = user.goalWeight || 0;
    return Math.max(0, Math.abs(currentWeight - goalWeight));
  };

  const todayMenus = menus.filter(menu => {
    const menuDate = new Date(menu.date);
    const today = new Date();
    return menuDate.toDateString() === today.toDateString();
  });

  const userName = user.name || 'User';
  const daysSinceDietStarted = getDaysSinceDietStarted();
  const weightProgress = getWeightProgress();
  const weightToGo = getWeightToGo();
  const currentWeight = user.currentWeight || user.weight || 0;
  const goalWeight = user.goalWeight || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with Profile */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('@/assets/images/1e765c28-78bc-4645-9ade-56e403f9a292.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Text style={styles.greeting}>Welcome back, {userName}!</Text>
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

      {/* Analytics Cards */}
      <View style={styles.analyticsSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        
        <View style={styles.analyticsGrid}>
          {/* Days on Diet */}
          <View style={[styles.analyticsCard, styles.primaryCard]}>
            <View style={styles.analyticsIconContainer}>
              <IconSymbol 
                ios_icon_name="calendar" 
                android_material_icon_name="calendar_today" 
                size={28} 
                color={colors.card}
              />
            </View>
            <Text style={styles.analyticsNumber}>{daysSinceDietStarted}</Text>
            <Text style={styles.analyticsLabel}>Days on Diet</Text>
          </View>

          {/* Current Diet */}
          <View style={[styles.analyticsCard, styles.secondaryCard]}>
            <View style={styles.analyticsIconContainer}>
              <IconSymbol 
                ios_icon_name="fork.knife" 
                android_material_icon_name="restaurant" 
                size={28} 
                color={colors.card}
              />
            </View>
            <Text style={styles.analyticsText}>{currentDiet?.name || 'None'}</Text>
            <Text style={styles.analyticsLabel}>Current Diet</Text>
          </View>
        </View>

        {/* Weight Progress Card */}
        <View style={styles.weightCard}>
          <View style={styles.weightHeader}>
            <View>
              <Text style={styles.weightTitle}>Weight Progress</Text>
              <Text style={styles.weightSubtitle}>Keep up the great work!</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chart.line.uptrend.xyaxis" 
              android_material_icon_name="trending_up" 
              size={32} 
              color={colors.primary}
            />
          </View>
          
          <View style={styles.weightStats}>
            <View style={styles.weightStatItem}>
              <Text style={styles.weightStatLabel}>Current</Text>
              <Text style={styles.weightStatValue}>{currentWeight.toFixed(1)} kg</Text>
            </View>
            <View style={styles.weightStatDivider} />
            <View style={styles.weightStatItem}>
              <Text style={styles.weightStatLabel}>Goal</Text>
              <Text style={styles.weightStatValue}>{goalWeight.toFixed(1)} kg</Text>
            </View>
            <View style={styles.weightStatDivider} />
            <View style={styles.weightStatItem}>
              <Text style={styles.weightStatLabel}>To Go</Text>
              <Text style={styles.weightStatValue}>{weightToGo.toFixed(1)} kg</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${weightProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{weightProgress.toFixed(0)}% Complete</Text>
          </View>
        </View>
      </View>

      {/* Current Diet Card */}
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

      {/* Generate Menu Button */}
      <TouchableOpacity 
        style={styles.generateButton}
        onPress={handleGenerateMenu}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color={colors.card} />
        ) : (
          <>
            <IconSymbol 
              ios_icon_name="sparkles" 
              android_material_icon_name="auto_awesome" 
              size={24} 
              color={colors.card}
            />
            <Text style={styles.generateButtonText}>Generate New Menu</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <IconSymbol 
            ios_icon_name="calendar" 
            android_material_icon_name="calendar_today" 
            size={28} 
            color={colors.accent}
          />
          <Text style={styles.statNumber}>{todayMenus.length}</Text>
          <Text style={styles.statLabel}>Today&apos;s Menus</Text>
        </View>
        <View style={styles.statCard}>
          <IconSymbol 
            ios_icon_name="list.bullet" 
            android_material_icon_name="list" 
            size={28} 
            color={colors.secondary}
          />
          <Text style={styles.statNumber}>{menus.length}</Text>
          <Text style={styles.statLabel}>Total Menus</Text>
        </View>
      </View>

      {/* Recent Menus */}
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
            <Text style={styles.emptyStateSubtext}>Generate your first menu to get started</Text>
          </View>
        ) : (
          menus.slice(0, 3).map((menu, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity 
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
            </React.Fragment>
          ))
        )}
      </View>
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
  appLogo: {
    width: 180,
    height: 50,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 16,
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
  analyticsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  analyticsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryCard: {
    backgroundColor: colors.primary,
  },
  secondaryCard: {
    backgroundColor: colors.secondary,
  },
  analyticsIconContainer: {
    marginBottom: 12,
  },
  analyticsNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 4,
  },
  analyticsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: colors.card,
    opacity: 0.9,
  },
  weightCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  weightSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  weightStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  weightStatItem: {
    alignItems: 'center',
  },
  weightStatDivider: {
    width: 1,
    backgroundColor: colors.highlight,
  },
  weightStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  weightStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: colors.highlight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  dietCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    backgroundColor: colors.highlight,
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
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  generateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
    marginLeft: 12,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  menusSection: {
    marginBottom: 20,
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
    backgroundColor: colors.highlight,
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
});


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { menus, currentDiet, generateMenu } = useMenu();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (!user && !isLoading) {
      console.log('User not authenticated, redirecting to sign in');
      router.replace('/auth/signin');
    }
  }, [user, isLoading]);

  const handleGenerateMenu = async () => {
    if (!currentDiet) {
      Alert.alert('Select a Diet', 'Please select a diet type first', [
        { text: 'Select Diet', onPress: () => router.push('/diet/select') },
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

  const todayMenus = menus.filter(menu => {
    const menuDate = new Date(menu.date);
    const today = new Date();
    return menuDate.toDateString() === today.toDateString();
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
          <Text style={styles.subGreeting}>Ready to plan your meals?</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <IconSymbol 
            ios_icon_name="person.circle" 
            android_material_icon_name="account_circle" 
            size={32} 
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.dietCard}>
        <View style={styles.dietCardHeader}>
          <Text style={styles.dietCardTitle}>Current Diet</Text>
          <TouchableOpacity onPress={() => router.push('/diet/select')}>
            <Text style={styles.changeButton}>Change</Text>
          </TouchableOpacity>
        </View>
        {currentDiet ? (
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
        ) : (
          <TouchableOpacity 
            style={styles.selectDietButton}
            onPress={() => router.push('/diet/select')}
          >
            <IconSymbol 
              ios_icon_name="plus.circle" 
              android_material_icon_name="add_circle" 
              size={24} 
              color={colors.primary}
            />
            <Text style={styles.selectDietText}>Select Your Diet</Text>
          </TouchableOpacity>
        )}
      </View>

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

      <View style={styles.menusSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Menus</Text>
          <TouchableOpacity onPress={() => router.push('/menus/history')}>
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
                onPress={() => router.push(`/menus/${menu.id}`)}
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
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
  selectDietButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.highlight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  selectDietText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
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

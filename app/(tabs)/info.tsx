
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { logNavigation } from '@/utils/activityLogger';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';
import { activityLogger, ActivityLog } from '@/utils/activityLogger';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { menus } = useMenu();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'auth' | 'menu' | 'profile' | 'diet' | 'navigation'>('all');

  useEffect(() => {
    logNavigation('SCREEN_VIEW', 'User viewed Analytics screen', { userId: user?.id }, user?.id, user?.name);
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const allLogs = await activityLogger.getLogs(100);
      setLogs(allLogs);
      console.log('Loaded activity logs:', allLogs.length);
    } catch (error) {
      console.log('Error loading logs:', error);
    }
  };

  const filterLogs = () => {
    if (selectedCategory === 'all') {
      return logs;
    }
    return logs.filter(log => log.eventCategory === selectedCategory);
  };

  const getActivityStats = () => {
    const authLogs = logs.filter(l => l.eventCategory === 'auth').length;
    const menuLogs = logs.filter(l => l.eventCategory === 'menu').length;
    const profileLogs = logs.filter(l => l.eventCategory === 'profile').length;
    const dietLogs = logs.filter(l => l.eventCategory === 'diet').length;
    const navigationLogs = logs.filter(l => l.eventCategory === 'navigation').length;

    return { authLogs, menuLogs, profileLogs, dietLogs, navigationLogs };
  };

  const getWeightHistory = () => {
    const weightLogs = logs.filter(log => 
      log.eventType === 'WEIGHT_UPDATE' && log.data?.newWeight
    );
    return weightLogs.map(log => ({
      date: new Date(log.timestamp).toLocaleDateString(),
      weight: log.data.newWeight,
    }));
  };

  const getMenuStats = () => {
    const totalMenus = menus.length;
    const thisWeekMenus = menus.filter(menu => {
      const menuDate = new Date(menu.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return menuDate >= weekAgo;
    }).length;

    const avgCalories = totalMenus > 0 
      ? Math.round(menus.reduce((sum, menu) => sum + menu.totalCalories, 0) / totalMenus)
      : 0;

    return { totalMenus, thisWeekMenus, avgCalories };
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Activity Logs',
      'Are you sure you want to clear all activity logs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await activityLogger.clearLogs();
            setLogs([]);
            Alert.alert('Success', 'Activity logs cleared successfully');
          },
        },
      ]
    );
  };

  const handleExportLogs = async () => {
    try {
      const exportData = await activityLogger.exportLogs();
      console.log('Exported logs:', exportData);
      Alert.alert('Export Complete', `Exported ${logs.length} activity logs to console. Check your developer console for the full data.`);
    } catch (error) {
      console.log('Error exporting logs:', error);
      Alert.alert('Error', 'Failed to export logs');
    }
  };

  const stats = getActivityStats();
  const menuStats = getMenuStats();
  const weightHistory = getWeightHistory();
  const filteredLogs = filterLogs();

  const categories = [
    { id: 'all', label: 'All', icon: 'list.bullet', androidIcon: 'list', count: logs.length },
    { id: 'auth', label: 'Auth', icon: 'lock.fill', androidIcon: 'lock', count: stats.authLogs },
    { id: 'menu', label: 'Menu', icon: 'fork.knife', androidIcon: 'restaurant', count: stats.menuLogs },
    { id: 'profile', label: 'Profile', icon: 'person.fill', androidIcon: 'person', count: stats.profileLogs },
    { id: 'diet', label: 'Diet', icon: 'leaf.fill', androidIcon: 'eco', count: stats.dietLogs },
    { id: 'navigation', label: 'Nav', icon: 'arrow.right.circle.fill', androidIcon: 'navigation', count: stats.navigationLogs },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <IconSymbol 
          ios_icon_name="chart.bar.fill" 
          android_material_icon_name="analytics" 
          size={48} 
          color={colors.primary}
        />
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your activity and progress</Text>
      </View>

      {/* Menu Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <IconSymbol 
              ios_icon_name="list.bullet" 
              android_material_icon_name="list" 
              size={28} 
              color={colors.card}
            />
            <Text style={styles.statNumber}>{menuStats.totalMenus}</Text>
            <Text style={styles.statLabel}>Total Menus</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
            <IconSymbol 
              ios_icon_name="calendar" 
              android_material_icon_name="calendar_today" 
              size={28} 
              color={colors.card}
            />
            <Text style={styles.statNumber}>{menuStats.thisWeekMenus}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
            <IconSymbol 
              ios_icon_name="flame.fill" 
              android_material_icon_name="local_fire_department" 
              size={28} 
              color={colors.card}
            />
            <Text style={styles.statNumber}>{menuStats.avgCalories}</Text>
            <Text style={styles.statLabel}>Avg Calories</Text>
          </View>
        </View>
      </View>

      {/* Weight History */}
      {weightHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight History</Text>
          <View style={styles.weightHistoryCard}>
            {weightHistory.slice(-5).reverse().map((entry, index) => (
              <React.Fragment key={index}>
                <View style={styles.weightHistoryItem}>
                  <View style={styles.weightHistoryDate}>
                    <IconSymbol 
                      ios_icon_name="calendar" 
                      android_material_icon_name="calendar_today" 
                      size={16} 
                      color={colors.textSecondary}
                    />
                    <Text style={styles.weightHistoryDateText}>{entry.date}</Text>
                  </View>
                  <Text style={styles.weightHistoryValue}>{entry.weight} kg</Text>
                </View>
                {index < weightHistory.length - 1 && <View style={styles.weightHistoryDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* Activity Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Overview</Text>
        <View style={styles.activityGrid}>
          <View style={styles.activityCard}>
            <IconSymbol 
              ios_icon_name="lock.fill" 
              android_material_icon_name="lock" 
              size={24} 
              color={colors.primary}
            />
            <Text style={styles.activityNumber}>{stats.authLogs}</Text>
            <Text style={styles.activityLabel}>Auth Events</Text>
          </View>
          <View style={styles.activityCard}>
            <IconSymbol 
              ios_icon_name="fork.knife" 
              android_material_icon_name="restaurant" 
              size={24} 
              color={colors.secondary}
            />
            <Text style={styles.activityNumber}>{stats.menuLogs}</Text>
            <Text style={styles.activityLabel}>Menu Events</Text>
          </View>
          <View style={styles.activityCard}>
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              size={24} 
              color={colors.accent}
            />
            <Text style={styles.activityNumber}>{stats.profileLogs}</Text>
            <Text style={styles.activityLabel}>Profile Events</Text>
          </View>
          <View style={styles.activityCard}>
            <IconSymbol 
              ios_icon_name="leaf.fill" 
              android_material_icon_name="eco" 
              size={24} 
              color={colors.success}
            />
            <Text style={styles.activityNumber}>{stats.dietLogs}</Text>
            <Text style={styles.activityLabel}>Diet Events</Text>
          </View>
        </View>
      </View>

      {/* Activity Logs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity Logs</Text>
          <View style={styles.logActions}>
            <TouchableOpacity onPress={handleExportLogs} style={styles.actionButton}>
              <IconSymbol 
                ios_icon_name="square.and.arrow.up" 
                android_material_icon_name="upload" 
                size={20} 
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearLogs} style={styles.actionButton}>
              <IconSymbol 
                ios_icon_name="trash" 
                android_material_icon_name="delete" 
                size={20} 
                color={colors.accent}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map((category, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.id as any)}
              >
                <IconSymbol 
                  ios_icon_name={category.icon} 
                  android_material_icon_name={category.androidIcon as any} 
                  size={16} 
                  color={selectedCategory === category.id ? colors.card : colors.text}
                />
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive,
                ]}>
                  {category.label} ({category.count})
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </ScrollView>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              ios_icon_name="tray" 
              android_material_icon_name="inbox" 
              size={48} 
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No activity logs yet</Text>
            <Text style={styles.emptyStateSubtext}>Your activity will be tracked here</Text>
          </View>
        ) : (
          filteredLogs.slice(0, 20).reverse().map((log, index) => (
            <React.Fragment key={index}>
              <View style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={[styles.logCategoryBadge, { backgroundColor: getCategoryColor(log.eventCategory) }]}>
                    <Text style={styles.logCategoryText}>{log.eventCategory}</Text>
                  </View>
                  <Text style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.logEventType}>{log.eventType}</Text>
                <Text style={styles.logDescription}>{log.description}</Text>
                {log.userName && (
                  <Text style={styles.logUser}>User: {log.userName}</Text>
                )}
              </View>
            </React.Fragment>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    auth: colors.primary,
    menu: colors.secondary,
    profile: colors.accent,
    diet: colors.success,
    navigation: '#8E8E93',
    system: '#FF9500',
  };
  return colorMap[category] || colors.textSecondary;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
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
  logActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
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
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.card,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  weightHistoryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
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
  weightHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  weightHistoryDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightHistoryDateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  weightHistoryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  weightHistoryDivider: {
    height: 1,
    backgroundColor: colors.highlight,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityCard: {
    width: '48%',
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
  activityNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryFilterContent: {
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: colors.card,
  },
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.card,
    textTransform: 'uppercase',
  },
  logTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logEventType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  logDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  logUser: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 8,
    fontStyle: 'italic',
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
});

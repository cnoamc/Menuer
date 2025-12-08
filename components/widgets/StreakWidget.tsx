
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface StreakWidgetProps {
  streak: number;
}

export function StreakWidget({ streak }: StreakWidgetProps) {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconSymbol 
            ios_icon_name="flame.fill" 
            android_material_icon_name="local_fire_department" 
            size={32} 
            color={colors.accent}
          />
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakNumber}>{streak}</Text>
        </View>
      </View>
      
      <Text style={styles.title}>Day Streak</Text>
      
      <View style={styles.weekContainer}>
        {daysOfWeek.map((day, index) => {
          const isActive = index <= today;
          return (
            <View key={index} style={styles.dayItem}>
              <View style={[
                styles.dayCircle,
                isActive && styles.dayCircleActive
              ]}>
                {isActive && (
                  <IconSymbol 
                    ios_icon_name="checkmark" 
                    android_material_icon_name="check" 
                    size={12} 
                    color={colors.card}
                  />
                )}
              </View>
              <Text style={[
                styles.dayLabel,
                isActive && styles.dayLabelActive
              ]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadge: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: 6,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: colors.accent,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayLabelActive: {
    color: colors.text,
  },
});

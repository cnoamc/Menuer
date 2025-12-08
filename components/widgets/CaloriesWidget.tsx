
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface CaloriesWidgetProps {
  averageCalories: number;
  percentageChange?: number;
}

export function CaloriesWidget({ averageCalories, percentageChange = 0 }: CaloriesWidgetProps) {
  const isPositive = percentageChange >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Average Calories</Text>
      </View>

      <View style={styles.caloriesDisplay}>
        <Text style={styles.caloriesNumber}>{averageCalories}</Text>
        <Text style={styles.caloriesUnit}>cal</Text>
        {percentageChange !== 0 && (
          <View style={[
            styles.changeBadge,
            { backgroundColor: isPositive ? colors.success : colors.accent }
          ]}>
            <IconSymbol 
              ios_icon_name={isPositive ? "arrow.up" : "arrow.down"} 
              android_material_icon_name={isPositive ? "arrow_upward" : "arrow_downward"} 
              size={12} 
              color={colors.card}
            />
            <Text style={styles.changeText}>{Math.abs(percentageChange)}%</Text>
          </View>
        )}
      </View>

      <View style={styles.iconContainer}>
        <IconSymbol 
          ios_icon_name="flame.fill" 
          android_material_icon_name="local_fire_department" 
          size={40} 
          color={colors.accent}
        />
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
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  caloriesDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  caloriesNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  caloriesUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  iconContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    opacity: 0.2,
  },
});

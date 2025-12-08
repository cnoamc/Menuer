
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface WeightWidgetProps {
  currentWeight: number;
  goalWeight: number;
  initialWeight: number;
  onLogWeight?: () => void;
}

export function WeightWidget({ currentWeight, goalWeight, initialWeight, onLogWeight }: WeightWidgetProps) {
  const totalChange = initialWeight - goalWeight;
  const currentChange = initialWeight - currentWeight;
  const progress = totalChange !== 0 ? Math.max(0, Math.min(100, (currentChange / totalChange) * 100)) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Weight</Text>
        <View style={styles.progressBadge}>
          <IconSymbol 
            ios_icon_name="flag.fill" 
            android_material_icon_name="flag" 
            size={12} 
            color={colors.card}
          />
          <Text style={styles.progressText}>{progress.toFixed(0)}% of goal</Text>
        </View>
      </View>

      <View style={styles.weightDisplay}>
        <Text style={styles.currentWeight}>{currentWeight.toFixed(1)}</Text>
        <Text style={styles.weightUnit}>lbs</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.goalText}>Goal {goalWeight.toFixed(0)} lbs</Text>
        <TouchableOpacity style={styles.logButton} onPress={onLogWeight}>
          <Text style={styles.logButtonText}>Log Weight</Text>
          <IconSymbol 
            ios_icon_name="arrow.right" 
            android_material_icon_name="arrow_forward" 
            size={16} 
            color={colors.card}
          />
        </TouchableOpacity>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.card,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currentWeight: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  weightUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.highlight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
});

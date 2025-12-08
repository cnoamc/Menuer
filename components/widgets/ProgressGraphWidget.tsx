
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeightEntry {
  date: string;
  weight: number;
  timestamp: number;
}

interface ProgressGraphWidgetProps {
  currentWeight: number;
  goalWeight: number;
  initialWeight: number;
  userId?: string;
}

const WEIGHT_HISTORY_KEY = 'weight_history';

export function ProgressGraphWidget({ currentWeight, goalWeight, initialWeight, userId }: ProgressGraphWidgetProps) {
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const screenWidth = Dimensions.get('window').width;
  const graphWidth = screenWidth - 80; // Account for padding
  const graphHeight = 200;

  useEffect(() => {
    loadWeightHistory();
  }, [userId, currentWeight]);

  const loadWeightHistory = async () => {
    try {
      if (!userId) return;
      
      const key = `${WEIGHT_HISTORY_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const history: WeightEntry[] = JSON.parse(data);
        setWeightHistory(history);
      } else {
        // Initialize with current weight
        const initialEntry: WeightEntry = {
          date: new Date().toISOString(),
          weight: currentWeight || initialWeight,
          timestamp: Date.now(),
        };
        setWeightHistory([initialEntry]);
        await AsyncStorage.setItem(key, JSON.stringify([initialEntry]));
      }
    } catch (error) {
      console.error('Error loading weight history:', error);
    }
  };

  const getGraphPoints = () => {
    if (weightHistory.length === 0) return [];

    const weights = weightHistory.map(entry => entry.weight);
    const minWeight = Math.min(...weights, goalWeight) - 5;
    const maxWeight = Math.max(...weights, initialWeight) + 5;
    const weightRange = maxWeight - minWeight;

    return weightHistory.map((entry, index) => {
      const x = (index / Math.max(weightHistory.length - 1, 1)) * graphWidth;
      const y = graphHeight - ((entry.weight - minWeight) / weightRange) * graphHeight;
      return { x, y, weight: entry.weight, date: entry.date };
    });
  };

  const points = getGraphPoints();
  const pathData = points.length > 0
    ? points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
    : '';

  const progress = initialWeight !== goalWeight
    ? Math.max(0, Math.min(100, ((initialWeight - currentWeight) / (initialWeight - goalWeight)) * 100))
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weight Progress</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{progress.toFixed(0)}% of goal</Text>
        </View>
      </View>

      <View style={styles.graphContainer}>
        {points.length > 1 ? (
          <View style={styles.graph}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              <Text style={styles.axisLabel}>{(initialWeight + 5).toFixed(0)}</Text>
              <Text style={styles.axisLabel}>{((initialWeight + goalWeight) / 2).toFixed(0)}</Text>
              <Text style={styles.axisLabel}>{(goalWeight - 5).toFixed(0)}</Text>
            </View>

            {/* Graph area */}
            <View style={styles.graphArea}>
              {/* Grid lines */}
              <View style={styles.gridLine} />
              <View style={[styles.gridLine, { top: '50%' }]} />
              <View style={[styles.gridLine, { top: '100%' }]} />

              {/* Goal line */}
              <View
                style={[
                  styles.goalLine,
                  {
                    bottom: ((goalWeight - (Math.min(...weightHistory.map(e => e.weight), goalWeight) - 5)) /
                      ((Math.max(...weightHistory.map(e => e.weight), initialWeight) + 5) -
                        (Math.min(...weightHistory.map(e => e.weight), goalWeight) - 5))) *
                      graphHeight,
                  },
                ]}
              >
                <Text style={styles.goalLineText}>Goal: {goalWeight} lbs</Text>
              </View>

              {/* Line graph */}
              <View style={styles.lineContainer}>
                {points.map((point, index) => {
                  if (index === 0) return null;
                  const prevPoint = points[index - 1];
                  const length = Math.sqrt(
                    Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
                  );
                  const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);

                  return (
                    <View
                      key={index}
                      style={[
                        styles.line,
                        {
                          width: length,
                          left: prevPoint.x,
                          top: prevPoint.y,
                          transform: [{ rotate: `${angle}deg` }],
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Data points */}
              {points.map((point, index) => (
                <View
                  key={index}
                  style={[
                    styles.dataPoint,
                    {
                      left: point.x - 6,
                      top: point.y - 6,
                    },
                  ]}
                >
                  {index === points.length - 1 && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>{point.weight.toFixed(1)} lbs</Text>
                      <Text style={styles.tooltipDate}>{formatDate(point.date)}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Keep logging your weight to see progress!</Text>
          </View>
        )}

        {/* X-axis labels */}
        {points.length > 1 && (
          <View style={styles.xAxisLabels}>
            <Text style={styles.axisLabel}>{formatDate(points[0].date)}</Text>
            {points.length > 2 && (
              <Text style={styles.axisLabel}>
                {formatDate(points[Math.floor(points.length / 2)].date)}
              </Text>
            )}
            <Text style={styles.axisLabel}>{formatDate(points[points.length - 1].date)}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={styles.statValue}>{currentWeight.toFixed(1)} lbs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Goal</Text>
          <Text style={styles.statValue}>{goalWeight.toFixed(1)} lbs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>To Go</Text>
          <Text style={styles.statValue}>{Math.abs(currentWeight - goalWeight).toFixed(1)} lbs</Text>
        </View>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressBadge: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  graphContainer: {
    marginBottom: 16,
  },
  graph: {
    flexDirection: 'row',
    height: 200,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  graphArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.highlight,
    borderRadius: 12,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.lightGray,
    opacity: 0.5,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.success,
    borderStyle: 'dashed',
  },
  goalLineText: {
    position: 'absolute',
    right: 8,
    top: -20,
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
    backgroundColor: colors.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  line: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.card,
  },
  tooltip: {
    position: 'absolute',
    bottom: 20,
    left: -30,
    backgroundColor: colors.text,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.card,
  },
  tooltipDate: {
    fontSize: 10,
    color: colors.card,
    opacity: 0.8,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    borderRadius: 12,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingLeft: 48,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.highlight,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.highlight,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});

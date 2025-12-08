
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface MiniCalendarWidgetProps {
  activeDays?: number[];
}

export function MiniCalendarWidget({ activeDays = [] }: MiniCalendarWidgetProps) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const currentDay = today.getDay();
  
  const getDateForDay = (dayIndex: number) => {
    const date = new Date(today);
    const diff = dayIndex - currentDay;
    date.setDate(date.getDate() + diff);
    return date.getDate();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week</Text>
      
      <View style={styles.calendarGrid}>
        {daysOfWeek.map((day, index) => {
          const isToday = index === currentDay;
          const isActive = activeDays.includes(index) || index <= currentDay;
          const dateNumber = getDateForDay(index);

          return (
            <View key={index} style={styles.dayColumn}>
              <Text style={[
                styles.dayLabel,
                isToday && styles.dayLabelToday
              ]}>
                {day}
              </Text>
              <View style={[
                styles.dateCircle,
                isToday && styles.dateCircleToday,
                isActive && !isToday && styles.dateCircleActive
              ]}>
                <Text style={[
                  styles.dateNumber,
                  (isToday || isActive) && styles.dateNumberActive
                ]}>
                  {dateNumber}
                </Text>
              </View>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayLabelToday: {
    color: colors.primary,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleToday: {
    backgroundColor: colors.primary,
  },
  dateCircleActive: {
    backgroundColor: colors.success,
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dateNumberActive: {
    color: colors.card,
  },
});

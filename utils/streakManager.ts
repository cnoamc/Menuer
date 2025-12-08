
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logSystem } from './activityLogger';

const STREAK_STORAGE_KEY = 'user_streak_data';

export interface StreakData {
  count: number;
  lastTapDate: string;
  lastTapTimestamp: number;
}

class StreakManager {
  private static instance: StreakManager;

  private constructor() {
    console.log('StreakManager initialized');
  }

  public static getInstance(): StreakManager {
    if (!StreakManager.instance) {
      StreakManager.instance = new StreakManager();
    }
    return StreakManager.instance;
  }

  async getStreakData(userId: string): Promise<StreakData> {
    try {
      const key = `${STREAK_STORAGE_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const streakData: StreakData = JSON.parse(data);
        
        // Check if streak should be reset (more than 24 hours since last tap)
        const now = Date.now();
        const hoursSinceLastTap = (now - streakData.lastTapTimestamp) / (1000 * 60 * 60);
        
        if (hoursSinceLastTap > 24) {
          console.log(`Streak expired for user ${userId}. Hours since last tap: ${hoursSinceLastTap.toFixed(2)}`);
          await logSystem('STREAK_EXPIRED', `Streak expired for user ${userId} after ${hoursSinceLastTap.toFixed(2)} hours`, {
            userId,
            oldStreak: streakData.count,
            hoursSinceLastTap: hoursSinceLastTap.toFixed(2),
          });
          
          // Reset streak
          return {
            count: 0,
            lastTapDate: '',
            lastTapTimestamp: 0,
          };
        }
        
        return streakData;
      }
      
      // No streak data found, return default
      return {
        count: 0,
        lastTapDate: '',
        lastTapTimestamp: 0,
      };
    } catch (error) {
      console.error('Error getting streak data:', error);
      await logSystem('STREAK_GET_ERROR', 'Error getting streak data', { error: String(error), userId });
      return {
        count: 0,
        lastTapDate: '',
        lastTapTimestamp: 0,
      };
    }
  }

  async incrementStreak(userId: string): Promise<StreakData> {
    try {
      const currentStreak = await this.getStreakData(userId);
      const now = Date.now();
      const today = new Date().toDateString();
      
      // Check if already tapped today
      if (currentStreak.lastTapDate === today) {
        console.log('Streak already tapped today');
        await logSystem('STREAK_ALREADY_TAPPED', 'User tried to tap streak multiple times in one day', {
          userId,
          currentStreak: currentStreak.count,
        });
        return currentStreak;
      }
      
      // Increment streak
      const newStreak: StreakData = {
        count: currentStreak.count + 1,
        lastTapDate: today,
        lastTapTimestamp: now,
      };
      
      const key = `${STREAK_STORAGE_KEY}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(newStreak));
      
      console.log(`Streak incremented for user ${userId}: ${newStreak.count}`);
      await logSystem('STREAK_INCREMENTED', `Streak incremented to ${newStreak.count}`, {
        userId,
        newStreak: newStreak.count,
        previousStreak: currentStreak.count,
      });
      
      return newStreak;
    } catch (error) {
      console.error('Error incrementing streak:', error);
      await logSystem('STREAK_INCREMENT_ERROR', 'Error incrementing streak', { error: String(error), userId });
      throw error;
    }
  }

  async resetStreak(userId: string): Promise<void> {
    try {
      const key = `${STREAK_STORAGE_KEY}_${userId}`;
      await AsyncStorage.removeItem(key);
      console.log(`Streak reset for user ${userId}`);
      await logSystem('STREAK_RESET', `Streak manually reset for user ${userId}`, { userId });
    } catch (error) {
      console.error('Error resetting streak:', error);
      await logSystem('STREAK_RESET_ERROR', 'Error resetting streak', { error: String(error), userId });
    }
  }

  async checkAndResetExpiredStreak(userId: string): Promise<boolean> {
    try {
      const streakData = await this.getStreakData(userId);
      
      if (streakData.count === 0) {
        return false; // No active streak
      }
      
      const now = Date.now();
      const hoursSinceLastTap = (now - streakData.lastTapTimestamp) / (1000 * 60 * 60);
      
      if (hoursSinceLastTap > 24) {
        await this.resetStreak(userId);
        return true; // Streak was expired and reset
      }
      
      return false; // Streak is still active
    } catch (error) {
      console.error('Error checking expired streak:', error);
      return false;
    }
  }
}

export const streakManager = StreakManager.getInstance();

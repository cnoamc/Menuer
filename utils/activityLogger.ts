
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  eventType: string;
  eventCategory: 'auth' | 'menu' | 'profile' | 'diet' | 'navigation' | 'system';
  description: string;
  data?: any;
  platform?: string;
}

const LOGS_STORAGE_KEY = 'activity_logs';
const MAX_LOGS = 1000; // Keep last 1000 logs

class ActivityLogger {
  private static instance: ActivityLogger;
  private logs: ActivityLog[] = [];
  private isInitialized = false;

  private constructor() {
    this.initializeLogs();
  }

  public static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  private async initializeLogs() {
    try {
      const storedLogs = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
        console.log(`📋 Activity Logger initialized with ${this.logs.length} existing logs`);
      } else {
        console.log('📋 Activity Logger initialized with empty logs');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize activity logs:', error);
      this.logs = [];
      this.isInitialized = true;
    }
  }

  private async saveLogs() {
    try {
      // Keep only the most recent logs
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS);
      }
      await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('❌ Failed to save activity logs:', error);
    }
  }

  public async log(
    eventType: string,
    eventCategory: ActivityLog['eventCategory'],
    description: string,
    data?: any,
    userId?: string,
    userName?: string
  ) {
    // Wait for initialization if not ready
    if (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const log: ActivityLog = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      eventType,
      eventCategory,
      description,
      data,
      platform: this.getPlatform(),
    };

    this.logs.push(log);
    
    // Console log with emoji for visibility
    const emoji = this.getCategoryEmoji(eventCategory);
    console.log(`${emoji} [${eventCategory.toUpperCase()}] ${eventType}: ${description}`, data || '');

    // Save to AsyncStorage
    await this.saveLogs();
  }

  private getCategoryEmoji(category: ActivityLog['eventCategory']): string {
    const emojiMap = {
      auth: '🔐',
      menu: '🍽️',
      profile: '👤',
      diet: '🥗',
      navigation: '🧭',
      system: '⚙️',
    };
    return emojiMap[category] || '📝';
  }

  private getPlatform(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent || 'unknown';
    }
    return 'unknown';
  }

  public async getLogs(limit?: number): Promise<ActivityLog[]> {
    if (!this.isInitialized) {
      await this.initializeLogs();
    }
    
    if (limit) {
      return this.logs.slice(-limit);
    }
    return [...this.logs];
  }

  public async getLogsByCategory(category: ActivityLog['eventCategory']): Promise<ActivityLog[]> {
    if (!this.isInitialized) {
      await this.initializeLogs();
    }
    
    return this.logs.filter(log => log.eventCategory === category);
  }

  public async getLogsByUser(userId: string): Promise<ActivityLog[]> {
    if (!this.isInitialized) {
      await this.initializeLogs();
    }
    
    return this.logs.filter(log => log.userId === userId);
  }

  public async clearLogs() {
    this.logs = [];
    await AsyncStorage.removeItem(LOGS_STORAGE_KEY);
    console.log('🗑️ All activity logs cleared');
  }

  public async exportLogs(): Promise<string> {
    if (!this.isInitialized) {
      await this.initializeLogs();
    }
    
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const activityLogger = ActivityLogger.getInstance();

// Convenience functions for common log types
export const logAuth = (eventType: string, description: string, data?: any, userId?: string, userName?: string) => {
  return activityLogger.log(eventType, 'auth', description, data, userId, userName);
};

export const logMenu = (eventType: string, description: string, data?: any, userId?: string, userName?: string) => {
  return activityLogger.log(eventType, 'menu', description, data, userId, userName);
};

export const logProfile = (eventType: string, description: string, data?: any, userId?: string, userName?: string) => {
  return activityLogger.log(eventType, 'profile', description, data, userId, userName);
};

export const logDiet = (eventType: string, description: string, data?: any, userId?: string, userName?: string) => {
  return activityLogger.log(eventType, 'diet', description, data, userId, userName);
};

export const logNavigation = (eventType: string, description: string, data?: any, userId?: string, userName?: string) => {
  return activityLogger.log(eventType, 'navigation', description, data, userId, userName);
};

export const logSystem = (eventType: string, description: string, data?: any) => {
  return activityLogger.log(eventType, 'system', description, data);
};

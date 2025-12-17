import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@puzzle_streak';

/**
 * Get current streak information
 */
export const getStreak = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const streak = JSON.parse(data);
      const lastPlayDate = new Date(streak.lastPlayDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastPlayDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - lastPlayDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Already played today
        return streak;
      } else if (daysDiff === 1) {
        // Consecutive day
        return {
          currentStreak: streak.currentStreak + 1,
          longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
          lastPlayDate: today.toISOString(),
          totalDays: streak.totalDays + 1,
        };
      } else {
        // Streak broken
        return {
          currentStreak: 1,
          longestStreak: streak.longestStreak,
          lastPlayDate: today.toISOString(),
          totalDays: streak.totalDays + 1,
        };
      }
    }
    
    // First time playing
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastPlayDate: new Date().toISOString(),
      totalDays: 1,
    };
  } catch (error) {
    console.error('Error getting streak:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPlayDate: null,
      totalDays: 0,
    };
  }
};

/**
 * Update streak after playing
 */
export const updateStreak = async () => {
  try {
    const streak = await getStreak();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(streak));
    return streak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
};

/**
 * Get streak rewards message
 */
export const getStreakMessage = (streak) => {
  if (streak.currentStreak >= 7) {
    return `🔥 Amazing! ${streak.currentStreak} day streak! You're on fire!`;
  } else if (streak.currentStreak >= 3) {
    return `🌟 Great! ${streak.currentStreak} day streak! Keep it up!`;
  } else if (streak.currentStreak >= 1) {
    return `💪 Day ${streak.currentStreak}! You're building a streak!`;
  }
  return 'Start your streak today!';
};

/**
 * Check if streak milestone reached
 */
export const checkStreakMilestone = (streak) => {
  const milestones = [3, 7, 14, 30, 60, 100];
  return milestones.includes(streak.currentStreak);
};


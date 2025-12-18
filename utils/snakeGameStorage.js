import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@snake_game_progress';

/**
 * Snake game progress structure:
 * {
 *   completedLevels: [1, 2, 3...],
 *   highScores: { '1-EASY': 1000, '1-MEDIUM': 1500, ... },
 *   totalNumbersCollected: 500,
 *   totalGamesPlayed: 25,
 *   achievements: ['first_10', 'count_by_10_master'],
 *   bestStreak: 15,
 *   currentStreak: 5,
 * }
 */

export const saveSnakeGameProgress = async (progressData) => {
  try {
    const existing = await getSnakeGameProgress();
    const updated = {
      ...existing,
      ...progressData,
      // Merge arrays
      completedLevels: [
        ...new Set([...(existing.completedLevels || []), ...(progressData.completedLevels || [])])
      ],
      achievements: [
        ...new Set([...(existing.achievements || []), ...(progressData.achievements || [])])
      ],
      // Merge high scores (keep highest)
      highScores: {
        ...existing.highScores,
        ...progressData.highScores,
        ...Object.keys(progressData.highScores || {}).reduce((acc, key) => {
          const newScore = progressData.highScores[key];
          const oldScore = existing.highScores?.[key] || 0;
          acc[key] = Math.max(newScore, oldScore);
          return acc;
        }, {}),
      },
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving snake game progress:', error);
    return false;
  }
};

export const getSnakeGameProgress = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {
      completedLevels: [],
      highScores: {},
      totalNumbersCollected: 0,
      totalGamesPlayed: 0,
      achievements: [],
      bestStreak: 0,
      currentStreak: 0,
    };
  } catch (error) {
    console.error('Error getting snake game progress:', error);
    return {
      completedLevels: [],
      highScores: {},
      totalNumbersCollected: 0,
      totalGamesPlayed: 0,
      achievements: [],
      bestStreak: 0,
      currentStreak: 0,
    };
  }
};

export const recordGameResult = async (level, difficulty, score, numbersCollected, isCompleted) => {
  try {
    const progress = await getSnakeGameProgress();
    const scoreKey = `${level}-${difficulty}`;
    
    const updates = {
      totalGamesPlayed: (progress.totalGamesPlayed || 0) + 1,
      totalNumbersCollected: (progress.totalNumbersCollected || 0) + numbersCollected,
      highScores: {
        [scoreKey]: Math.max(progress.highScores?.[scoreKey] || 0, score),
      },
    };
    
    if (isCompleted) {
      updates.completedLevels = [level];
      updates.currentStreak = (progress.currentStreak || 0) + 1;
      updates.bestStreak = Math.max(progress.bestStreak || 0, updates.currentStreak);
    } else {
      updates.currentStreak = 0;
    }
    
    await saveSnakeGameProgress(updates);
    return true;
  } catch (error) {
    console.error('Error recording game result:', error);
    return false;
  }
};

export const getHighScore = async (level, difficulty) => {
  try {
    const progress = await getSnakeGameProgress();
    const scoreKey = `${level}-${difficulty}`;
    return progress.highScores?.[scoreKey] || 0;
  } catch (error) {
    return 0;
  }
};

export const resetSnakeGameProgress = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting snake game progress:', error);
    return false;
  }
};


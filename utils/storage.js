import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PROGRESS: '@puzzle_game_progress',
  SETTINGS: '@puzzle_game_settings',
  STARS: '@puzzle_game_stars',
  UNLOCKED_LEVELS: '@puzzle_game_unlocked_levels'
};

/**
 * Progress structure:
 * {
 *   beginner: { completed: [puzzleIds], currentLevel: number },
 *   intermediate: { completed: [], currentLevel: 0 },
 *   advanced: { completed: [], currentLevel: 0 }
 * }
 */

/**
 * Save user progress
 */
export const saveProgress = async (level, puzzleId, stars) => {
  try {
    const progressData = await getProgress();
    
    if (!progressData[level]) {
      progressData[level] = { completed: [], currentLevel: 0, stars: {} };
    }
    
    // Add puzzle to completed if not already there
    if (!progressData[level].completed.includes(puzzleId)) {
      progressData[level].completed.push(puzzleId);
    }
    
    // Update stars for this puzzle (keep highest)
    if (!progressData[level].stars) {
      progressData[level].stars = {};
    }
    const currentStars = progressData[level].stars[puzzleId] || 0;
    progressData[level].stars[puzzleId] = Math.max(currentStars, stars);
    
    // Update current level
    const puzzles = await import('../data/puzzles.json');
    const totalPuzzles = puzzles.default[level]?.length || 0;
    progressData[level].currentLevel = Math.min(
      progressData[level].completed.length,
      totalPuzzles
    );
    
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressData));
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
};

/**
 * Get user progress
 */
export const getProgress = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (data) {
      return JSON.parse(data);
    }
    return {
      beginner: { completed: [], currentLevel: 0, stars: {} },
      intermediate: { completed: [], currentLevel: 0, stars: {} },
      advanced: { completed: [], currentLevel: 0, stars: {} }
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    return {
      beginner: { completed: [], currentLevel: 0, stars: {} },
      intermediate: { completed: [], currentLevel: 0, stars: {} },
      advanced: { completed: [], currentLevel: 0, stars: {} }
    };
  }
};

/**
 * Get stars for a specific puzzle
 */
export const getPuzzleStars = async (level, puzzleId) => {
  try {
    const progress = await getProgress();
    return progress[level]?.stars?.[puzzleId] || 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Get total stars for a level
 */
export const getTotalStarsForLevel = async (level) => {
  try {
    const progress = await getProgress();
    const stars = progress[level]?.stars || {};
    return Object.values(stars).reduce((sum, star) => sum + star, 0);
  } catch (error) {
    return 0;
  }
};

/**
 * Check if a level is unlocked
 * Beginner is always unlocked
 */
export const isLevelUnlocked = async (level) => {
  if (level === 'beginner') return true;
  
  try {
    const progress = await getProgress();
    
    // Unlock intermediate if beginner has at least 5 puzzles completed
    if (level === 'intermediate') {
      const beginnerCompleted = progress.beginner?.completed?.length || 0;
      return beginnerCompleted >= 5;
    }
    
    // Unlock advanced if intermediate has at least 5 puzzles completed
    if (level === 'advanced') {
      const intermediateCompleted = progress.intermediate?.completed?.length || 0;
      return intermediateCompleted >= 5;
    }
    
    return false;
  } catch (error) {
    return level === 'beginner';
  }
};

/**
 * Check if a specific puzzle is unlocked
 */
export const isPuzzleUnlocked = async (level, puzzleIndex) => {
  if (puzzleIndex === 0) return true; // First puzzle always unlocked
  
  try {
    const progress = await getProgress();
    const completed = progress[level]?.completed || [];
    const puzzles = await import('../data/puzzles.json');
    const totalPuzzles = puzzles.default[level]?.length || 0;
    
    // Unlock next puzzle if previous is completed
    return puzzleIndex <= completed.length;
  } catch (error) {
    return puzzleIndex === 0;
  }
};

/**
 * Get settings
 */
export const getSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
    return {
      soundEnabled: true,
      musicEnabled: true
    };
  } catch (error) {
    return {
      soundEnabled: true,
      musicEnabled: true
    };
  }
};

/**
 * Save settings
 */
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Reset all progress
 */
export const resetProgress = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS);
    await AsyncStorage.removeItem(STORAGE_KEYS.STARS);
    await AsyncStorage.removeItem(STORAGE_KEYS.UNLOCKED_LEVELS);
    return true;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return false;
  }
};


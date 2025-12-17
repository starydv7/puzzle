import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProgress } from './storage';
import { getPuzzlesByLevel } from './gameLogic';

/**
 * Performance history structure:
 * {
 *   puzzleId: {
 *     attempts: number,
 *     time: number,
 *     hintsUsed: number,
 *     success: boolean,
 *     timestamp: number
 *   }
 * }
 */

const PERFORMANCE_HISTORY_KEY = '@performance_history';

/**
 * Record puzzle performance
 */
export const recordPerformance = async (puzzleId, metrics) => {
  try {
    const history = await getPerformanceHistory();
    history[puzzleId] = {
      attempts: metrics.attempts || 1,
      time: metrics.time || 0,
      hintsUsed: metrics.hintsUsed || 0,
      success: metrics.success || false,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(PERFORMANCE_HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch (error) {
    console.error('Error recording performance:', error);
    return null;
  }
};

/**
 * Get performance history
 */
export const getPerformanceHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(PERFORMANCE_HISTORY_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
};

/**
 * Calculate difficulty adjustment
 */
export const calculateDifficultyAdjustment = async (level) => {
  try {
    const history = await getPerformanceHistory();
    const progress = await getProgress();
    const puzzles = getPuzzlesByLevel(level);
    
    // Get recent performance for this level
    const levelPuzzles = puzzles.map(p => p.id);
    const recentPerformance = Object.entries(history)
      .filter(([id]) => levelPuzzles.includes(id))
      .map(([, metrics]) => metrics)
      .slice(-10); // Last 10 puzzles
    
    if (recentPerformance.length === 0) {
      return 'maintain'; // No data, maintain current difficulty
    }
    
    const avgSuccessRate = recentPerformance.filter(p => p.success).length / recentPerformance.length;
    const avgTime = recentPerformance.reduce((sum, p) => sum + (p.time || 0), 0) / recentPerformance.length;
    const avgAttempts = recentPerformance.reduce((sum, p) => sum + (p.attempts || 1), 0) / recentPerformance.length;
    const avgHints = recentPerformance.reduce((sum, p) => sum + (p.hintsUsed || 0), 0) / recentPerformance.length;
    
    // Decision logic
    if (avgSuccessRate > 0.85 && avgTime < 20 && avgAttempts <= 1.2 && avgHints < 0.3) {
      return 'increase'; // Too easy, suggest harder
    } else if (avgSuccessRate < 0.5 || avgTime > 90 || avgAttempts > 2.5 || avgHints > 1.5) {
      return 'decrease'; // Too hard, suggest easier
    }
    
    return 'maintain'; // Just right
  } catch (error) {
    console.error('Error calculating difficulty:', error);
    return 'maintain';
  }
};

/**
 * Get recommended next puzzle
 */
export const getRecommendedPuzzle = async (level) => {
  try {
    const adjustment = await calculateDifficultyAdjustment(level);
    const progress = await getProgress();
    const puzzles = getPuzzlesByLevel(level);
    const completed = progress[level]?.completed || [];
    
    // Find next uncompleted puzzle
    const uncompleted = puzzles.filter(p => !completed.includes(p.id));
    
    if (uncompleted.length === 0) {
      return null; // All completed
    }
    
    // If difficulty should increase, suggest next level
    if (adjustment === 'increase' && level !== 'advanced') {
      const nextLevel = level === 'beginner' ? 'intermediate' : 'advanced';
      const nextPuzzles = getPuzzlesByLevel(nextLevel);
      const nextCompleted = progress[nextLevel]?.completed || [];
      const nextUncompleted = nextPuzzles.filter(p => !nextCompleted.includes(p.id));
      
      if (nextUncompleted.length > 0) {
        return {
          level: nextLevel,
          puzzle: nextUncompleted[0],
          reason: 'You\'re ready for a bigger challenge!',
        };
      }
    }
    
    // If difficulty should decrease, suggest easier puzzle
    if (adjustment === 'decrease' && level !== 'beginner') {
      const prevLevel = level === 'advanced' ? 'intermediate' : 'beginner';
      const prevPuzzles = getPuzzlesByLevel(prevLevel);
      const prevCompleted = progress[prevLevel]?.completed || [];
      const prevUncompleted = prevPuzzles.filter(p => !prevCompleted.includes(p.id));
      
      if (prevUncompleted.length > 0) {
        return {
          level: prevLevel,
          puzzle: prevUncompleted[0],
          reason: 'Let\'s practice with something a bit easier!',
        };
      }
    }
    
    // Default: next puzzle in current level
    return {
      level,
      puzzle: uncompleted[0],
      reason: 'Continue your journey!',
    };
  } catch (error) {
    console.error('Error getting recommendation:', error);
    return null;
  }
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = async (level) => {
  try {
    const history = await getPerformanceHistory();
    const puzzles = getPuzzlesByLevel(level);
    const levelPuzzles = puzzles.map(p => p.id);
    
    const levelPerformance = Object.entries(history)
      .filter(([id]) => levelPuzzles.includes(id))
      .map(([, metrics]) => metrics);
    
    if (levelPerformance.length === 0) {
      return {
        totalPuzzles: 0,
        successRate: 0,
        avgTime: 0,
        avgAttempts: 0,
        skillLevel: 'beginner',
      };
    }
    
    const successRate = levelPerformance.filter(p => p.success).length / levelPerformance.length;
    const avgTime = levelPerformance.reduce((sum, p) => sum + (p.time || 0), 0) / levelPerformance.length;
    const avgAttempts = levelPerformance.reduce((sum, p) => sum + (p.attempts || 1), 0) / levelPerformance.length;
    
    let skillLevel = 'beginner';
    if (successRate > 0.8 && avgTime < 30 && avgAttempts < 1.5) {
      skillLevel = 'advanced';
    } else if (successRate > 0.6 && avgTime < 60 && avgAttempts < 2) {
      skillLevel = 'intermediate';
    }
    
    return {
      totalPuzzles: levelPerformance.length,
      successRate: Math.round(successRate * 100),
      avgTime: Math.round(avgTime),
      avgAttempts: Math.round(avgAttempts * 10) / 10,
      skillLevel,
    };
  } catch (error) {
    console.error('Error getting performance summary:', error);
    return null;
  }
};


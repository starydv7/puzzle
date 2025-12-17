import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPuzzlesByLevel } from './gameLogic';

const STORAGE_KEY = '@daily_challenge';

/**
 * Get today's daily challenge puzzle
 */
export const getDailyChallenge = async () => {
  try {
    const today = new Date().toDateString();
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        return data.puzzle;
      }
    }
    
    // Generate new daily challenge
    const levels = ['beginner', 'intermediate', 'advanced'];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const puzzles = getPuzzlesByLevel(randomLevel);
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    
    const challenge = {
      date: today,
      puzzle: randomPuzzle,
      level: randomLevel,
      completed: false,
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
    return challenge;
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    return null;
  }
};

/**
 * Mark daily challenge as completed
 */
export const completeDailyChallenge = async () => {
  try {
    const today = new Date().toDateString();
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        data.completed = true;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    return false;
  }
};

/**
 * Check if daily challenge is completed
 */
export const isDailyChallengeCompleted = async () => {
  try {
    const today = new Date().toDateString();
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const data = JSON.parse(stored);
      return data.date === today && data.completed === true;
    }
    return false;
  } catch (error) {
    return false;
  }
};


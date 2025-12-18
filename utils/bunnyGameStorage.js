import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAME_MODES } from './bunnyGameLogic';

const STORAGE_KEY = '@bunny_game_progress';

/**
 * Bunny game progress structure:
 * {
 *   completedLevels: {
 *     collect: [1, 2, 3...],
 *     share: [1, 2...],
 *     party: [1...],
 *     fix: [1...]
 *   },
 *   scores: { 'collect-1': 150, 'share-2': 200... },
 *   rewards: {
 *     carrotCoins: 50,
 *     bunnyHats: 3,
 *     houseItems: 5,
 *     animalFriends: 2,
 *     gardenDecor: 4
 *   },
 *   bunnyHappiness: 50, // 0-100
 *   houseLevel: 1,
 *   totalHelps: 25
 * }
 */

export const saveBunnyGameProgress = async (progressData) => {
  try {
    const existing = await getBunnyGameProgress();
    const updated = {
      ...existing,
      ...progressData,
      // Merge completed levels
      completedLevels: {
        collect: [
          ...new Set([
            ...(existing.completedLevels?.collect || []),
            ...(progressData.completedLevels?.collect || []),
          ]),
        ],
        share: [
          ...new Set([
            ...(existing.completedLevels?.share || []),
            ...(progressData.completedLevels?.share || []),
          ]),
        ],
        party: [
          ...new Set([
            ...(existing.completedLevels?.party || []),
            ...(progressData.completedLevels?.party || []),
          ]),
        ],
        fix: [
          ...new Set([
            ...(existing.completedLevels?.fix || []),
            ...(progressData.completedLevels?.fix || []),
          ]),
        ],
      },
      // Merge scores (keep highest)
      scores: {
        ...existing.scores,
        ...progressData.scores,
        ...Object.keys(progressData.scores || {}).reduce((acc, key) => {
          const newScore = progressData.scores[key];
          const oldScore = existing.scores?.[key] || 0;
          acc[key] = Math.max(newScore, oldScore);
          return acc;
        }, {}),
      },
      // Merge rewards (additive)
      rewards: {
        carrotCoins: (existing.rewards?.carrotCoins || 0) + (progressData.rewards?.carrotCoins || 0),
        bunnyHats: (existing.rewards?.bunnyHats || 0) + (progressData.rewards?.bunnyHats || 0),
        houseItems: (existing.rewards?.houseItems || 0) + (progressData.rewards?.houseItems || 0),
        animalFriends: (existing.rewards?.animalFriends || 0) + (progressData.rewards?.animalFriends || 0),
        gardenDecor: (existing.rewards?.gardenDecor || 0) + (progressData.rewards?.gardenDecor || 0),
      },
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving bunny game progress:', error);
    return false;
  }
};

export const getBunnyGameProgress = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {
      completedLevels: {
        collect: [],
        share: [],
        party: [],
        fix: [],
      },
      scores: {},
      rewards: {
        carrotCoins: 0,
        bunnyHats: 0,
        houseItems: 0,
        animalFriends: 0,
        gardenDecor: 0,
      },
      bunnyHappiness: 0,
      houseLevel: 1,
      totalHelps: 0,
    };
  } catch (error) {
    console.error('Error getting bunny game progress:', error);
    return {
      completedLevels: {
        collect: [],
        share: [],
        party: [],
        fix: [],
      },
      scores: {},
      rewards: {
        carrotCoins: 0,
        bunnyHats: 0,
        houseItems: 0,
        animalFriends: 0,
        gardenDecor: 0,
      },
      bunnyHappiness: 0,
      houseLevel: 1,
      totalHelps: 0,
    };
  }
};

export const recordLevelCompletion = async (mode, levelId, score, rewardChoice) => {
  try {
    const progress = await getBunnyGameProgress();
    const scoreKey = `${mode}-${levelId}`;
    
    const updates = {
      completedLevels: {
        [mode]: [...(progress.completedLevels?.[mode] || []), levelId],
      },
      scores: {
        [scoreKey]: Math.max(progress.scores?.[scoreKey] || 0, score),
      },
      rewards: {
        [rewardChoice]: (progress.rewards?.[rewardChoice] || 0) + 1,
      },
      bunnyHappiness: Math.min(100, (progress.bunnyHappiness || 0) + 5),
      totalHelps: (progress.totalHelps || 0) + 1,
    };
    
    // Level up house based on total helps
    const newTotalHelps = updates.totalHelps;
    updates.houseLevel = Math.floor(newTotalHelps / 10) + 1;
    
    await saveBunnyGameProgress(updates);
    return true;
  } catch (error) {
    console.error('Error recording level completion:', error);
    return false;
  }
};

export const isLevelUnlocked = async (mode, levelId) => {
  if (levelId === 1) return true; // First level always unlocked
  
  try {
    const progress = await getBunnyGameProgress();
    const completed = progress.completedLevels?.[mode] || [];
    return completed.includes(levelId - 1);
  } catch (error) {
    return levelId === 1;
  }
};

export const resetBunnyGameProgress = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting bunny game progress:', error);
    return false;
  }
};


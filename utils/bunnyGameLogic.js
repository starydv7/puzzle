import bunnyGameData from '../data/bunnyGame.json';

/**
 * Bunny's Happy Helpers - Game Logic
 */

export const GAME_MODES = {
  COLLECT: 'collect',
  SHARE: 'share',
  PARTY: 'party',
  FIX: 'fix',
};

/**
 * Get levels for a specific game mode
 */
export const getLevelsForMode = (mode) => {
  return bunnyGameData.levels[mode] || [];
};

/**
 * Get a specific level
 */
export const getLevel = (mode, levelId) => {
  const levels = getLevelsForMode(mode);
  return levels.find(l => l.id === levelId);
};

/**
 * Check if sharing is fair (division check)
 */
export const isSharingFair = (itemsPerFriend, totalItems, numFriends) => {
  const expectedPerFriend = Math.floor(totalItems / numFriends);
  const remainder = totalItems % numFriends;
  
  // Check if all friends have the same amount
  const allEqual = itemsPerFriend.every(count => count === expectedPerFriend);
  
  return {
    isFair: allEqual && remainder === 0,
    expectedPerFriend,
    remainder,
    distribution: itemsPerFriend,
  };
};

/**
 * Check if grouping is correct
 */
export const isGroupingCorrect = (groups, groupSize, totalItems) => {
  const correctGroups = Math.floor(totalItems / groupSize);
  const remainder = totalItems % groupSize;
  
  // Check if we have the right number of groups with correct size
  const validGroups = groups.filter(group => group.length === groupSize).length;
  
  return {
    isCorrect: validGroups === correctGroups && remainder === 0,
    correctGroups,
    validGroups,
    remainder,
  };
};

/**
 * Generate mistake scenario for Fix mode
 */
export const generateMistakeScenario = (level) => {
  const { items, friends, itemType, mistake } = level;
  const correctPerFriend = Math.floor(items / friends);
  const distribution = new Array(friends).fill(correctPerFriend);
  const remainder = items % friends;
  
  // Distribute remainder
  for (let i = 0; i < remainder; i++) {
    distribution[i]++;
  }
  
  // Apply mistake
  let mistakeDistribution = [...distribution];
  
  switch (mistake) {
    case 'one_extra':
      // One friend has one extra
      mistakeDistribution[0]++;
      break;
    case 'one_missing':
      // One friend has one less
      mistakeDistribution[0] = Math.max(0, mistakeDistribution[0] - 1);
      break;
    case 'uneven':
      // Make it uneven
      mistakeDistribution[0] += 2;
      mistakeDistribution[1] = Math.max(0, mistakeDistribution[1] - 1);
      break;
    default:
      break;
  }
  
  return {
    distribution: mistakeDistribution,
    correctDistribution: distribution,
    itemType,
    totalItems: items,
    numFriends: friends,
  };
};

/**
 * Calculate score based on performance
 */
export const calculateScore = (mode, level, performance) => {
  let baseScore = 100;
  
  // Time bonus (faster = more points)
  if (performance.time) {
    const timeBonus = Math.max(0, 50 - performance.time);
    baseScore += timeBonus;
  }
  
  // Attempts penalty
  if (performance.attempts > 1) {
    baseScore -= (performance.attempts - 1) * 10;
  }
  
  // Difficulty multiplier
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  };
  
  const finalScore = Math.max(0, Math.floor(
    baseScore * difficultyMultiplier[level.difficulty || 'easy']
  ));
  
  return finalScore;
};

/**
 * Get random Bunny message
 */
export const getBunnyMessage = (type = 'happy') => {
  const messages = bunnyGameData.bunnyMessages[type] || bunnyGameData.bunnyMessages.happy;
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get story text for mode
 */
export const getStoryText = (mode) => {
  return bunnyGameData.story[`${mode}Intro`] || bunnyGameData.story.welcome;
};

/**
 * Get reward options
 */
export const getRewardOptions = () => {
  return bunnyGameData.rewards;
};

/**
 * Get reward keys
 */
export const getRewardKeys = () => {
  return Object.keys(bunnyGameData.rewards);
};

export default {
  GAME_MODES,
  getLevelsForMode,
  getLevel,
  isSharingFair,
  isGroupingCorrect,
  generateMistakeScenario,
  calculateScore,
  getBunnyMessage,
  getStoryText,
  getRewardOptions,
};


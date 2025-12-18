/**
 * Snake Game Logic - Educational Counting Game
 * Teaches counting and skip counting through gameplay
 */

export const COUNTING_MODES = {
  COUNT_BY_1: { step: 1, name: 'Count by 1', description: '1, 2, 3, 4, 5...' },
  COUNT_BY_2: { step: 2, name: 'Count by 2', description: '2, 4, 6, 8, 10...' },
  COUNT_BY_3: { step: 3, name: 'Count by 3', description: '3, 6, 9, 12, 15...' },
  COUNT_BY_5: { step: 5, name: 'Count by 5', description: '5, 10, 15, 20, 25...' },
  COUNT_BY_10: { step: 10, name: 'Count by 10', description: '10, 20, 30, 40, 50...' },
};

export const DIFFICULTY_LEVELS = {
  EASY: {
    name: 'Easy',
    speed: 200, // milliseconds between moves
    gridSize: 20, // cells in grid
    startLength: 3,
    description: 'Slow and steady!',
  },
  MEDIUM: {
    name: 'Medium',
    speed: 150,
    gridSize: 20,
    startLength: 4,
    description: 'A bit faster!',
  },
  HARD: {
    name: 'Hard',
    speed: 100,
    gridSize: 20,
    startLength: 5,
    description: 'Super fast!',
  },
};

/**
 * Generate the correct sequence for a counting mode
 */
export const generateSequence = (mode, startNumber = 0, length = 50) => {
  const sequence = [];
  const step = mode.step;
  let current = startNumber;
  
  for (let i = 0; i < length; i++) {
    current += step;
    sequence.push(current);
  }
  
  return sequence;
};

/**
 * Get the next expected number in sequence
 */
export const getNextExpectedNumber = (currentNumber, mode) => {
  return currentNumber + mode.step;
};

/**
 * Check if a number is correct for the current sequence position
 */
export const isCorrectNumber = (collectedNumber, expectedNumber) => {
  return collectedNumber === expectedNumber;
};

/**
 * Generate wrong numbers (distractors) for the game
 */
export const generateWrongNumbers = (correctNumber, mode, count = 3) => {
  const wrongNumbers = new Set();
  const step = mode.step;
  
  // Generate numbers that are close but wrong
  while (wrongNumbers.size < count) {
    const offset = Math.floor(Math.random() * 10) - 5; // -5 to +5
    const wrongNum = correctNumber + offset;
    
    // Make sure it's not the correct number and not in the sequence
    if (wrongNum !== correctNumber && wrongNum > 0 && wrongNum % step !== (correctNumber % step)) {
      wrongNumbers.add(wrongNum);
    }
  }
  
  return Array.from(wrongNumbers);
};

/**
 * Calculate score based on game performance
 */
export const calculateScore = (numbersCollected, timeElapsed, difficulty, mode) => {
  const baseScore = numbersCollected * 10;
  const difficultyMultiplier = {
    EASY: 1,
    MEDIUM: 1.5,
    HARD: 2,
  };
  const modeMultiplier = {
    COUNT_BY_1: 1,
    COUNT_BY_2: 1.2,
    COUNT_BY_3: 1.5,
    COUNT_BY_5: 2,
    COUNT_BY_10: 2.5,
  };
  
  const timeBonus = Math.max(0, 1000 - timeElapsed); // Bonus for speed
  const finalScore = Math.floor(
    (baseScore + timeBonus) * 
    difficultyMultiplier[difficulty] * 
    modeMultiplier[mode]
  );
  
  return finalScore;
};

/**
 * Get game configuration for a level
 */
export const getGameConfig = (level, difficulty) => {
  const levels = {
    1: { mode: COUNTING_MODES.COUNT_BY_1, maxNumber: 20, startNumber: 0 },
    2: { mode: COUNTING_MODES.COUNT_BY_1, maxNumber: 50, startNumber: 0 },
    3: { mode: COUNTING_MODES.COUNT_BY_2, maxNumber: 20, startNumber: 0 },
    4: { mode: COUNTING_MODES.COUNT_BY_2, maxNumber: 50, startNumber: 0 },
    5: { mode: COUNTING_MODES.COUNT_BY_3, maxNumber: 30, startNumber: 0 },
    6: { mode: COUNTING_MODES.COUNT_BY_3, maxNumber: 60, startNumber: 0 },
    7: { mode: COUNTING_MODES.COUNT_BY_5, maxNumber: 50, startNumber: 0 },
    8: { mode: COUNTING_MODES.COUNT_BY_5, maxNumber: 100, startNumber: 0 },
    9: { mode: COUNTING_MODES.COUNT_BY_10, maxNumber: 100, startNumber: 0 },
    10: { mode: COUNTING_MODES.COUNT_BY_10, maxNumber: 200, startNumber: 0 },
  };
  
  const config = levels[level] || levels[1];
  const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
  
  return {
    ...config,
    ...difficultyConfig,
    level,
  };
};

/**
 * Check if level is unlocked
 */
export const isLevelUnlocked = async (level) => {
  if (level === 1) return true;
  
  try {
    const { getSnakeGameProgress } = await import('./snakeGameStorage');
    const progress = await getSnakeGameProgress();
    const previousLevel = level - 1;
    
    // Unlock if previous level is completed
    return progress.completedLevels?.includes(previousLevel) || false;
  } catch (error) {
    return level === 1;
  }
};


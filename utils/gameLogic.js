import puzzlesData from '../data/puzzles.json';

/**
 * Get all puzzles for a specific difficulty level
 */
export const getPuzzlesByLevel = (level) => {
  return puzzlesData[level] || [];
};

/**
 * Get a specific puzzle by ID
 */
export const getPuzzleById = (level, puzzleId) => {
  const puzzles = getPuzzlesByLevel(level);
  return puzzles.find(p => p.id === puzzleId);
};

/**
 * Get a random puzzle from a level
 */
export const getRandomPuzzle = (level) => {
  const puzzles = getPuzzlesByLevel(level);
  if (puzzles.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * puzzles.length);
  return puzzles[randomIndex];
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get puzzle with shuffled options
 */
export const getPuzzleWithShuffledOptions = (puzzle) => {
  if (!puzzle) return null;
  
  const shuffledOptions = shuffleArray(puzzle.options);
  const correctAnswerIndex = shuffledOptions.indexOf(puzzle.options[puzzle.correct]);
  
  return {
    ...puzzle,
    options: shuffledOptions,
    correct: correctAnswerIndex
  };
};

/**
 * Check if answer is correct
 */
export const checkAnswer = (puzzle, selectedIndex) => {
  return puzzle.correct === selectedIndex;
};

/**
 * Calculate stars based on performance
 * - 3 stars: First try, quick answer
 * - 2 stars: Correct on first try
 * - 1 star: Correct after attempts
 */
export const calculateStars = (isCorrect, attempts, timeTaken) => {
  if (!isCorrect) return 0;
  
  if (attempts === 1 && timeTaken < 10) {
    return 3; // Perfect!
  } else if (attempts === 1) {
    return 2; // Great job!
  } else {
    return 1; // Good try!
  }
};

/**
 * Get total number of puzzles per level
 */
export const getTotalPuzzles = (level) => {
  return getPuzzlesByLevel(level).length;
};

/**
 * Get level display name
 */
export const getLevelDisplayName = (level) => {
  const names = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced'
  };
  return names[level] || level;
};

/**
 * Get age group recommendation
 */
export const getAgeGroup = (level) => {
  const ages = {
    'beginner': 'Ages 4-6',
    'intermediate': 'Ages 7-9',
    'advanced': 'Ages 10+'
  };
  return ages[level] || 'All Ages';
};


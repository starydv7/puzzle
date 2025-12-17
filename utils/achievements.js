import { getProgress } from './storage';

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS = {
  FIRST_PUZZLE: {
    id: 'first_puzzle',
    name: 'First Steps',
    description: 'Complete your first puzzle!',
    emoji: '👶',
    condition: (progress) => {
      const total = Object.values(progress).reduce(
        (sum, level) => sum + (level.completed?.length || 0),
        0
      );
      return total >= 1;
    },
  },
  BEGINNER_MASTER: {
    id: 'beginner_master',
    name: 'Beginner Master',
    description: 'Complete all beginner puzzles!',
    emoji: '🌟',
    condition: (progress) => {
      return (progress.beginner?.completed?.length || 0) >= 8;
    },
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get 3 stars on 5 puzzles!',
    emoji: '⭐',
    condition: (progress) => {
      let perfectCount = 0;
      Object.values(progress).forEach((level) => {
        if (level.stars) {
          Object.values(level.stars).forEach((stars) => {
            if (stars === 3) perfectCount++;
          });
        }
      });
      return perfectCount >= 5;
    },
  },
  PUZZLE_EXPLORER: {
    id: 'puzzle_explorer',
    name: 'Puzzle Explorer',
    description: 'Complete 20 puzzles!',
    emoji: '🗺️',
    condition: (progress) => {
      const total = Object.values(progress).reduce(
        (sum, level) => sum + (level.completed?.length || 0),
        0
      );
      return total >= 20;
    },
  },
  INTERMEDIATE_CHAMPION: {
    id: 'intermediate_champion',
    name: 'Intermediate Champion',
    description: 'Complete all intermediate puzzles!',
    emoji: '🏆',
    condition: (progress) => {
      return (progress.intermediate?.completed?.length || 0) >= 8;
    },
  },
  ADVANCED_GENIUS: {
    id: 'advanced_genius',
    name: 'Advanced Genius',
    description: 'Complete all advanced puzzles!',
    emoji: '🧠',
    condition: (progress) => {
      return (progress.advanced?.completed?.length || 0) >= 8;
    },
  },
  PUZZLE_MASTER: {
    id: 'puzzle_master',
    name: 'Puzzle Master',
    description: 'Complete all 50 puzzles!',
    emoji: '👑',
    condition: (progress) => {
      const total = Object.values(progress).reduce(
        (sum, level) => sum + (level.completed?.length || 0),
        0
      );
      return total >= 50;
    },
  },
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Daily Player',
    description: 'Play 7 days in a row!',
    emoji: '🔥',
    condition: async (progress) => {
      try {
        const { getStreak } = require('./streakSystem');
        const streak = await getStreak();
        return streak.currentStreak >= 7;
      } catch (error) {
        return false;
      }
    },
  },
  STREAK_WEEK: {
    id: 'streak_week',
    name: 'Week Warrior',
    description: 'Play 3 days in a row!',
    emoji: '💪',
    condition: async (progress) => {
      try {
        const { getStreak } = require('./streakSystem');
        const streak = await getStreak();
        return streak.currentStreak >= 3;
      } catch (error) {
        return false;
      }
    },
  },
  STREAK_MONTH: {
    id: 'streak_month',
    name: 'Monthly Master',
    description: 'Play 30 days in a row!',
    emoji: '👑',
    condition: async (progress) => {
      try {
        const { getStreak } = require('./streakSystem');
        const streak = await getStreak();
        return streak.currentStreak >= 30;
      } catch (error) {
        return false;
      }
    },
  },
  STORY_EXPLORER: {
    id: 'story_explorer',
    name: 'Story Explorer',
    description: 'Complete your first story chapter!',
    emoji: '📖',
    condition: async (progress) => {
      try {
        const { isChapterCompleted } = require('./storyMode');
        return await isChapterCompleted('chapter1');
      } catch (error) {
        return false;
      }
    },
  },
  STORY_MASTER: {
    id: 'story_master',
    name: 'Story Master',
    description: 'Complete all story chapters!',
    emoji: '📚',
    condition: async (progress) => {
      try {
        const { getChapters, isChapterCompleted } = require('./storyMode');
        const chapters = getChapters();
        for (const chapter of chapters) {
          if (!(await isChapterCompleted(chapter.id))) {
            return false;
          }
        }
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};

/**
 * Check and unlock achievements
 */
export const checkAchievements = async () => {
  try {
    const progress = await getProgress();
    const unlocked = [];

    for (const achievement of Object.values(ACHIEVEMENTS)) {
      try {
        // Check if condition is async
        if (achievement.condition.constructor.name === 'AsyncFunction') {
          const result = await achievement.condition(progress);
          if (result) {
            unlocked.push(achievement);
          }
        } else {
          if (achievement.condition(progress)) {
            unlocked.push(achievement);
          }
        }
      } catch (error) {
        console.error(`Error checking achievement ${achievement.id}:`, error);
      }
    }

    return unlocked;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

/**
 * Get achievement by ID
 */
export const getAchievement = (id) => {
  return Object.values(ACHIEVEMENTS).find((a) => a.id === id);
};


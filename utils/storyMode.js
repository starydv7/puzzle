import storyData from '../data/storyMode.json';
import { getProgress } from './storage';
import { getPuzzlesByLevel } from './gameLogic';

/**
 * Get all chapters
 */
export const getChapters = () => {
  return storyData.chapters;
};

/**
 * Get chapter by ID
 */
export const getChapter = (chapterId) => {
  return storyData.chapters.find(c => c.id === chapterId);
};

/**
 * Check if chapter is unlocked
 */
export const isChapterUnlocked = async (chapterId) => {
  try {
    const chapter = getChapter(chapterId);
    if (!chapter) return false;
    
    if (chapter.unlockCondition === 'none') {
      return true;
    }
    
    const progress = await getProgress();
    
    if (chapter.unlockCondition === 'complete_chapter1') {
      // Check if previous chapter is completed
      const chapter1 = getChapter('chapter1');
      return await isChapterCompleted('chapter1');
    }
    
    if (chapter.unlockCondition === 'complete_chapter2') {
      return await isChapterCompleted('chapter2');
    }
    
    if (chapter.unlockCondition === 'complete_chapter3') {
      return await isChapterCompleted('chapter3');
    }
    
    if (chapter.unlockCondition.startsWith('complete_beginner_')) {
      const count = parseInt(chapter.unlockCondition.split('_')[2]);
      const completed = progress.beginner?.completed?.length || 0;
      return completed >= count;
    }
    
    if (chapter.unlockCondition.startsWith('complete_intermediate_')) {
      const count = parseInt(chapter.unlockCondition.split('_')[2]);
      const completed = progress.intermediate?.completed?.length || 0;
      return completed >= count;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking chapter unlock:', error);
    return false;
  }
};

/**
 * Check if chapter is completed
 */
export const isChapterCompleted = async (chapterId) => {
  try {
    const chapter = getChapter(chapterId);
    if (!chapter) return false;
    
    const progress = await getProgress();
    const allPuzzles = [...getPuzzlesByLevel('beginner'), ...getPuzzlesByLevel('intermediate'), ...getPuzzlesByLevel('advanced')];
    
    // Check if all puzzles in chapter are completed
    const chapterPuzzles = chapter.puzzles || [];
    const allCompleted = chapterPuzzles.every(puzzleId => {
      // Find which level this puzzle belongs to
      for (const level of ['beginner', 'intermediate', 'advanced']) {
        const puzzles = getPuzzlesByLevel(level);
        if (puzzles.find(p => p.id === puzzleId)) {
          return progress[level]?.completed?.includes(puzzleId) || false;
        }
      }
      return false;
    });
    
    return allCompleted;
  } catch (error) {
    console.error('Error checking chapter completion:', error);
    return false;
  }
};

/**
 * Get chapter progress
 */
export const getChapterProgress = async (chapterId) => {
  try {
    const chapter = getChapter(chapterId);
    if (!chapter) return { completed: 0, total: 0, percentage: 0 };
    
    const progress = await getProgress();
    const chapterPuzzles = chapter.puzzles || [];
    
    let completed = 0;
    for (const puzzleId of chapterPuzzles) {
      for (const level of ['beginner', 'intermediate', 'advanced']) {
        const puzzles = getPuzzlesByLevel(level);
        if (puzzles.find(p => p.id === puzzleId)) {
          if (progress[level]?.completed?.includes(puzzleId)) {
            completed++;
          }
          break;
        }
      }
    }
    
    return {
      completed,
      total: chapterPuzzles.length,
      percentage: chapterPuzzles.length > 0 ? Math.round((completed / chapterPuzzles.length) * 100) : 0,
    };
  } catch (error) {
    console.error('Error getting chapter progress:', error);
    return { completed: 0, total: 0, percentage: 0 };
  }
};

/**
 * Get theme colors
 */
export const getThemeColors = (themeName) => {
  return storyData.themes[themeName] || storyData.themes.forest;
};


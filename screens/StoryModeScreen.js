import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import CharacterMascot from '../components/CharacterMascot';
import { getChapters, isChapterUnlocked, isChapterCompleted, getChapterProgress, getThemeColors } from '../utils/storyMode';
import { hapticFeedback } from '../utils/haptics';
import { playSound } from '../utils/soundManager';
import AnimatedButton from '../components/AnimatedButton';

const StoryModeScreen = ({ navigation }) => {
  const [chapters, setChapters] = useState([]);
  const [chapterStatus, setChapterStatus] = useState({});

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    const allChapters = getChapters();
    const status = {};
    
    for (const chapter of allChapters) {
      const unlocked = await isChapterUnlocked(chapter.id);
      const completed = await isChapterCompleted(chapter.id);
      const progress = await getChapterProgress(chapter.id);
      
      status[chapter.id] = {
        unlocked,
        completed,
        progress,
      };
    }
    
    setChapters(allChapters);
    setChapterStatus(status);
  };

  const handleChapterPress = async (chapter) => {
    if (!chapterStatus[chapter.id]?.unlocked) {
      hapticFeedback.error();
      playSound('wrong');
      return;
    }
    
    hapticFeedback.medium();
    playSound('click');
    
    // Navigate to first puzzle in chapter
    if (chapter.puzzles && chapter.puzzles.length > 0) {
      const puzzleId = chapter.puzzles[0];
      // Find which level this puzzle belongs to
      const { getPuzzlesByLevel } = require('../utils/gameLogic');
      let level = 'beginner';
      let puzzleIndex = 0;
      
      for (const lvl of ['beginner', 'intermediate', 'advanced']) {
        const puzzles = getPuzzlesByLevel(lvl);
        const index = puzzles.findIndex(p => p.id === puzzleId);
        if (index !== -1) {
          level = lvl;
          puzzleIndex = index;
          break;
        }
      }
      
      navigation.navigate('Puzzle', {
        level,
        puzzleId,
        puzzleIndex,
        chapterId: chapter.id,
        isStoryMode: true,
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📖 Story Mode</Text>
      </View>

      <CharacterMascot
        emotion="excited"
        message="Let's go on an adventure! Complete chapters to unlock new stories! 🗺️"
        visible={true}
      />

      <View style={styles.chaptersContainer}>
        {chapters.map((chapter, index) => {
          const status = chapterStatus[chapter.id] || {};
          const theme = getThemeColors(chapter.theme);
          const isUnlocked = status.unlocked;
          const isCompleted = status.completed;
          const progress = status.progress || { percentage: 0 };

          return (
            <TouchableOpacity
              key={chapter.id}
              style={[
                styles.chapterCard,
                {
                  backgroundColor: isUnlocked ? theme.background : '#CCCCCC',
                  opacity: isUnlocked ? 1 : 0.6,
                },
              ]}
              onPress={() => handleChapterPress(chapter)}
              disabled={!isUnlocked}
            >
              <View style={styles.chapterHeader}>
                <Text style={styles.chapterNumber}>Chapter {index + 1}</Text>
                {isCompleted && <Text style={styles.completedBadge}>✅</Text>}
                {!isUnlocked && <Text style={styles.lockedBadge}>🔒</Text>}
              </View>

              <Text style={styles.chapterTitle}>{chapter.title}</Text>
              <Text style={styles.chapterStory}>{chapter.story}</Text>

              {isUnlocked && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress.percentage}%`, backgroundColor: theme.accent },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {progress.completed || 0} / {progress.total || 0} puzzles
                  </Text>
                </View>
              )}

              {chapter.reward && isUnlocked && (
                <View style={styles.rewardContainer}>
                  <Text style={styles.rewardText}>Reward: {chapter.reward}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chaptersContainer: {
    padding: 20,
  },
  chapterCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chapterNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  completedBadge: {
    fontSize: 20,
  },
  lockedBadge: {
    fontSize: 20,
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  chapterStory: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.95,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    opacity: 0.9,
  },
  rewardContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default StoryModeScreen;


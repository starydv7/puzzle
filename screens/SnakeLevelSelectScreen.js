import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { getGameConfig, COUNTING_MODES, DIFFICULTY_LEVELS } from '../utils/snakeGameLogic';
import { getSnakeGameProgress, getHighScore } from '../utils/snakeGameStorage';
import { hapticFeedback } from '../utils/haptics';
import { playSound } from '../utils/soundManager';
import AnimatedButton from '../components/AnimatedButton';
import CharacterMascot from '../components/CharacterMascot';

const SnakeLevelSelectScreen = ({ navigation }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('EASY');
  const [progress, setProgress] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState(new Set([1]));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const progressData = await getSnakeGameProgress();
    setProgress(progressData);
    
    const unlocked = new Set([1]);
    progressData.completedLevels?.forEach(level => {
      unlocked.add(level);
      unlocked.add(level + 1); // Unlock next level
    });
    setUnlockedLevels(unlocked);
  };

  const handleLevelPress = async (level) => {
    if (!unlockedLevels.has(level)) {
      hapticFeedback.error();
      playSound('wrong');
      return;
    }

    hapticFeedback.medium();
    playSound('click');
    navigation.navigate('SnakeGame', {
      level,
      difficulty: selectedDifficulty,
    });
  };

  const handleDifficultyChange = (difficulty) => {
    hapticFeedback.light();
    setSelectedDifficulty(difficulty);
  };

  const renderLevelCard = (level) => {
    const config = getGameConfig(level, selectedDifficulty);
    const isLocked = !unlockedLevels.has(level);
    const highScore = progress?.highScores?.[`${level}-${selectedDifficulty}`] || 0;

    return (
      <TouchableOpacity
        key={level}
        style={[
          styles.levelCard,
          isLocked && styles.levelCardLocked,
        ]}
        onPress={() => handleLevelPress(level)}
        disabled={isLocked}
      >
        {isLocked ? (
          <View style={styles.lockedContent}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockedText}>Complete Level {level - 1}</Text>
          </View>
        ) : (
          <View style={styles.levelContent}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelNumber}>Level {level}</Text>
              {highScore > 0 && (
                <Text style={styles.highScore}>🏆 {highScore}</Text>
              )}
            </View>
            <Text style={styles.modeName}>{config.mode.name}</Text>
            <Text style={styles.modeDescription}>{config.mode.description}</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{config.name}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🐍 Snake Counting</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CharacterMascot
            emotion="excited"
            message="Learn counting by playing Snake! Collect numbers in order! 🎮"
            visible={true}
          />

          <View style={styles.difficultySelector}>
            <Text style={styles.sectionTitle}>Choose Difficulty</Text>
            <View style={styles.difficultyButtons}>
              {Object.keys(DIFFICULTY_LEVELS).map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyButton,
                    selectedDifficulty === difficulty && styles.difficultyButtonActive,
                  ]}
                  onPress={() => handleDifficultyChange(difficulty)}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      selectedDifficulty === difficulty && styles.difficultyButtonTextActive,
                    ]}
                  >
                    {DIFFICULTY_LEVELS[difficulty].name}
                  </Text>
                  <Text style={styles.difficultyDescription}>
                    {DIFFICULTY_LEVELS[difficulty].description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.levelsContainer}>
            <Text style={styles.sectionTitle}>Select Level</Text>
            <View style={styles.levelsGrid}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(level =>
                renderLevelCard(level)
              )}
            </View>
          </View>

          {progress && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Your Progress</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progress.totalNumbersCollected || 0}</Text>
                  <Text style={styles.statLabel}>Numbers Collected</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progress.completedLevels?.length || 0}</Text>
                  <Text style={styles.statLabel}>Levels Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progress.bestStreak || 0}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  difficultySelector: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  difficultyButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  difficultyButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    elevation: 4,
  },
  difficultyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  difficultyButtonTextActive: {
    color: '#4CAF50',
  },
  difficultyDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  levelsContainer: {
    padding: 20,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelCardLocked: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  lockedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  levelContent: {
    alignItems: 'center',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  highScore: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  modeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default SnakeLevelSelectScreen;


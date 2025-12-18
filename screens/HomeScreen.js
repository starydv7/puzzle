import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deviceInfo, getMaxContentWidth, getPadding } from '../utils/responsive';
import CharacterMascot from '../components/CharacterMascot';
import AnimatedButton from '../components/AnimatedButton';
import SkeletonLoader from '../components/SkeletonLoader';
import { getLevelDisplayName, getAgeGroup } from '../utils/gameLogic';
import { getSettings, saveSettings } from '../utils/storage';
import { playSound } from '../utils/soundManager';
import { getDailyChallenge, isDailyChallengeCompleted } from '../utils/dailyChallenge';
import { hapticFeedback } from '../utils/haptics';
import { getStreak, updateStreak, getStreakMessage } from '../utils/streakSystem';
import { safeAsync, handleError } from '../utils/errorHandler';

const HomeScreen = ({ navigation }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSettings(),
        loadDailyChallenge(),
        loadStreak(),
      ]);
    } catch (error) {
      handleError(error, 'HomeScreen');
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = useCallback(async () => {
    const result = await safeAsync(() => getStreak(), 'Loading streak');
    if (!result.error) {
      setStreak(result);
    }
  }, []);

  const loadDailyChallenge = useCallback(async () => {
    const challengeResult = await safeAsync(() => getDailyChallenge(), 'Loading daily challenge');
    if (!challengeResult.error) {
      setDailyChallenge(challengeResult);
      const completedResult = await safeAsync(() => isDailyChallengeCompleted(), 'Checking challenge status');
      if (!completedResult.error) {
        setChallengeCompleted(completedResult);
      }
    }
  }, []);

  const loadSettings = useCallback(async () => {
    const result = await safeAsync(() => getSettings(), 'Loading settings');
    if (!result.error) {
      setSoundEnabled(result.soundEnabled ?? true);
    }
  }, []);

  const toggleSound = useCallback(async () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    const result = await safeAsync(async () => {
      const settings = await getSettings();
      return await saveSettings({ ...settings, soundEnabled: newSoundState });
    }, 'Saving settings');
    
    if (result.error) {
      // Revert on error
      setSoundEnabled(soundEnabled);
    }
  }, [soundEnabled]);

  const levels = useMemo(() => ['beginner', 'intermediate', 'advanced'], []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🧩 Puzzle Fun</Text>
          <Text style={styles.subtitle}>Train Your Brain!</Text>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <SkeletonLoader width="100%" height={100} style={styles.skeletonCard} />
            <SkeletonLoader width="100%" height={80} style={styles.skeletonCard} />
            <SkeletonLoader width="100%" height={60} style={styles.skeletonCard} />
          </View>
        ) : (
          <>
            <CharacterMascot 
              emotion="excited"
              message="Welcome! Ready to solve some puzzles? 🎮"
              visible={true}
            />

            {streak && streak.currentStreak > 0 && (
        <View style={styles.streakCard}>
          <Text style={styles.streakTitle}>🔥 Your Streak</Text>
          <Text style={styles.streakCount}>{streak.currentStreak} Days!</Text>
          <Text style={styles.streakMessage}>{getStreakMessage(streak)}</Text>
          {streak.longestStreak > streak.currentStreak && (
            <Text style={styles.longestStreak}>Best: {streak.longestStreak} days</Text>
          )}
        </View>
      )}

      {dailyChallenge && (
        <View style={styles.dailyChallengeCard}>
          <Text style={styles.challengeTitle}>🌟 Daily Challenge</Text>
          <Text style={styles.challengeText}>
            {challengeCompleted 
              ? "✅ You completed today's challenge! Come back tomorrow!"
              : "Complete today's special puzzle for bonus stars!"
            }
          </Text>
          {!challengeCompleted && (
            <AnimatedButton
              title="Start Challenge 🎯"
              onPress={() => {
                hapticFeedback.medium();
                playSound('click');
                navigation.navigate('Puzzle', {
                  level: dailyChallenge.level,
                  puzzleId: dailyChallenge.puzzle.id,
                  puzzleIndex: 0,
                  isDailyChallenge: true,
                });
              }}
              style={styles.challengeButton}
            />
          )}
        </View>
      )}

      <View style={styles.playButtonContainer}>
        <AnimatedButton
          title="Play Now"
          emoji="🎮"
          onPress={() => {
            hapticFeedback.medium();
            playSound('click');
            navigation.navigate('LevelSelect');
          }}
          style={styles.playButton}
        />
        
        <AnimatedButton
          title="Story Mode"
          emoji="📖"
          onPress={() => {
            hapticFeedback.medium();
            playSound('click');
            navigation.navigate('StoryMode');
          }}
          style={styles.storyButton}
        />
        
        <AnimatedButton
          title="Snake Counting"
          emoji="🐍"
          onPress={() => {
            hapticFeedback.medium();
            playSound('click');
            navigation.navigate('SnakeLevelSelect');
          }}
          style={styles.snakeButton}
        />
        
        <AnimatedButton
          title="Bunny's Helpers"
          emoji="🐰"
          onPress={() => {
            hapticFeedback.medium();
            playSound('click');
            navigation.navigate('BunnyGameSelect');
          }}
          style={styles.bunnyButton}
        />
      </View>

      <View style={styles.levelsContainer}>
        <Text style={styles.sectionTitle}>Choose Your Level</Text>
        {levels.map((level) => (
          <TouchableOpacity
            key={level}
            style={styles.levelCard}
            onPress={() => navigation.navigate('LevelSelect', { selectedLevel: level })}
          >
            <Text style={styles.levelName}>{getLevelDisplayName(level)}</Text>
            <Text style={styles.ageGroup}>{getAgeGroup(level)}</Text>
          </TouchableOpacity>
        ))}
      </View>
          </>
        )}
      </ScrollView>

      <View style={styles.fixedFooter}>
        <AnimatedButton
          title="Your Progress"
          emoji="📊"
          onPress={() => {
            hapticFeedback.light();
            navigation.navigate('Stats');
          }}
          style={styles.statsButton}
        />
        
        <AnimatedButton
          title="Settings"
          emoji="⚙️"
          onPress={() => {
            hapticFeedback.light();
            navigation.navigate('Settings');
          }}
          style={styles.settingsButton}
        />
        
        <TouchableOpacity style={styles.soundButton} onPress={toggleSound}>
          <Text style={styles.soundButtonText}>
            {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    backgroundColor: '#4A90E2',
    paddingBottom: 10,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#E3F2FD',
  },
  playButtonContainer: {
    padding: getPadding(),
    alignItems: 'center',
    maxWidth: getMaxContentWidth(),
    alignSelf: 'center',
    width: '100%',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: '100%',
  },
  dailyChallengeCard: {
    backgroundColor: '#FFF9C4',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
    textAlign: 'center',
  },
  challengeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  challengeButton: {
    backgroundColor: '#FF9800',
    width: '100%',
  },
  streakCard: {
    backgroundColor: '#FF6B6B',
    margin: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  streakCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  streakMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  longestStreak: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  storyButton: {
    backgroundColor: '#9C27B0',
    marginTop: 12,
    width: '100%',
  },
  snakeButton: {
    backgroundColor: '#FF5722',
    marginTop: 12,
    width: '100%',
  },
  bunnyButton: {
    backgroundColor: '#FFB74D',
    marginTop: 12,
    width: '100%',
  },
  statsButton: {
    backgroundColor: '#9C27B0',
    marginBottom: 12,
    width: '100%',
  },
  levelsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  levelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ageGroup: {
    fontSize: 16,
    color: '#666',
  },
  fixedFooter: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 12,
  },
  settingsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  soundButton: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  soundButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 20,
  },
  skeletonCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
});

export default HomeScreen;


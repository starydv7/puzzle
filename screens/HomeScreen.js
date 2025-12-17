import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import CharacterMascot from '../components/CharacterMascot';
import AnimatedButton from '../components/AnimatedButton';
import { getLevelDisplayName, getAgeGroup } from '../utils/gameLogic';
import { getSettings, saveSettings } from '../utils/storage';
import { playSound } from '../utils/soundManager';
import { getDailyChallenge, isDailyChallengeCompleted } from '../utils/dailyChallenge';
import { hapticFeedback } from '../utils/haptics';
import { getStreak, updateStreak, getStreakMessage } from '../utils/streakSystem';

const HomeScreen = ({ navigation }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    loadSettings();
    loadDailyChallenge();
    loadStreak();
  }, []);

  const loadStreak = async () => {
    const streakData = await getStreak();
    setStreak(streakData);
  };

  const loadDailyChallenge = async () => {
    const challenge = await getDailyChallenge();
    setDailyChallenge(challenge);
    const completed = await isDailyChallengeCompleted();
    setChallengeCompleted(completed);
  };

  const loadSettings = async () => {
    const settings = await getSettings();
    setSoundEnabled(settings.soundEnabled);
  };

  const toggleSound = async () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    const settings = await getSettings();
    await saveSettings({ ...settings, soundEnabled: newSoundState });
  };

  const levels = ['beginner', 'intermediate', 'advanced'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧩 Puzzle Fun</Text>
        <Text style={styles.subtitle}>Train Your Brain!</Text>
        <CharacterMascot 
          emotion="excited"
          message="Welcome! Ready to solve some puzzles? 🎮"
          visible={true}
        />
      </View>

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

      <View style={styles.footer}>
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
    padding: 30,
    alignItems: 'center',
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
    padding: 20,
    alignItems: 'center',
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
  footer: {
    padding: 20,
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
});

export default HomeScreen;


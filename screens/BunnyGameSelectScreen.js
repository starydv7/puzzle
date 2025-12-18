import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { GAME_MODES, getStoryText } from '../utils/bunnyGameLogic';
import { getBunnyGameProgress } from '../utils/bunnyGameStorage';
import BunnyCharacter from '../components/BunnyCharacter';
import AnimatedButton from '../components/AnimatedButton';
import { hapticFeedback } from '../utils/haptics';
import { playSound } from '../utils/soundManager';

const BunnyGameSelectScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const progressData = await getBunnyGameProgress();
    setProgress(progressData);
  };

  const handleModeSelect = (mode) => {
    hapticFeedback.medium();
    playSound('click');
    navigation.navigate('BunnyModeSelect', { mode });
  };

  const gameModes = [
    {
      id: GAME_MODES.COLLECT,
      title: 'Collect with Bunny',
      emoji: '🥕',
      description: 'Help Bunny collect items!',
      color: '#FFB74D',
    },
    {
      id: GAME_MODES.SHARE,
      title: 'Share with Friends',
      emoji: '🧺',
      description: 'Share items fairly!',
      color: '#81C784',
    },
    {
      id: GAME_MODES.PARTY,
      title: 'Party Preparation',
      emoji: '🎁',
      description: 'Create groups for the party!',
      color: '#BA68C8',
    },
    {
      id: GAME_MODES.FIX,
      title: 'Fix the Mistake',
      emoji: '🐿️',
      description: 'Help Bunny fix sharing mistakes!',
      color: '#FF8A65',
    },
  ];

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
          <Text style={styles.title}>🐰 Bunny's Happy Helpers</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <BunnyCharacter
            emotion="excited"
            message="Welcome, Bunny Helper! 🐰💛\nBunny needs your help today!"
            visible={true}
            size="large"
          />

          {progress && (
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>{progress.totalHelps || 0}</Text>
                  <Text style={styles.progressLabel}>Helps Given</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>{progress.bunnyHappiness || 0}%</Text>
                  <Text style={styles.progressLabel}>Bunny Happiness</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>🏠 {progress.houseLevel || 1}</Text>
                  <Text style={styles.progressLabel}>House Level</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.modesContainer}>
            <Text style={styles.sectionTitle}>Choose How to Help Bunny</Text>
            {gameModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeCard, { borderColor: mode.color }]}
                onPress={() => handleModeSelect(mode.id)}
              >
                <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
                <Text style={[styles.modeStory, { color: mode.color }]}>
                  {getStoryText(mode.id)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFB74D',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB74D',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#8D6E63',
    textAlign: 'center',
  },
  modesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 20,
    textAlign: 'center',
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  modeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 16,
    color: '#8D6E63',
    marginBottom: 12,
    textAlign: 'center',
  },
  modeStory: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default BunnyGameSelectScreen;


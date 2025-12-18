import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { getLevelsForMode, getStoryText } from '../utils/bunnyGameLogic';
import { getBunnyGameProgress, isLevelUnlocked } from '../utils/bunnyGameStorage';
import BunnyCharacter from '../components/BunnyCharacter';
import { hapticFeedback } from '../utils/haptics';
import { playSound } from '../utils/soundManager';

const BunnyModeSelectScreen = ({ navigation, route }) => {
  const { mode } = route.params;
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState(new Set([1]));

  useEffect(() => {
    loadData();
  }, [mode]);

  const loadData = async () => {
    const levelsData = getLevelsForMode(mode);
    setLevels(levelsData);
    
    const progressData = await getBunnyGameProgress();
    setProgress(progressData);
    
    const unlocked = new Set([1]);
    for (const level of levelsData) {
      const unlockedStatus = await isLevelUnlocked(mode, level.id);
      if (unlockedStatus) {
        unlocked.add(level.id);
      }
    }
    setUnlockedLevels(unlocked);
  };

  const handleLevelPress = async (level) => {
    if (!unlockedLevels.has(level.id)) {
      hapticFeedback.error();
      playSound('wrong');
      return;
    }

    hapticFeedback.medium();
    playSound('click');
    navigation.navigate('BunnyGame', { mode, levelId: level.id });
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'collect':
        return '🥕 Collect with Bunny';
      case 'share':
        return '🧺 Share with Friends';
      case 'party':
        return '🎁 Party Preparation';
      case 'fix':
        return '🐿️ Fix the Mistake';
      default:
        return 'Bunny Game';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '#81C784';
      case 'medium':
        return '#FFB74D';
      case 'hard':
        return '#E57373';
      default:
        return '#90A4AE';
    }
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
          <Text style={styles.title}>{getModeTitle()}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <BunnyCharacter
            emotion="excited"
            message={getStoryText(mode)}
            visible={true}
          />

          <View style={styles.levelsContainer}>
            <Text style={styles.sectionTitle}>Choose a Level</Text>
            {levels.map((level) => {
              const isLocked = !unlockedLevels.has(level.id);
              const highScore = progress?.scores?.[`${mode}-${level.id}`] || 0;
              
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelCard,
                    isLocked && styles.levelCardLocked,
                    { borderColor: getDifficultyColor(level.difficulty) },
                  ]}
                  onPress={() => handleLevelPress(level)}
                  disabled={isLocked}
                >
                  {isLocked ? (
                    <View style={styles.lockedContent}>
                      <Text style={styles.lockIcon}>🔒</Text>
                      <Text style={styles.lockedText}>
                        Complete Level {level.id - 1}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.levelContent}>
                      <View style={styles.levelHeader}>
                        <Text style={styles.levelNumber}>Level {level.id}</Text>
                        {highScore > 0 && (
                          <Text style={styles.highScore}>🏆 {highScore}</Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.difficultyBadge,
                          { backgroundColor: getDifficultyColor(level.difficulty) },
                        ]}
                      >
                        <Text style={styles.difficultyText}>
                          {level.difficulty.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  levelsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 20,
    textAlign: 'center',
  },
  levelCard: {
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
  },
  levelCardLocked: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  lockedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 14,
    color: '#8D6E63',
    textAlign: 'center',
  },
  levelContent: {
    alignItems: 'center',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  highScore: {
    fontSize: 16,
    color: '#FFB74D',
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default BunnyModeSelectScreen;


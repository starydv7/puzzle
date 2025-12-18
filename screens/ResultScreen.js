import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import StarRating from '../components/StarRating';
import Confetti from '../components/Confetti';
import CharacterMascot from '../components/CharacterMascot';
import AnimatedButton from '../components/AnimatedButton';
import { getPuzzlesByLevel } from '../utils/gameLogic';
import { playSound } from '../utils/soundManager';
import { checkAchievements } from '../utils/achievements';
import { hapticFeedback } from '../utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ResultScreen = ({ navigation, route }) => {
  const { level, puzzleIndex, stars, isCorrect, explanation } = route.params;
  const puzzles = getPuzzlesByLevel(level);
  const isLastPuzzle = puzzleIndex >= puzzles.length - 1;
  const [showConfetti, setShowConfetti] = useState(true);
  const [newAchievements, setNewAchievements] = useState([]);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const starAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Celebration animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(starAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Play celebration sound
    playSound('celebration');

    // Check for new achievements
    checkAchievements().then((achievements) => {
      if (achievements.length > 0) {
        setNewAchievements(achievements);
      }
    });

    // Hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  }, []);

  const getEncouragingMessage = () => {
    if (stars === 3) return '🌟 Perfect! You\'re amazing!';
    if (stars === 2) return '🎉 Great job! Well done!';
    if (stars === 1) return '👍 Good work! Keep it up!';
    return '💪 Nice try! You\'re learning!';
  };

  const getMascotEmotion = () => {
    if (stars === 3) return 'celebrating';
    if (stars >= 2) return 'excited';
    return 'happy';
  };

  const handleNext = () => {
    if (isLastPuzzle) {
      // Go back to level select
      navigation.navigate('LevelSelect', { selectedLevel: level });
    } else {
      // Go to next puzzle
      const nextPuzzle = puzzles[puzzleIndex + 1];
      navigation.replace('Puzzle', {
        level,
        puzzleId: nextPuzzle.id,
        puzzleIndex: puzzleIndex + 1,
      });
    }
  };

  const handleBackToLevels = () => {
    navigation.navigate('LevelSelect', { selectedLevel: level });
  };

  return (
    <View style={styles.container}>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.mascotContainer}>
              <CharacterMascot 
                emotion={getMascotEmotion()}
                message={getEncouragingMessage()}
                visible={true}
              />
            </View>
            
            <Text style={styles.title}>🎉 Puzzle Complete! 🎉</Text>
            
            <Animated.View 
              style={[
                styles.starsContainer,
                {
                  opacity: starAnim,
                  transform: [{
                    scale: starAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  }],
                },
              ]}
            >
              <StarRating stars={stars} size={36} />
            </Animated.View>

            {newAchievements.length > 0 && (
              <View style={styles.achievementContainer}>
                <Text style={styles.achievementTitle}>🏆 New Achievement!</Text>
                {newAchievements.slice(0, 2).map((achievement, index) => (
                  <View key={index} style={styles.achievementBadge}>
                    <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                    <Text style={styles.achievementName} numberOfLines={1}>{achievement.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {explanation && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>💡 Did you know?</Text>
                <Text style={styles.explanationText} numberOfLines={3}>{explanation}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <View style={styles.buttonsContainer}>
          {!isLastPuzzle && (
            <AnimatedButton
              title="Next Puzzle"
              emoji="➡️"
              onPress={() => {
                hapticFeedback.medium();
                playSound('click');
                handleNext();
              }}
              style={styles.nextButton}
            />
          )}
          
          <AnimatedButton
            title="Back to Levels"
            emoji="🏠"
            onPress={() => {
              hapticFeedback.light();
              playSound('click');
              handleBackToLevels();
            }}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    paddingTop: 12,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  mascotContainer: {
    marginBottom: 4,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  starsContainer: {
    marginVertical: 12,
  },
  message: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  explanationContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    width: '100%',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 6,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 10,
    paddingVertical: 16,
    borderRadius: 20,
    elevation: 4,
  },
  backButton: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 16,
    borderRadius: 20,
    elevation: 4,
  },
  achievementContainer: {
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    width: '100%',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 6,
    textAlign: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  achievementEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
});

export default ResultScreen;

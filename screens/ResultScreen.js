import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import StarRating from '../components/StarRating';
import Confetti from '../components/Confetti';
import CharacterMascot from '../components/CharacterMascot';
import { getPuzzlesByLevel } from '../utils/gameLogic';
import { playSound } from '../utils/soundManager';
import { checkAchievements } from '../utils/achievements';

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
      
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <CharacterMascot 
          emotion={getMascotEmotion()}
          message={getEncouragingMessage()}
          visible={true}
        />
        
        <Text style={styles.title}>Puzzle Complete!</Text>
        
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
          <StarRating stars={stars} size={40} />
        </Animated.View>

        {newAchievements.length > 0 && (
          <View style={styles.achievementContainer}>
            <Text style={styles.achievementTitle}>🏆 New Achievement!</Text>
            {newAchievements.map((achievement, index) => (
              <View key={index} style={styles.achievementBadge}>
                <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
              </View>
            ))}
          </View>
        )}

        {explanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>💡 Did you know?</Text>
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          {!isLastPuzzle && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next Puzzle →</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.backButton} onPress={handleBackToLevels}>
            <Text style={styles.backButtonText}>Back to Levels</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    minWidth: '80%',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  starsContainer: {
    marginVertical: 20,
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
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    width: '100%',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  achievementContainer: {
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  achievementEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ResultScreen;


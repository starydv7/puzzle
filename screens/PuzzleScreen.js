import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import OptionButton from '../components/OptionButton';
import CharacterMascot from '../components/CharacterMascot';
import HintButton from '../components/HintButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPuzzleById, getPuzzleWithShuffledOptions, checkAnswer, calculateStars } from '../utils/gameLogic';
import { saveProgress } from '../utils/storage';
import { playSound } from '../utils/soundManager';
import { hapticFeedback } from '../utils/haptics';
import { completeDailyChallenge } from '../utils/dailyChallenge';
import { updateStreak } from '../utils/streakSystem';
import { recordPerformance } from '../utils/adaptiveDifficulty';

const PuzzleScreen = ({ navigation, route }) => {
  const { level, puzzleId, puzzleIndex } = route.params;
  const [puzzle, setPuzzle] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showMascot, setShowMascot] = useState(true);
  const [mascotMessage, setMascotMessage] = useState("Let's solve this puzzle together! 🤔");
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const isDailyChallenge = route.params?.isDailyChallenge || false;

  useEffect(() => {
    loadPuzzle();
  }, []);

  const loadPuzzle = () => {
    const originalPuzzle = getPuzzleById(level, puzzleId);
    if (originalPuzzle) {
      const shuffledPuzzle = getPuzzleWithShuffledOptions(originalPuzzle);
      setPuzzle(shuffledPuzzle);
    }
  };

  const handleOptionSelect = (index) => {
    if (isSubmitted) return;
    setSelectedIndex(index);
    hapticFeedback.selection();
    playSound('click');
    setMascotMessage("Good choice! Ready to submit? 💪");
  };

  const handleHint = () => {
    if (hintUsed || !puzzle) return;
    setHintUsed(true);
    setShowHint(true);
    hapticFeedback.light();
    playSound('click');
    setMascotMessage("Here's a hint: Look carefully at the pattern! 👀");
    
    // Show hint after a moment
    setTimeout(() => {
      Alert.alert(
        '💡 Hint',
        puzzle.explanation || 'Look for patterns in the sequence!',
        [{ text: 'Got it!', onPress: () => setShowHint(false) }]
      );
    }, 500);
  };

  const handleSubmit = async () => {
    if (selectedIndex === null) {
      Alert.alert('Select an answer', 'Please choose an option before submitting!');
      return;
    }

    setIsSubmitted(true);
    setAttempts(attempts + 1);
    
    const isCorrect = checkAnswer(puzzle, selectedIndex);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const stars = calculateStars(isCorrect, attempts + 1, timeTaken);

    if (isCorrect) {
      hapticFeedback.success();
      playSound('celebration');
      setMascotMessage("🎉 Amazing! You got it right!");
      
      // Animate success
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Save progress
      await saveProgress(level, puzzleId, stars);
      
      // Update streak
      await updateStreak();
      
      // Record performance for adaptive difficulty
      await recordPerformance(puzzleId, {
        attempts: attempts + 1,
        time: timeTaken,
        hintsUsed: hintUsed ? 1 : 0,
        success: true,
      });
      
      // Complete daily challenge if applicable
      if (isDailyChallenge) {
        await completeDailyChallenge();
      }
      
      // Show result after a brief delay
      setTimeout(() => {
        navigation.navigate('Result', {
          level,
          puzzleIndex,
          stars,
          isCorrect: true,
          explanation: puzzle.explanation,
        });
      }, 2000);
    } else {
      hapticFeedback.error();
      playSound('wrong');
      setMascotMessage("Not quite! Let's try again! 💪");
      
      // Show wrong answer feedback
      Alert.alert(
        'Try Again!',
        'That\'s not quite right. Think carefully and try again!',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setIsSubmitted(false);
              setSelectedIndex(null);
              setMascotMessage("You can do it! Try again! 🌟");
            },
          },
        ]
      );
    }
  };

  if (!puzzle) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading puzzle..." />
      </View>
    );
  }

  const displayPattern = () => {
    if (puzzle.pattern) {
      return puzzle.pattern.join(' ');
    }
    if (puzzle.sequence) {
      return puzzle.sequence.join(' → ');
    }
    if (puzzle.items) {
      return puzzle.items.join('  ');
    }
    return '';
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
        <Text style={styles.levelText}>Level {puzzleIndex + 1}</Text>
      </View>

      <View style={styles.content}>
        <CharacterMascot 
          emotion={isSubmitted && puzzle.correct === selectedIndex ? "celebrating" : "thinking"}
          message={mascotMessage}
          visible={showMascot}
        />
        
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{puzzle.question}</Text>
          <Animated.View 
            style={[
              styles.patternContainer,
              {
                transform: [{
                  scale: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                }],
              },
            ]}
          >
            <Text style={styles.patternText}>{displayPattern()}</Text>
          </Animated.View>
        </View>

        <View style={styles.optionsContainer}>
          {puzzle.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = isSubmitted && puzzle.correct === index;
            const isWrong = isSubmitted && selectedIndex === index && !isCorrect;

            return (
              <OptionButton
                key={index}
                option={option}
                onPress={() => handleOptionSelect(index)}
                isSelected={isSelected}
                isCorrect={isCorrect}
                isWrong={isWrong}
                disabled={isSubmitted}
              />
            );
          })}
        </View>

        <View style={styles.actionButtons}>
          {!isSubmitted && (
            <>
              <HintButton
                onPress={handleHint}
                hintUsed={hintUsed}
                disabled={isSubmitted}
              />
              <TouchableOpacity
                style={[styles.submitButton, selectedIndex === null && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={selectedIndex === null}
              >
                <Text style={styles.submitButtonText}>✓ Submit Answer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {isSubmitted && puzzle.correct === selectedIndex && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.correctText}>🎉 Correct! Great job!</Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {},
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  levelText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  patternContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  patternText: {
    fontSize: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  actionButtons: {
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  feedbackContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#C8E6C9',
    borderRadius: 12,
    alignItems: 'center',
  },
  correctText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export default PuzzleScreen;


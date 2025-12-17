import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import AnimatedButton from '../components/AnimatedButton';
import CharacterMascot from '../components/CharacterMascot';

const { width } = Dimensions.get('window');

const TutorialScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const steps = [
    {
      title: "Welcome to Puzzle Fun! 🧩",
      message: "I'm your puzzle buddy! Let's learn how to play together!",
      emoji: "👋",
      mascotEmotion: "excited",
    },
    {
      title: "Choose Your Level 📚",
      message: "Start with Beginner if you're new, or try Intermediate or Advanced!",
      emoji: "🎯",
      mascotEmotion: "encouraging",
    },
    {
      title: "Solve Puzzles 🎮",
      message: "Look at the pattern, sequence, or find the odd one out. Tap your answer!",
      emoji: "💡",
      mascotEmotion: "thinking",
    },
    {
      title: "Earn Stars ⭐",
      message: "Get 1, 2, or 3 stars for each puzzle. Try to get 3 stars on every puzzle!",
      emoji: "🌟",
      mascotEmotion: "happy",
    },
    {
      title: "Unlock More! 🔓",
      message: "Complete puzzles to unlock new ones. The more you play, the more you unlock!",
      emoji: "🎁",
      mascotEmotion: "excited",
    },
    {
      title: "Have Fun! 🎉",
      message: "Remember, there's no time limit! Take your time and have fun learning!",
      emoji: "😊",
      mascotEmotion: "celebrating",
    },
  ];

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial complete - mark as seen
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('@has_seen_tutorial', 'true');
      navigation.replace('Home');
    }
  };

  const skipTutorial = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('@has_seen_tutorial', 'true');
    navigation.replace('Home');
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tutorial</Text>
        <Text style={styles.skipText} onPress={skipTutorial}>Skip</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{currentStepData.emoji}</Text>
        </View>

        <CharacterMascot
          emotion={currentStepData.mascotEmotion}
          message={currentStepData.message}
          visible={true}
        />

        <Text style={styles.title}>{currentStepData.title}</Text>

        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
                index < currentStep && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <AnimatedButton
          title={currentStep === steps.length - 1 ? "Let's Play! 🎮" : "Next →"}
          onPress={nextStep}
          style={styles.nextButton}
          haptic={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#4A90E2',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  skipText: {
    fontSize: 16,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  content: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainer: {
    marginBottom: 20,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#4A90E2',
    width: 20,
  },
  progressDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    width: '100%',
  },
});

export default TutorialScreen;


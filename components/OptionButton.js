import React, { useRef, useEffect, memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

const OptionButton = ({ option, onPress, isSelected, isCorrect, isWrong, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected && !disabled) {
      // Pulse animation when selected
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isSelected, disabled]);

  useEffect(() => {
    if (isCorrect) {
      // Celebration bounce
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 2,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3,
        }),
      ]).start();
    }
  }, [isCorrect]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const getButtonStyle = () => {
    if (disabled && isCorrect) {
      return [styles.button, styles.correctButton];
    }
    if (disabled && isWrong) {
      return [styles.button, styles.wrongButton];
    }
    if (isSelected) {
      return [styles.button, styles.selectedButton];
    }
    return styles.button;
  };

  const animatedStyle = isSelected && !disabled 
    ? { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }
    : { transform: [{ scale: scaleAnim }] };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.optionText}>{option}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    marginVertical: 6,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 65,
    borderWidth: 4,
    borderColor: '#4A90E2',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 5,
    elevation: 6,
  },
  correctButton: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
    borderWidth: 5,
    elevation: 6,
  },
  wrongButton: {
    backgroundColor: '#FFCDD2',
    borderColor: '#F44336',
    borderWidth: 5,
  },
  optionText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333333',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default memo(OptionButton);


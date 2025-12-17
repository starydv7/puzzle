import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { hapticFeedback } from '../utils/haptics';

const AnimatedButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false,
  haptic = true,
  emoji = null 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (haptic) hapticFeedback.light();
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    if (haptic) hapticFeedback.medium();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.button, style, disabled && styles.disabled]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, textStyle]}>
          {emoji && `${emoji} `}
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AnimatedButton;


import React, { useState, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { hapticFeedback } from '../utils/haptics';

const HintButton = ({ onPress, hintUsed, disabled }) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  React.useEffect(() => {
    if (!hintUsed && !disabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [hintUsed, disabled]);

  const handlePress = () => {
    if (disabled || hintUsed) return;
    hapticFeedback.light();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[
          styles.hintButton,
          hintUsed && styles.hintUsed,
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled || hintUsed}
      >
        <Text style={styles.hintText}>
          {hintUsed ? '💡 Hint Used' : '💡 Need a Hint?'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  hintButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hintUsed: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.5,
  },
  hintText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default HintButton;


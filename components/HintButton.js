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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  hintUsed: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.5,
  },
  hintText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default HintButton;


import React, { useRef, useEffect, memo } from 'react';
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
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous gentle bounce animation for kid-friendly feel
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  const handlePressIn = () => {
    if (haptic) hapticFeedback.light();
    
    // Bounce down animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        friction: 4,
        tension: 100,
      }),
      Animated.spring(rotateAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    // Bounce back with extra bounce
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          friction: 3,
          tension: 200,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
        }),
      ]),
      Animated.spring(rotateAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 3,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled) return;
    if (haptic) hapticFeedback.medium();
    onPress();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <Animated.View 
      style={{ 
        transform: [
          { scale: Animated.multiply(scaleAnim, bounceAnim) },
          { rotate },
        ],
      }}
    >
      <TouchableOpacity
        style={[styles.button, style, disabled && styles.disabled]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
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
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default memo(AnimatedButton);


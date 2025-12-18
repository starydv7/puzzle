import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const BunnyCharacter = ({ 
  emotion = 'happy', 
  message, 
  visible = true,
  size = 'medium' 
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Gentle bouncing
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Occasional happy wiggle
      const wiggleInterval = setInterval(() => {
        Animated.sequence([
          Animated.timing(wiggleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: -1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 4000);

      return () => clearInterval(wiggleInterval);
    }
  }, [visible, emotion]);

  const getBunnyEmoji = () => {
    switch (emotion) {
      case 'happy':
        return '🐰';
      case 'excited':
        return '🐰✨';
      case 'thinking':
        return '🤔🐰';
      case 'celebrating':
        return '🎉🐰';
      case 'encouraging':
        return '💪🐰';
      default:
        return '🐰';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60, fontSize: 48 };
      case 'large':
        return { width: 120, height: 120, fontSize: 96 };
      default:
        return { width: 80, height: 80, fontSize: 64 };
    }
  };

  if (!visible) return null;

  const sizeStyle = getSizeStyle();
  const rotate = wiggleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bunnyContainer,
          {
            width: sizeStyle.width,
            height: sizeStyle.height,
            transform: [
              { translateY: bounceAnim },
              { rotate },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Text style={[styles.bunnyEmoji, { fontSize: sizeStyle.fontSize }]}>
          {getBunnyEmoji()}
        </Text>
      </Animated.View>
      {message && (
        <View style={styles.speechBubble}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  bunnyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bunnyEmoji: {
    textAlign: 'center',
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    marginTop: 12,
    maxWidth: 280,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  messageText: {
    fontSize: 16,
    color: '#5D4037',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});

export default BunnyCharacter;


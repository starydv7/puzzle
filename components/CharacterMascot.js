import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const CharacterMascot = ({ emotion = 'happy', message, visible = true }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Bouncing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Occasional scale animation
      const scaleInterval = setInterval(() => {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 3000);

      return () => clearInterval(scaleInterval);
    }
  }, [visible]);

  const getEmoji = () => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'excited':
        return '🎉';
      case 'thinking':
        return '🤔';
      case 'celebrating':
        return '🎊';
      case 'encouraging':
        return '💪';
      default:
        return '😊';
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.mascotContainer,
          {
            transform: [
              { translateY: bounceAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Text style={styles.mascotEmoji}>{getEmoji()}</Text>
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
  mascotContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotEmoji: {
    fontSize: 60,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    marginTop: 10,
    maxWidth: 250,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CharacterMascot;


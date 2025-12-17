import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Confetti = ({ active, onComplete }) => {
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    setVisible(active);
    if (active) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!visible) return null;

  const emojis = ['🎉', '⭐', '✨', '🎊', '🌟', '💫', '🎈', '🎁'];
  const positions = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: -10 - Math.random() * 20,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    delay: Math.random() * 1000,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {positions.map((pos) => (
        <View
          key={pos.id}
          style={[
            styles.confettiPiece,
            {
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            },
          ]}
        >
          <Text style={styles.confettiEmoji}>{pos.emoji}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  confettiPiece: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiEmoji: {
    fontSize: 28,
  },
});

export default Confetti;

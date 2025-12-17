import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          { transform: [{ rotate: spinInterpolate }] },
        ]}
      >
        <Text style={styles.spinnerEmoji}>🧩</Text>
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  spinner: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerEmoji: {
    fontSize: 40,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default LoadingSpinner;


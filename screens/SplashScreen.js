import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if first time user and show tutorial
    const timer = setTimeout(async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const hasSeenTutorial = await AsyncStorage.getItem('@has_seen_tutorial');
      if (!hasSeenTutorial) {
        navigation.replace('Tutorial');
      } else {
        navigation.replace('Home');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>🧩</Text>
        <Text style={styles.title}>Puzzle Fun</Text>
        <Text style={styles.subtitle}>For Kids</Text>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#E3F2FD',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 40,
  },
});

export default SplashScreen;


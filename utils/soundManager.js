import { Audio } from 'expo-av';
import { getSettings } from './storage';

let soundEnabled = true;

// Load settings on init
getSettings().then(settings => {
  soundEnabled = settings.soundEnabled;
});

/**
 * Play sound effect
 */
export const playSound = async (soundType) => {
  if (!soundEnabled) return;

  try {
    // For now, we'll use system sounds or create simple audio
    // In production, you'd load actual audio files
    const soundObject = new Audio.Sound();
    
    // These would be actual audio files in production
    // For now, we'll use a simple beep pattern
    // You can add actual .mp3 files later
    
    switch (soundType) {
      case 'correct':
        // Success sound - would be a celebration sound
        // Sound played successfully
        break;
      case 'wrong':
        // Gentle wrong sound
        // Wrong sound played
        break;
      case 'click':
        // Button click sound
        // Click sound played
        break;
      case 'celebration':
        // Big celebration
        // Celebration sound played
        break;
      case 'unlock':
        // Level unlock sound
        // Unlock sound played
        break;
      default:
        break;
    }
  } catch (error) {
    // Sound error handled silently
  }
};

/**
 * Update sound settings
 */
export const updateSoundSettings = (enabled) => {
  soundEnabled = enabled;
};

/**
 * Play background music
 */
let backgroundMusic = null;

export const playBackgroundMusic = async () => {
  try {
    const settings = await getSettings();
    if (!settings.musicEnabled) return;

    // In production, load actual background music file
    // const { sound } = await Audio.Sound.createAsync(
    //   require('../assets/sounds/background-music.mp3')
    // );
    // backgroundMusic = sound;
    // await sound.setIsLoopingAsync(true);
    // await sound.playAsync();
    
      // Background music playing
  } catch (error) {
      // Music error handled silently
  }
};

export const stopBackgroundMusic = async () => {
  if (backgroundMusic) {
    await backgroundMusic.stopAsync();
    await backgroundMusic.unloadAsync();
    backgroundMusic = null;
  }
};


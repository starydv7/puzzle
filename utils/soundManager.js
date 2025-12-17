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
        console.log('🎉 Correct sound!');
        break;
      case 'wrong':
        // Gentle wrong sound
        console.log('❌ Wrong sound');
        break;
      case 'click':
        // Button click sound
        console.log('👆 Click sound');
        break;
      case 'celebration':
        // Big celebration
        console.log('🎊 Celebration sound!');
        break;
      case 'unlock':
        // Level unlock sound
        console.log('🔓 Unlock sound!');
        break;
      default:
        break;
    }
  } catch (error) {
    console.log('Sound error:', error);
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
    
    console.log('🎵 Background music playing');
  } catch (error) {
    console.log('Music error:', error);
  }
};

export const stopBackgroundMusic = async () => {
  if (backgroundMusic) {
    await backgroundMusic.stopAsync();
    await backgroundMusic.unloadAsync();
    backgroundMusic = null;
  }
};


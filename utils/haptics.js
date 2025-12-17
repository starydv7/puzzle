import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback for better tactile experience
 */
export const hapticFeedback = {
  light: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Fallback if haptics not available
    }
  },
  
  medium: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Fallback if haptics not available
    }
  },
  
  heavy: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      // Fallback if haptics not available
    }
  },
  
  success: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Fallback if haptics not available
    }
  },
  
  error: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      // Fallback if haptics not available
    }
  },
  
  selection: () => {
    try {
      Haptics.selectionAsync();
    } catch (e) {
      // Fallback if haptics not available
    }
  },
};


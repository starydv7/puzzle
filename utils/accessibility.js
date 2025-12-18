/**
 * Accessibility utilities for better screen reader support
 */

export const accessibilityProps = {
  // Button accessibility
  button: (label, hint = '') => ({
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  // Text accessibility
  text: (label) => ({
    accessible: true,
    accessibilityRole: 'text',
    accessibilityLabel: label,
  }),

  // Header accessibility
  header: (label) => ({
    accessible: true,
    accessibilityRole: 'header',
    accessibilityLabel: label,
  }),

  // Image accessibility
  image: (label, hint = '') => ({
    accessible: true,
    accessibilityRole: 'image',
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  // Input accessibility
  input: (label, hint = '') => ({
    accessible: true,
    accessibilityRole: 'textbox',
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  // Link accessibility
  link: (label, hint = '') => ({
    accessible: true,
    accessibilityRole: 'link',
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),
};

// Common accessibility labels
export const labels = {
  playButton: 'Start playing puzzles',
  settingsButton: 'Open settings',
  backButton: 'Go back',
  submitButton: 'Submit your answer',
  hintButton: 'Get a hint for this puzzle',
  soundToggle: 'Toggle sound effects',
  musicToggle: 'Toggle background music',
  levelSelect: 'Select a difficulty level',
  puzzleCard: (number, stars) => `Puzzle ${number}${stars > 0 ? `, ${stars} stars earned` : ''}`,
  lockedPuzzle: (number) => `Puzzle ${number} is locked. Complete previous puzzles to unlock.`,
  starRating: (stars) => `${stars} out of 3 stars`,
  score: (score) => `Your score is ${score}`,
  streak: (days) => `Current streak: ${days} days`,
};

export default {
  accessibilityProps,
  labels,
};


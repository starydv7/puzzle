/**
 * Centralized error handling utilities
 */

export class AppError extends Error {
  constructor(message, code, userMessage) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage || 'Something went wrong. Please try again.';
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorCodes = {
  STORAGE_ERROR: 'STORAGE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  GAME_LOGIC_ERROR: 'GAME_LOGIC_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Handle errors gracefully with user-friendly messages
 */
export const handleError = (error, context = '') => {
  // Log error for debugging (only in development)
  if (__DEV__) {
    console.error(`[${context}] Error:`, error);
  }

  // Return user-friendly message
  if (error instanceof AppError) {
    return error.userMessage;
  }

  // Handle specific error types
  if (error.code === 'STORAGE_ERROR' || error.message?.includes('AsyncStorage')) {
    return 'Unable to save data. Please check your device storage.';
  }

  if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
    return 'Network error. Please check your connection.';
  }

  // Generic error message
  return 'Something unexpected happened. Your progress is safe!';
};

/**
 * Safe async wrapper
 */
export const safeAsync = async (asyncFn, errorMessage = 'Operation failed') => {
  try {
    return await asyncFn();
  } catch (error) {
    const userMessage = handleError(error, errorMessage);
    return { error: true, message: userMessage, originalError: error };
  }
};

/**
 * Retry mechanism
 */
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

/**
 * Validate data before operations
 */
export const validate = {
  puzzle: (puzzle) => {
    if (!puzzle || !puzzle.id) {
      throw new AppError('Invalid puzzle data', ErrorCodes.VALIDATION_ERROR, 'Puzzle data is invalid');
    }
    return true;
  },
  
  level: (level) => {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(level)) {
      throw new AppError('Invalid level', ErrorCodes.VALIDATION_ERROR, 'Invalid level selected');
    }
    return true;
  },
};

export default {
  AppError,
  ErrorCodes,
  handleError,
  safeAsync,
  retry,
  validate,
};


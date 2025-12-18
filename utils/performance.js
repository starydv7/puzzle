/**
 * Performance utilities for monitoring and optimization
 */

// Debounce function for expensive operations
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for frequent events
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Performance timer
export const performanceTimer = {
  start: (label) => {
    if (__DEV__) {
      console.time(label);
    }
  },
  end: (label) => {
    if (__DEV__) {
      console.timeEnd(label);
    }
  },
};

// Memoize expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Batch state updates
export const batchUpdates = (updates) => {
  // React 18+ automatically batches, but this helps with older versions
  return Promise.all(updates);
};

// Note: Use React.lazy() directly in components for code splitting
// Example: const LazyComponent = React.lazy(() => import('./Component'));

// Check if device is low-end
export const isLowEndDevice = () => {
  // Simple heuristic - can be enhanced
  const { deviceInfo } = require('./responsive');
  return deviceInfo.isSmallDevice;
};

// Optimize for low-end devices
export const shouldReduceAnimations = () => {
  return isLowEndDevice();
};

export default {
  debounce,
  throttle,
  performanceTimer,
  memoize,
  batchUpdates,
  lazyLoad,
  isLowEndDevice,
  shouldReduceAnimations,
};


import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
const isTablet = SCREEN_WIDTH >= 768;
const isSmallDevice = SCREEN_WIDTH < 375;
const isLargeDevice = SCREEN_WIDTH >= 414;

// Responsive scaling functions
export const scale = (size) => {
  const baseWidth = 375; // iPhone X width
  return (SCREEN_WIDTH / baseWidth) * size;
};

export const verticalScale = (size) => {
  const baseHeight = 812; // iPhone X height
  return (SCREEN_HEIGHT / baseHeight) * size;
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Responsive font sizes
export const fontSize = {
  xs: moderateScale(10),
  sm: moderateScale(12),
  base: moderateScale(14),
  md: moderateScale(16),
  lg: moderateScale(18),
  xl: moderateScale(20),
  '2xl': moderateScale(24),
  '3xl': moderateScale(28),
  '4xl': moderateScale(32),
  '5xl': moderateScale(36),
  '6xl': moderateScale(48),
};

// Responsive spacing
export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  '2xl': moderateScale(48),
  '3xl': moderateScale(64),
};

// Device info
export const deviceInfo = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isTablet,
  isSmallDevice,
  isLargeDevice,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  aspectRatio: SCREEN_WIDTH / SCREEN_HEIGHT,
};

// Get responsive grid columns
export const getGridColumns = () => {
  if (isTablet) return 4;
  if (SCREEN_WIDTH >= 600) return 3;
  return 2;
};

// Get responsive card width
export const getCardWidth = (columns = 2, gap = 16) => {
  const totalGap = gap * (columns - 1);
  const padding = 32;
  return (SCREEN_WIDTH - totalGap - padding) / columns;
};

// Get responsive button size
export const getButtonSize = () => {
  if (isTablet) return { width: '45%', minHeight: 60 };
  return { width: '100%', minHeight: 50 };
};

// Safe area insets (for notches and curved screens)
export const getSafeAreaInsets = () => {
  // These are approximate - SafeAreaView handles actual insets
  return {
    top: Platform.OS === 'ios' ? (isTablet ? 20 : 44) : 0,
    bottom: Platform.OS === 'ios' ? 34 : 0,
    left: 0,
    right: 0,
  };
};

// Responsive padding
export const getPadding = () => {
  if (isTablet) return spacing.xl;
  if (isSmallDevice) return spacing.sm;
  return spacing.md;
};

// Responsive margin
export const getMargin = () => {
  if (isTablet) return spacing.lg;
  return spacing.md;
};

// Max content width (for tablets)
export const getMaxContentWidth = () => {
  if (isTablet) return 1200;
  return SCREEN_WIDTH;
};

// Responsive font scaling for different devices
export const getResponsiveFontSize = (baseSize) => {
  if (isTablet) return baseSize * 1.2;
  if (isSmallDevice) return baseSize * 0.9;
  return baseSize;
};

export default {
  scale,
  verticalScale,
  moderateScale,
  fontSize,
  spacing,
  deviceInfo,
  getGridColumns,
  getCardWidth,
  getButtonSize,
  getSafeAreaInsets,
  getPadding,
  getMargin,
  getMaxContentWidth,
  getResponsiveFontSize,
};


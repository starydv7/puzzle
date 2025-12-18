import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deviceInfo, getMaxContentWidth, getPadding } from '../utils/responsive';

/**
 * Responsive container that handles:
 * - Safe areas (notches, curved screens)
 * - Tablet layouts
 * - Different screen sizes
 */
const ResponsiveContainer = ({ 
  children, 
  style, 
  safeArea = true,
  maxWidth = true,
  padding = true,
  edges = ['top', 'bottom', 'left', 'right'],
}) => {
  const containerStyle = [
    styles.container,
    maxWidth && { maxWidth: getMaxContentWidth(), alignSelf: 'center', width: '100%' },
    padding && { paddingHorizontal: getPadding() },
    style,
  ];

  if (safeArea) {
    return (
      <SafeAreaView style={containerStyle} edges={edges}>
        {children}
      </SafeAreaView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ResponsiveContainer;


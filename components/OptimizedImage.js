import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

/**
 * Optimized image component with loading state
 */
const OptimizedImage = ({ source, style, resizeMode = 'contain', ...props }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (error) {
    return (
      <View style={[style, styles.errorContainer]}>
        <View style={styles.placeholder} />
      </View>
    );
  }

  return (
    <View style={style}>
      {loading && (
        <View style={StyleSheet.absoluteFill}>
          <SkeletonLoader
            width="100%"
            height="100%"
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      <Image
        source={source}
        style={[style, loading && styles.hidden]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
  },
  errorContainer: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
});

export default OptimizedImage;


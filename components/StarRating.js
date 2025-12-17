import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StarRating = ({ stars, size = 24 }) => {
  const starEmoji = '⭐';
  const emptyStar = '☆';
  
  return (
    <View style={styles.container}>
      <Text style={[styles.star, { fontSize: size }]}>
        {starEmoji.repeat(stars)}{emptyStar.repeat(3 - stars)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    textAlign: 'center',
  },
});

export default StarRating;


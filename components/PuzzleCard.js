import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PuzzleCard = ({ level, index, stars, isLocked, onPress }) => {
  const getStarDisplay = () => {
    if (stars === 0) return '';
    return '⭐'.repeat(stars);
  };

  return (
    <TouchableOpacity
      style={[styles.card, isLocked && styles.lockedCard]}
      onPress={onPress}
      disabled={isLocked}
    >
      <View style={styles.cardContent}>
        <Text style={styles.levelNumber}>{index + 1}</Text>
        {isLocked ? (
          <Text style={styles.lockIcon}>🔒</Text>
        ) : (
          <Text style={styles.starDisplay}>{getStarDisplay()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 80,
    height: 80,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lockedCard: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  starDisplay: {
    fontSize: 16,
  },
  lockIcon: {
    fontSize: 24,
  },
});

export default memo(PuzzleCard);


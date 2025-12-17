import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const OptionButton = ({ option, onPress, isSelected, isCorrect, isWrong, disabled }) => {
  const getButtonStyle = () => {
    if (disabled && isCorrect) {
      return [styles.button, styles.correctButton];
    }
    if (disabled && isWrong) {
      return [styles.button, styles.wrongButton];
    }
    if (isSelected) {
      return [styles.button, styles.selectedButton];
    }
    return styles.button;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.optionText}>{option}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    borderWidth: 3,
    borderColor: '#4A90E2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 4,
  },
  correctButton: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },
  wrongButton: {
    backgroundColor: '#FFCDD2',
    borderColor: '#F44336',
  },
  optionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default OptionButton;


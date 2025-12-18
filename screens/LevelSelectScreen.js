import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import PuzzleCard from '../components/PuzzleCard';
import { getPuzzlesByLevel, getLevelDisplayName, getAgeGroup } from '../utils/gameLogic';
import { getProgress, getPuzzleStars, isPuzzleUnlocked } from '../utils/storage';

const LevelSelectScreen = ({ navigation, route }) => {
  const selectedLevel = route?.params?.selectedLevel || 'beginner';
  const [puzzles, setPuzzles] = useState([]);
  const [progress, setProgress] = useState(null);
  const [puzzleStars, setPuzzleStars] = useState({});

  useEffect(() => {
    const initialize = async () => {
      const puzzlesList = getPuzzlesByLevel(selectedLevel);
      setPuzzles(puzzlesList);
      await loadProgress(puzzlesList);
    };
    initialize();
  }, [selectedLevel]);

  const loadProgress = async (puzzlesList) => {
    const progressData = await getProgress();
    setProgress(progressData);
    
    // Load stars for each puzzle
    const starsData = {};
    for (let i = 0; i < puzzlesList.length; i++) {
      const puzzleId = puzzlesList[i]?.id;
      if (puzzleId) {
        starsData[puzzleId] = await getPuzzleStars(selectedLevel, puzzleId);
      }
    }
    setPuzzleStars(starsData);
  };

  const handlePuzzlePress = async (index) => {
    const puzzle = puzzles[index];
    if (!puzzle) return;
    
    const unlocked = await isPuzzleUnlocked(selectedLevel, index);
    if (!unlocked) {
      alert('Complete previous puzzles to unlock this one!');
      return;
    }
    
    navigation.navigate('Puzzle', {
      level: selectedLevel,
      puzzleId: puzzle.id,
      puzzleIndex: index,
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{getLevelDisplayName(selectedLevel)}</Text>
            <Text style={styles.ageGroup}>{getAgeGroup(selectedLevel)}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.puzzlesGrid}>
        {puzzles.map((puzzle, index) => {
          const stars = puzzleStars[puzzle.id] || 0;
          const isLocked = index > 0 && (!progress || progress[selectedLevel]?.completed?.length < index);
          
          return (
            <PuzzleCard
              key={puzzle.id}
              level={selectedLevel}
              index={index}
              stars={stars}
              isLocked={isLocked}
              onPress={() => handlePuzzlePress(index)}
            />
          );
        })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    backgroundColor: '#4A90E2',
    paddingBottom: 0,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  backButton: {
    marginRight: 10,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ageGroup: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  puzzlesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
  },
});

export default LevelSelectScreen;


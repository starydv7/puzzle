import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { getProgress, getTotalStarsForLevel } from '../utils/storage';
import { checkAchievements } from '../utils/achievements';
import { getPuzzlesByLevel } from '../utils/gameLogic';
import CharacterMascot from '../components/CharacterMascot';
import { getStreak } from '../utils/streakSystem';
import { getPerformanceSummary } from '../utils/adaptiveDifficulty';

const StatsScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [streak, setStreak] = useState(null);
  const [performance, setPerformance] = useState({});

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const progressData = await getProgress();
    setProgress(progressData);

    // Calculate totals
    let total = 0;
    let completed = 0;
    const levels = ['beginner', 'intermediate', 'advanced'];
    
    for (const level of levels) {
      const puzzles = getPuzzlesByLevel(level);
      const levelProgress = progressData[level] || { completed: [], stars: {} };
      completed += levelProgress.completed?.length || 0;
      total += puzzles.length;
      
      const stars = await getTotalStarsForLevel(level);
      setTotalStars(prev => prev + stars);
    }
    
    setTotalPuzzles(completed);

    // Load achievements
    const unlockedAchievements = await checkAchievements();
    setAchievements(unlockedAchievements);
    
    // Load streak
    const streakData = await getStreak();
    setStreak(streakData);
    
    // Load performance summaries
    const beginnerPerf = await getPerformanceSummary('beginner');
    const intermediatePerf = await getPerformanceSummary('intermediate');
    const advancedPerf = await getPerformanceSummary('advanced');
    setPerformance({ beginner: beginnerPerf, intermediate: intermediatePerf, advanced: advancedPerf });
  };

  const getCompletionPercentage = (level) => {
    if (!progress) return 0;
    const puzzles = getPuzzlesByLevel(level);
    const completed = progress[level]?.completed?.length || 0;
    return puzzles.length > 0 ? Math.round((completed / puzzles.length) * 100) : 0;
  };

  const getLevelStars = async (level) => {
    return await getTotalStarsForLevel(level);
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
          <Text style={styles.title}>Your Progress 📊</Text>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >

      <View style={styles.content}>
        <CharacterMascot
          emotion="excited"
          message={`You've completed ${totalPuzzles} puzzles and earned ${totalStars} stars! Amazing! 🌟`}
          visible={true}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Puzzles Completed:</Text>
            <Text style={styles.statValue}>{totalPuzzles}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Stars Earned:</Text>
            <Text style={styles.statValue}>{totalStars} ⭐</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Achievements Unlocked:</Text>
            <Text style={styles.statValue}>{achievements.length} 🏆</Text>
          </View>
          {streak && (
            <>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Current Streak:</Text>
                <Text style={styles.statValue}>🔥 {streak.currentStreak} days</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Longest Streak:</Text>
                <Text style={styles.statValue}>🌟 {streak.longestStreak} days</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.levelStats}>
          <Text style={styles.sectionTitle}>Level Progress</Text>
          
          {['beginner', 'intermediate', 'advanced'].map((level) => {
            const percentage = getCompletionPercentage(level);
            const levelName = level.charAt(0).toUpperCase() + level.slice(1);
            
            return (
              <View key={level} style={styles.levelCard}>
                <View style={styles.levelHeader}>
                  <Text style={styles.levelName}>{levelName}</Text>
                  <Text style={styles.percentage}>{percentage}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.levelDetails}>
                  {progress?.[level]?.completed?.length || 0} / {getPuzzlesByLevel(level).length} puzzles
                </Text>
                {performance[level] && (
                  <View style={styles.performanceDetails}>
                    <Text style={styles.performanceText}>
                      Success Rate: {performance[level].successRate}% | 
                      Avg Time: {performance[level].avgTime}s | 
                      Skill: {performance[level].skillLevel}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {achievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Your Achievements 🏆</Text>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementText}>
            {totalPuzzles < 10 
              ? "Keep going! You're doing great! 💪"
              : totalPuzzles < 30
              ? "Wow! You're becoming a puzzle master! 🌟"
              : "Incredible! You're a true puzzle genius! 👑"
            }
          </Text>
        </View>
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
  backButton: {
    marginRight: 15,
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
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  levelStats: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  levelDetails: {
    fontSize: 14,
    color: '#666',
  },
  performanceDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  performanceText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  achievementsSection: {
    marginBottom: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
  },
  encouragementCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  encouragementText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
});

export default StatsScreen;


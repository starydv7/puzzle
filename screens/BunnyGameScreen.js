import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { getLevel, GAME_MODES, isSharingFair, getBunnyMessage, calculateScore } from '../utils/bunnyGameLogic';
import { recordLevelCompletion } from '../utils/bunnyGameStorage';
import BunnyCharacter from '../components/BunnyCharacter';
import DraggableItem from '../components/DraggableItem';
import AnimatedButton from '../components/AnimatedButton';
import { hapticFeedback } from '../utils/haptics';
import { playSound } from '../utils/soundManager';
import { getRewardOptions, getRewardKeys } from '../utils/bunnyGameLogic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BunnyGameScreen = ({ navigation, route }) => {
  const { mode, levelId } = route.params;
  const level = getLevel(mode, levelId);
  
  const [gameState, setGameState] = useState('playing'); // playing, success, reward
  const [collectedCount, setCollectedCount] = useState(0);
  const [friendItems, setFriendItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [bunnyMessage, setBunnyMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedReward, setSelectedReward] = useState(null);
  
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    if (mode === GAME_MODES.COLLECT) {
      setBunnyMessage(`I need ${level.target} ${level.items[0]}s! 🥕`);
    } else if (mode === GAME_MODES.SHARE) {
      setFriendItems(new Array(level.friends).fill(0));
      setBunnyMessage(`I have ${level.items} ${level.itemType}s. Can you help me give everyone the same amount?`);
    } else if (mode === GAME_MODES.PARTY) {
      setBunnyMessage(`I have ${level.items} ${level.itemType}s. I want groups of ${level.groupSize} for plates!`);
    }
  };

  // MODE 1: Collect with Bunny
  const handleItemCollect = () => {
    if (mode !== GAME_MODES.COLLECT) return;
    
    const newCount = collectedCount + 1;
    setCollectedCount(newCount);
    
    hapticFeedback.light();
    playSound('click');
    
    if (newCount >= level.target) {
      handleSuccess();
    } else {
      setBunnyMessage(`Great! I need ${level.target - newCount} more! 🥕`);
    }
  };

  // MODE 2: Share with Friends
  const handleItemShare = (friendIndex) => {
    if (mode !== GAME_MODES.SHARE) return;
    
    const newItems = [...friendItems];
    newItems[friendIndex] = (newItems[friendIndex] || 0) + 1;
    setFriendItems(newItems);
    
    hapticFeedback.light();
    playSound('click');
    
    const totalShared = newItems.reduce((sum, count) => sum + count, 0);
    if (totalShared >= level.items) {
      checkSharingFairness(newItems);
    }
  };

  const checkSharingFairness = (items) => {
    const result = isSharingFair(items, level.items, level.friends);
    
    if (result.isFair) {
      handleSuccess();
    } else {
      setAttempts(prev => prev + 1);
      hapticFeedback.error();
      playSound('wrong');
      setBunnyMessage(getBunnyMessage('mistake'));
      
      // Show which friends need adjustment
      Alert.alert(
        'Almost There!',
        `Each friend should have ${result.expectedPerFriend} items. Can you fix it?`,
        [{ text: 'Try Again', onPress: () => {} }]
      );
    }
  };

  const handleSuccess = () => {
    setGameState('success');
    hapticFeedback.success();
    playSound('celebration');
    
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setBunnyMessage(getBunnyMessage('happy'));
    
    setTimeout(() => {
      setGameState('reward');
    }, 2000);
  };

  const handleRewardSelect = async (rewardId) => {
    setSelectedReward(rewardId);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const score = calculateScore(mode, level, {
      attempts,
      time: timeTaken,
    });
    
    await recordLevelCompletion(mode, levelId, score, rewardId);
    
    hapticFeedback.success();
    playSound('celebration');
    
    Alert.alert(
      '🎉 Great Job, Helper!',
      `You earned ${score} points!\nBunny is so happy! 🐰💛`,
      [
        {
          text: 'Play Again',
          onPress: () => navigation.replace('BunnyGame', { mode, levelId }),
        },
        {
          text: 'Next Level',
          onPress: () => {
            if (getLevel(mode, levelId + 1)) {
              navigation.replace('BunnyGame', { mode, levelId: levelId + 1 });
            } else {
              navigation.navigate('BunnyModeSelect', { mode });
            }
          },
        },
        {
          text: 'Back to Menu',
          onPress: () => navigation.navigate('BunnyModeSelect', { mode }),
        },
      ]
    );
  };

  const renderCollectMode = () => {
    const itemsNeeded = level.target - collectedCount;
    const itemsToShow = Math.max(itemsNeeded, 5);
    
    return (
      <View style={styles.gameArea}>
        <View style={styles.basketContainer}>
          <Text style={styles.basketLabel}>Bunny's Basket</Text>
          <View style={styles.basket}>
            <Text style={styles.basketCount}>{collectedCount} / {level.target}</Text>
            {Array.from({ length: collectedCount }).map((_, i) => (
              <Text key={i} style={styles.basketItem}>
                {level.items[0] === 'carrot' ? '🥕' : level.items[0] === 'apple' ? '🍎' : '🍓'}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.itemsContainer}>
          {Array.from({ length: itemsToShow }).map((_, i) => (
            <TouchableOpacity
              key={i}
              style={styles.itemButton}
              onPress={handleItemCollect}
              disabled={collectedCount >= level.target}
            >
              <Text style={styles.itemEmoji}>
                {level.items[0] === 'carrot' ? '🥕' : level.items[0] === 'apple' ? '🍎' : '🍓'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderShareMode = () => {
    const totalShared = friendItems.reduce((sum, count) => sum + count, 0);
    const itemsRemaining = level.items - totalShared;
    
    return (
      <View style={styles.gameArea}>
        <View style={styles.friendsContainer}>
          {friendItems.map((count, index) => (
            <View key={index} style={styles.friendCard}>
              <Text style={styles.friendEmoji}>
                {index === 0 ? '🐿️' : index === 1 ? '🐢' : index === 2 ? '🐥' : '🐰'}
              </Text>
              <Text style={styles.friendCount}>{count}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleItemShare(index)}
                disabled={itemsRemaining <= 0}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.itemsPool}>
          <Text style={styles.itemsPoolLabel}>
            Items to Share: {itemsRemaining}
          </Text>
          <View style={styles.itemsRow}>
            {Array.from({ length: itemsRemaining }).map((_, i) => (
              <Text key={i} style={styles.poolItem}>
                {level.itemType === 'carrot' ? '🥕' : level.itemType === 'apple' ? '🍎' : '🍓'}
              </Text>
            ))}
          </View>
        </View>

        <AnimatedButton
          title="Check Sharing"
          emoji="✓"
          onPress={() => checkSharingFairness(friendItems)}
          disabled={itemsRemaining > 0}
          style={styles.checkButton}
        />
      </View>
    );
  };

  const renderRewardScreen = () => {
    const rewards = getRewardOptions();
    const rewardKeys = getRewardKeys();
    
    return (
      <View style={styles.rewardContainer}>
        <BunnyCharacter
          emotion="celebrating"
          message="Thank you, Helper! Choose your reward! 🎁"
          visible={true}
        />
        
        <Text style={styles.rewardTitle}>Choose Your Reward! 🎁</Text>
        <Text style={styles.rewardSubtitle}>Bunny wants to thank you!</Text>
        
        <ScrollView
          style={styles.rewardsScroll}
          contentContainerStyle={styles.rewardsGrid}
          showsVerticalScrollIndicator={false}
        >
          {rewardKeys.map((rewardId, index) => {
            const reward = rewards[rewardId];
            return (
              <TouchableOpacity
                key={rewardId}
                style={[
                  styles.rewardCard,
                  selectedReward === rewardId && styles.rewardCardSelected,
                ]}
                onPress={() => handleRewardSelect(rewardId)}
              >
                <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (gameState === 'reward') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choose Reward</Text>
          </View>
          {renderRewardScreen()}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Level {levelId}</Text>
        </View>

        <View style={styles.content}>
          <BunnyCharacter
            emotion={gameState === 'success' ? 'celebrating' : 'happy'}
            message={bunnyMessage}
            visible={true}
          />

          {mode === GAME_MODES.COLLECT && renderCollectMode()}
          {mode === GAME_MODES.SHARE && renderShareMode()}
          {mode === GAME_MODES.PARTY && renderShareMode()} {/* Temporary - same as share */}
          {mode === GAME_MODES.FIX && renderShareMode()} {/* Temporary - same as share */}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFB74D',
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
  },
  basketContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  basketLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 12,
  },
  basket: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    minHeight: 120,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FFE082',
  },
  basketCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB74D',
    marginBottom: 8,
  },
  basketItem: {
    fontSize: 32,
    margin: 4,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  itemButton: {
    width: 70,
    height: 70,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFE082',
  },
  itemEmoji: {
    fontSize: 40,
  },
  friendsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  friendCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    margin: 8,
    minWidth: 100,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#C5E1A5',
  },
  friendEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  friendCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#66BB6A',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#81C784',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  itemsPool: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },
  itemsPoolLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 12,
    textAlign: 'center',
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  poolItem: {
    fontSize: 32,
    margin: 4,
  },
  checkButton: {
    backgroundColor: '#81C784',
    marginTop: 20,
  },
  rewardContainer: {
    flex: 1,
    padding: 20,
  },
  rewardsScroll: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D4037',
    textAlign: 'center',
    marginBottom: 8,
  },
  rewardSubtitle: {
    fontSize: 18,
    color: '#8D6E63',
    textAlign: 'center',
    marginBottom: 30,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '45%',
    marginBottom: 16,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFE082',
  },
  rewardCardSelected: {
    borderColor: '#FFB74D',
    borderWidth: 4,
    backgroundColor: '#FFF9C4',
  },
  rewardEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: '#8D6E63',
    textAlign: 'center',
  },
});

export default BunnyGameScreen;


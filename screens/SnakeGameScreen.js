import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGameConfig, generateSequence, isCorrectNumber, calculateScore, COUNTING_MODES } from '../utils/snakeGameLogic';
import { recordGameResult } from '../utils/snakeGameStorage';
import { playSound } from '../utils/soundManager';
import { hapticFeedback } from '../utils/haptics';
import AnimatedButton from '../components/AnimatedButton';
import CharacterMascot from '../components/CharacterMascot';
import { deviceInfo, scale, getPadding } from '../utils/responsive';

// Dynamic grid size based on device
const getGridConfig = (screenWidth) => {
  const isTablet = screenWidth >= 768;
  const padding = getPadding() * 2;
  const availableWidth = screenWidth - padding;
  
  if (isTablet) {
    // Larger grid for tablets
    const gridSize = 25;
    const cellSize = Math.floor(availableWidth / gridSize);
    return { gridSize, cellSize };
  } else {
    // Standard grid for phones
    const gridSize = 20;
    const cellSize = Math.floor(availableWidth / gridSize);
    return { gridSize, cellSize };
  }
};

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const SnakeGameScreen = ({ navigation, route }) => {
  const { level, difficulty } = route.params;
  const config = useMemo(() => getGameConfig(level, difficulty), [level, difficulty]);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { gridSize: GRID_SIZE, cellSize: CELL_SIZE } = useMemo(
    () => getGridConfig(SCREEN_WIDTH),
    [SCREEN_WIDTH]
  );
  
  const [snake, setSnake] = useState([]);
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [nextDirection, setNextDirection] = useState(DIRECTIONS.RIGHT);
  const [food, setFood] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [expectedNumber, setExpectedNumber] = useState(null);
  const [numbersCollected, setNumbersCollected] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameStarted, setGameStarted] = useState(false);
  const [mascotMessage, setMascotMessage] = useState(`Collect numbers: ${config.mode.description}`);
  
  const gameLoopRef = useRef(null);
  const sequenceRef = useRef(null);
  const currentIndexRef = useRef(0);
  const directionRef = useRef(DIRECTIONS.RIGHT);
  const foodRef = useRef(null);

  // Initialize game
  useEffect(() => {
    // Generate sequence
    const sequence = generateSequence(config.mode, config.startNumber, 100);
    sequenceRef.current = sequence;
    
    // Set initial expected number (first number in sequence)
    if (sequence.length > 0) {
      setExpectedNumber(sequence[0]);
      currentIndexRef.current = 0;
    }
    
    // Initialize snake
    const initialSnake = [];
    for (let i = 0; i < config.startLength; i++) {
      initialSnake.push({ x: i, y: Math.floor(GRID_SIZE / 2) });
    }
    setSnake(initialSnake);
    
    // Spawn initial food after snake is set
    const timer = setTimeout(() => {
      if (sequence.length > 0 && initialSnake.length > 0) {
        spawnFood(initialSnake, sequence[0]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [GRID_SIZE, config.startLength]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    // Update direction ref when nextDirection changes
    directionRef.current = nextDirection;

    gameLoopRef.current = setInterval(() => {
      moveSnake();
    }, config.speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameStarted, gameOver, isPaused, nextDirection]);

  const spawnFood = useCallback((currentSnake, targetNumber) => {
    // Get target number from sequence if not provided
    if (!targetNumber && sequenceRef.current) {
      targetNumber = sequenceRef.current[currentIndexRef.current];
    }
    if (!targetNumber || targetNumber === undefined || targetNumber === null) {
      return;
    }
    
    // Use provided snake or empty array as fallback
    const snakeToCheck = currentSnake || [];
    
    // Place correct number
    let newFood;
    let attempts = 0;
    const maxAttempts = 300;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        number: targetNumber,
        isCorrect: true,
      };
      attempts++;
      
      // Check if position is not on snake
      const isOnSnake = snakeToCheck.some(segment => 
        segment && segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) {
        break;
      }
    } while (attempts < maxAttempts);
    
    if (newFood && attempts < maxAttempts) {
      setFood(newFood);
      foodRef.current = newFood;
    }
  }, [GRID_SIZE]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      if (!head || prevSnake.length === 0) {
        return prevSnake;
      }
      
      // Use ref to get current direction (avoids stale closure)
      const currentDir = directionRef.current;
      const newHead = {
        x: head.x + currentDir.x,
        y: head.y + currentDir.y,
      };

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setTimeout(() => handleGameOver(), 0);
        return prevSnake;
      }

      // Check self collision (don't check head itself, only body)
      const bodyCollision = prevSnake.slice(1).some(segment => 
        segment.x === newHead.x && segment.y === newHead.y
      );
      if (bodyCollision) {
        setTimeout(() => handleGameOver(), 0);
        return prevSnake;
      }

      // Check food collision using ref (current food state)
      const currentFood = foodRef.current;
      const foodEaten = currentFood && 
        newHead.x === currentFood.x && 
        newHead.y === currentFood.y;

      if (foodEaten) {
        // Food eaten - grow snake and handle collection
        const foodToCollect = { ...currentFood };
        
        // Clear food immediately
        setFood(null);
        foodRef.current = null;
        
        // Handle collection asynchronously
        setTimeout(() => {
          handleFoodCollection(foodToCollect);
        }, 0);
        
        // Return grown snake (don't remove tail - snake grows)
        return [newHead, ...prevSnake];
      } else {
        // No food eaten - move snake (remove tail to maintain length)
        return [newHead, ...prevSnake.slice(0, -1)];
      }
    });
  }, [GRID_SIZE]);

  const handleFoodCollection = useCallback((collectedFood) => {
    if (!collectedFood || !collectedFood.number) return;

    const currentExpected = expectedNumber;
    if (!currentExpected) return;

    const isCorrect = isCorrectNumber(collectedFood.number, currentExpected);
    
    if (isCorrect) {
      // Correct number!
      hapticFeedback.success();
      playSound('celebration');
      setMascotMessage(`Great! You found ${collectedFood.number}! 🎉`);
      
      setScore(prev => {
        const newScore = (prev || 0) + 10;
        return newScore;
      });
      
      setNumbersCollected(prev => {
        const newCount = (prev || 0) + 1;
        
        // Move to next expected number
        if (sequenceRef.current && currentIndexRef.current < sequenceRef.current.length - 1) {
          currentIndexRef.current++;
          const nextExpected = sequenceRef.current[currentIndexRef.current];
          if (nextExpected !== undefined && nextExpected !== null) {
            setExpectedNumber(nextExpected);
          }
        }
        
        // Check for level completion (collect 20 numbers)
        if (newCount >= 20) {
          setTimeout(() => handleLevelComplete(), 500);
        } else {
          // Spawn new food after a short delay
          setTimeout(() => {
            const nextNum = sequenceRef.current?.[currentIndexRef.current];
            if (nextNum !== undefined && nextNum !== null) {
              // Get current snake and spawn food
              setSnake(currentSnake => {
                if (currentSnake && currentSnake.length > 0) {
                  // Spawn food with current snake
                  spawnFood(currentSnake, nextNum);
                }
                return currentSnake;
              });
            }
          }, 400);
        }
        
        return newCount;
      });
    } else {
      // Wrong number - game over
      hapticFeedback.error();
      playSound('wrong');
      Vibration.vibrate(500);
      setMascotMessage(`Oops! That's not ${currentExpected}. Try again! 💪`);
      setTimeout(() => handleGameOver(), 500);
    }
  }, [expectedNumber, spawnFood]);

  const handleLevelComplete = async () => {
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
    const modeKey = Object.keys(COUNTING_MODES).find(
      key => COUNTING_MODES[key].step === config.mode.step
    ) || 'COUNT_BY_1';
    
    const finalScore = calculateScore(numbersCollected || 0, timeElapsed, difficulty, modeKey);
    
    await recordGameResult(level, difficulty, finalScore || 0, numbersCollected || 0, true);
    
    hapticFeedback.success();
    playSound('celebration');
    
    Alert.alert(
      '🎉 Level Complete! 🎉',
      `You collected ${numbersCollected || 0} numbers!\nScore: ${finalScore || 0}`,
      [
        {
          text: 'Play Again',
          onPress: () => {
            navigation.replace('SnakeGame', { level, difficulty });
          },
        },
        {
          text: 'Next Level',
          onPress: () => {
            if (level < 10) {
              navigation.replace('SnakeGame', { level: level + 1, difficulty });
            } else {
              navigation.navigate('SnakeLevelSelect');
            }
          },
        },
        {
          text: 'Back to Menu',
          onPress: () => navigation.navigate('SnakeLevelSelect'),
        },
      ]
    );
  };

  const handleGameOver = async () => {
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
    const modeKey = Object.keys(COUNTING_MODES).find(
      key => COUNTING_MODES[key].step === config.mode.step
    ) || 'COUNT_BY_1';
    
    const finalScore = calculateScore(numbersCollected || 0, timeElapsed, difficulty, modeKey);
    
    await recordGameResult(level, difficulty, finalScore || 0, numbersCollected || 0, false);
    
    Alert.alert(
      'Game Over!',
      `You collected ${numbersCollected || 0} numbers!\nScore: ${finalScore || 0}\n\nFind the number: ${expectedNumber || config.mode.step}`,
      [
        {
          text: 'Try Again',
          onPress: () => {
            navigation.replace('SnakeGame', { level, difficulty });
          },
        },
        {
          text: 'Back to Menu',
          onPress: () => navigation.navigate('SnakeLevelSelect'),
        },
      ]
    );
  };

  const changeDirection = (newDirection) => {
    // Get current direction from ref to avoid stale state
    const currentDir = directionRef.current;
    
    // Prevent reversing into itself
    if (
      (newDirection.x === -currentDir.x && newDirection.y === currentDir.y) ||
      (newDirection.y === -currentDir.y && newDirection.x === currentDir.x)
    ) {
      return;
    }
    setNextDirection(newDirection);
    directionRef.current = newDirection;
  };

  const startGame = () => {
    // Ensure expected number is set
    if (!expectedNumber && sequenceRef.current && sequenceRef.current.length > 0) {
      setExpectedNumber(sequenceRef.current[0]);
      currentIndexRef.current = 0;
    }
    
    setGameStarted(true);
    const targetNum = expectedNumber || sequenceRef.current?.[0] || config.mode.step;
    setMascotMessage(`Find number: ${targetNum}! 🎯`);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      setMascotMessage('Game Paused ⏸️');
    } else {
      setMascotMessage(`Find number: ${expectedNumber}! 🎯`);
    }
  };

  const renderCell = (x, y) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = food?.x === x && food?.y === y;

    const cellSize = CELL_SIZE - 2;
    let cellStyle = [styles.cell, { width: cellSize, height: cellSize }];
    let cellContent = null;

    if (isSnakeHead) {
      cellStyle = [styles.cell, styles.snakeHead, { width: cellSize, height: cellSize }];
      cellContent = <Text style={[styles.snakeHeadText, { fontSize: cellSize * 0.6 }]}>🐍</Text>;
    } else if (isSnakeBody) {
      cellStyle = [styles.cell, styles.snakeBody, { width: cellSize, height: cellSize }];
    } else if (isFood) {
      cellStyle = [styles.cell, food.isCorrect ? styles.foodCorrect : styles.foodWrong, { width: cellSize, height: cellSize }];
      cellContent = (
        <Text style={[styles.foodNumber, { fontSize: cellSize * 0.5 }]}>
          {food.number}
        </Text>
      );
    }

    return (
      <View key={`${x}-${y}`} style={cellStyle}>
        {cellContent}
      </View>
    );
  };

  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Snake Counting</Text>
          </View>

          <View style={styles.startScreen}>
            <CharacterMascot
              emotion="excited"
              message={mascotMessage}
              visible={true}
            />
            
            <View style={styles.gameInfo}>
              <Text style={styles.infoTitle}>Level {level}</Text>
              <Text style={styles.infoText}>{config.mode.name}</Text>
              <Text style={styles.infoText}>{config.mode.description}</Text>
              <Text style={styles.infoText}>Difficulty: {config.name}</Text>
              <Text style={styles.instructionText}>
                Collect numbers in order: {config.mode.description}
              </Text>
            </View>

            <AnimatedButton
              title="Start Game"
              emoji="🎮"
              onPress={startGame}
              style={styles.startButton}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={togglePause}>
            <Text style={styles.pauseButton}>{isPaused ? '▶️' : '⏸️'}</Text>
          </TouchableOpacity>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score || 0}</Text>
            <Text style={styles.expectedText}>Find: {expectedNumber || sequenceRef.current?.[0] || config.mode.step}</Text>
            <Text style={styles.collectedText}>Collected: {numbersCollected || 0}/20</Text>
          </View>
        </View>

        {isPaused && (
          <View style={styles.pauseOverlay}>
            <Text style={styles.pauseText}>Game Paused</Text>
            <AnimatedButton
              title="Resume"
              emoji="▶️"
              onPress={togglePause}
              style={styles.resumeButton}
            />
          </View>
        )}

        <View style={styles.gameArea}>
          <View style={[styles.grid, { width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }]}>
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => renderCell(x, y))
            )}
          </View>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection(DIRECTIONS.UP)}
              disabled={isPaused || gameOver}
            >
              <Text style={styles.controlButtonText}>↑</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection(DIRECTIONS.LEFT)}
              disabled={isPaused || gameOver}
            >
              <Text style={styles.controlButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.controlSpacer} />
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection(DIRECTIONS.RIGHT)}
              disabled={isPaused || gameOver}
            >
              <Text style={styles.controlButtonText}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection(DIRECTIONS.DOWN)}
              disabled={isPaused || gameOver}
            >
              <Text style={styles.controlButtonText}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213e',
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expectedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  collectedText: {
    color: '#FFD700',
    fontSize: 12,
  },
  startScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameInfo: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginVertical: 20,
    alignItems: 'center',
    elevation: 5,
  },
  infoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 4,
  },
  instructionText: {
    fontSize: 16,
    color: '#4A90E2',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 2,
    alignSelf: 'center',
  },
  cell: {
    backgroundColor: '#16213e',
    margin: 1,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snakeHead: {
    backgroundColor: '#4CAF50',
  },
  snakeHeadText: {
    // Font size set dynamically in renderCell
  },
  snakeBody: {
    backgroundColor: '#81C784',
  },
  foodCorrect: {
    backgroundColor: '#FFD700',
    elevation: 3,
  },
  foodWrong: {
    backgroundColor: '#FF6B6B',
  },
  foodNumber: {
    // Font size set dynamically in renderCell
    fontWeight: 'bold',
    color: '#000',
  },
  controls: {
    padding: 20,
    backgroundColor: '#16213e',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
  },
  controlButton: {
    backgroundColor: '#4A90E2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    elevation: 3,
  },
  controlButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  controlSpacer: {
    width: 60,
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pauseText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
});

export default SnakeGameScreen;


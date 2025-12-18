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
import { getGameConfig, generateSequence, isCorrectNumber, calculateScore } from '../utils/snakeGameLogic';
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
  const [expectedNumber, setExpectedNumber] = useState(config.mode.step);
  const [numbersCollected, setNumbersCollected] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameStarted, setGameStarted] = useState(false);
  const [mascotMessage, setMascotMessage] = useState(`Collect numbers: ${config.mode.description}`);
  
  const gameLoopRef = useRef(null);
  const sequenceRef = useRef(generateSequence(config.mode, config.startNumber, 100));
  const currentIndexRef = useRef(0);

  // Initialize snake
  useEffect(() => {
    const initialSnake = [];
    for (let i = 0; i < config.startLength; i++) {
      initialSnake.push({ x: i, y: Math.floor(GRID_SIZE / 2) });
    }
    setSnake(initialSnake);
    spawnFood();
  }, [GRID_SIZE]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      moveSnake();
    }, config.speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameStarted, gameOver, isPaused]);

  const spawnFood = useCallback(() => {
    const nextNumber = sequenceRef.current[currentIndexRef.current];
    if (!nextNumber) return;
    
    // Place correct number
    let newFood;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        number: nextNumber,
        isCorrect: true,
      };
      attempts++;
      if (attempts > 100) break; // Prevent infinite loop
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    if (newFood) {
      setFood(newFood);
    }
  }, [snake]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      if (!head) return prevSnake;
      
      const currentDir = nextDirection;
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
        handleGameOver();
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        handleGameOver();
        return prevSnake;
      }

      // Check food collision before moving
      setFood(currentFood => {
        if (currentFood && newHead.x === currentFood.x && newHead.y === currentFood.y) {
          // Food eaten - grow snake
          handleFoodCollection(currentFood);
          return null; // Remove food, will spawn new one
        }
        return currentFood;
      });

      const newSnake = [newHead, ...prevSnake];
      
      // Check if food was eaten (snake should grow)
      const foodEaten = food && newHead.x === food.x && newHead.y === food.y;
      
      // Remove tail if no food eaten
      return foodEaten ? newSnake : newSnake.slice(0, -1);
    });
  }, [nextDirection, food]);

  const handleFoodCollection = useCallback((collectedFood) => {
    if (!collectedFood) return;

    const isCorrect = isCorrectNumber(collectedFood.number, expectedNumber);
    
    if (isCorrect) {
      // Correct number!
      hapticFeedback.success();
      playSound('celebration');
      setMascotMessage(`Great! You found ${collectedFood.number}! 🎉`);
      
      setScore(prev => prev + 10);
      setNumbersCollected(prev => {
        const newCount = prev + 1;
        
        // Move to next expected number
        currentIndexRef.current++;
        const nextExpected = sequenceRef.current[currentIndexRef.current];
        if (nextExpected) {
          setExpectedNumber(nextExpected);
        }
        
        // Check for level completion (collect 20 numbers)
        if (newCount >= 20) {
          setTimeout(() => handleLevelComplete(), 100);
        } else {
          setTimeout(() => spawnFood(), 100);
        }
        
        return newCount;
      });
    } else {
      // Wrong number - game over
      hapticFeedback.error();
      playSound('wrong');
      Vibration.vibrate(500);
      setMascotMessage(`Oops! That's not ${expectedNumber}. Try again! 💪`);
      setTimeout(() => handleGameOver(), 100);
    }
  }, [expectedNumber, spawnFood]);

  const handleLevelComplete = async () => {
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    const timeElapsed = Date.now() - startTime;
    const finalScore = calculateScore(numbersCollected, timeElapsed, difficulty, config.mode);
    
    await recordGameResult(level, difficulty, finalScore, numbersCollected, true);
    
    hapticFeedback.success();
    playSound('celebration');
    
    Alert.alert(
      '🎉 Level Complete! 🎉',
      `You collected ${numbersCollected} numbers!\nScore: ${finalScore}`,
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
    }
    
    const timeElapsed = Date.now() - startTime;
    const finalScore = calculateScore(numbersCollected, timeElapsed, difficulty, config.mode);
    
    await recordGameResult(level, difficulty, finalScore, numbersCollected, false);
    
    Alert.alert(
      'Game Over!',
      `You collected ${numbersCollected} numbers!\nScore: ${finalScore}\n\nFind the number: ${expectedNumber}`,
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
    // Prevent reversing into itself
    if (
      (newDirection.x === -direction.x && newDirection.y === direction.y) ||
      (newDirection.y === -direction.y && newDirection.x === direction.x)
    ) {
      return;
    }
    setNextDirection(newDirection);
  };

  const startGame = () => {
    setGameStarted(true);
    setMascotMessage(`Find number: ${expectedNumber}! 🎯`);
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
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.expectedText}>Find: {expectedNumber}</Text>
            <Text style={styles.collectedText}>Collected: {numbersCollected}/20</Text>
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


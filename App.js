import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import SplashScreen from './screens/SplashScreen';
import TutorialScreen from './screens/TutorialScreen';
import HomeScreen from './screens/HomeScreen';
import LevelSelectScreen from './screens/LevelSelectScreen';
import PuzzleScreen from './screens/PuzzleScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatsScreen from './screens/StatsScreen';
import StoryModeScreen from './screens/StoryModeScreen';
import AboutScreen from './screens/AboutScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import ErrorBoundary from './components/ErrorBoundary';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#F5F5F5' },
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Tutorial" component={TutorialScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
          <Stack.Screen name="Puzzle" component={PuzzleScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Stats" component={StatsScreen} />
          <Stack.Screen name="StoryMode" component={StoryModeScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}


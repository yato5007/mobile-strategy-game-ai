/**
 * AppNavigator — Stack-based navigation for the game.
 *
 * Screens:
 * - Home: Title screen
 * - Lobby: Match configuration
 * - Game: Main gameplay
 * - Results: End-of-match standings
 * - Settings: Audio/language/about
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { I18nManager } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import LobbyScreen from '../screens/LobbyScreen';
import GameScreen from '../screens/GameScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// ─── Types ──────────────────────────────────────────────────────

export type RootStackParamList = {
  Home: undefined;
  Lobby: undefined;
  Game: {
    mode: 'ffa' | '2v2';
    playerSlots: Array<{
      isBot: boolean;
      difficulty?: string;
      style?: string;
    }>;
  };
  Results: {
    gameState: any;
    gameResult: any;
    mode: 'ffa' | '2v2';
  };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── Navigator ──────────────────────────────────────────────────

export const AppNavigator: React.FC = () => {
  const isRTL = I18nManager.isRTL;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          orientation: 'portrait',
          contentStyle: {
            backgroundColor: '#1A2744',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Lobby"
          component={LobbyScreen}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

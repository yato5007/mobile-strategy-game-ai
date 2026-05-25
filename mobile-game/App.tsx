/**
 * App.tsx — Root component for the strategy game.
 *
 * Initializes:
 * - i18n localization (Arabic/English, RTL support)
 * - React Navigation (stack navigator)
 * - SafeAreaProvider
 * - GestureHandlerRootView
 */
import React, { useEffect } from 'react';
import { StyleSheet, LogBox, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useUIStore } from './src/state/uiStore';
import { Dimensions } from 'react-native';

// Initialize i18n
import './src/localization/i18n';

// Suppress known warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Reanimated 2',
]);

export default function App() {
  const { updateDimensions } = useUIStore();

  // Track screen dimensions for responsive layout
  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    updateDimensions(width, height);

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      updateDimensions(window.width, window.height);
    });

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#1A2744"
          translucent={false}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A2744',
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@/hooks/useFonts';
import { SplashScreen as CustomSplashScreen } from '@/components/SplashScreen';
import '../global.css';
import { Text, TouchableOpacity, View } from 'react-native';

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
SplashScreen.hideAsync();


const App  = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboard-flow" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function Layout() {
  const { fontsLoaded, error, retryLoading } = useFonts();
  const [isAppReady, setIsAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  // Prepare the app
  useEffect(() => {
    async function prepare() {
      try {
        // Hide the native splash screen immediately
        await SplashScreen.hideAsync();
        
        // Wait for fonts to load
        if (fontsLoaded && !error) {
          // Add a small delay to ensure everything is ready
          await new Promise(resolve => setTimeout(resolve, 1500));
          setIsAppReady(true);
        }
      } catch (e) {
        console.warn('Error preparing app:', e);
        // Still mark as ready even if there's an error
        setIsAppReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, error]);

  const handleSplashComplete = useCallback(() => {
    setShowCustomSplash(false);
  }, []);

  // Show custom splash screen while loading
  if (showCustomSplash) {
    return (
      <CustomSplashScreen
        isReady={isAppReady}
        onAnimationComplete={handleSplashComplete}
      />
    );
  }

  // Show error state if fonts failed to load
  if (error) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fefefe' },
        }}>
       <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboard-flow" />
      <Stack.Screen name="(tabs)" />
      </Stack>
    );
  }

  // Fonts are loaded successfully, render the app
  return (
      <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboard-flow" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
        animation: 'slide_from_right', // Nice animation for onboarding flow
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="enable-faceid" />
      <Stack.Screen name="enable-notifications" />
    </Stack>
  );
}
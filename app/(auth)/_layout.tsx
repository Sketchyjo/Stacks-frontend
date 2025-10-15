import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} >
    <Stack.Screen name="index" />
    <Stack.Screen name="onboarding" />
    <Stack.Screen name="onboarding/trust-device" />
    <Stack.Screen name="onboarding/enable-faceid" />
    <Stack.Screen name="onboarding/enable-notifications" />
    <Stack.Screen name="signin" />
    <Stack.Screen name="verify-email" />
    {/* <Stack.Screen name="verify-otp" />
    <Stack.Screen name="forgot-password" />
    <Stack.Screen name="reset-password" /> */}
  </Stack>;
}

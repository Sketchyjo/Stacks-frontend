import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { Button } from '../../components/ui';

export default function EnableFaceID() {
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Face ID');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const iconPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Check biometric availability and type
    checkBiometricType();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start icon pulse animation
    startPulseAnimation();
  }, []);

  const checkBiometricType = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return;

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Touch ID');
      } else {
        setBiometricType('Biometric Authentication');
      }
    } catch (error) {
      console.log('Error checking biometric type:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(iconPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleEnable = async () => {
    setIsLoading(true);

    try {
      // Check if biometric authentication is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert(
          'Not Available',
          `${biometricType} is not available on this device.`,
          [{ text: 'OK', onPress: () => handleMaybeLater() }]
        );
        setIsLoading(false);
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          'No Biometrics Enrolled',
          `Please set up ${biometricType} in your device settings first.`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false) },
            { text: 'Open Settings', onPress: () => handleOpenSettings() },
          ]
        );
        return;
      }

      // Authenticate to enable biometric login
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType} for Stacks`,
        subtitle: 'Use your biometrics to sign in quickly and securely',
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Save biometric preference
        setTimeout(() => {
          setIsLoading(false);
          router.push('/(auth)/onboarding/enable-notifications');
        }, 500);
      } else {
        setIsLoading(false);
        if (result.error !== 'user_cancel') {
          Alert.alert(
            'Authentication Failed',
            'Unable to verify your identity. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log('Biometric authentication error:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMaybeLater = () => {
    router.push('/(auth)/onboarding/enable-notifications');
  };

  const handleOpenSettings = () => {
    setIsLoading(false);
    // In a real app, you would open device settings
    Alert.alert(
      'Open Settings',
      `Please go to Settings > ${Platform.OS === 'ios' ? 'Face ID & Passcode' : 'Security'} to set up ${biometricType}.`,
      [{ text: 'OK' }]
    );
  };

  const getBiometricIcon = () => {
    if (biometricType.includes('Face')) {
      return 'face-recognition'; // Custom icon or use scan-outline
    } else if (biometricType.includes('Touch')) {
      return 'finger-print';
    } else {
      return 'scan-outline';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <Animated.View 
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }],
        }}
      >
        {/* Content */}
        <View className="flex-1 px-6">
          {/* Icon Container */}
          <View className="mb-8 mt-20 items-center">
            <Animated.View 
              style={{ transform: [{ scale: iconPulseAnim }] }}
              className="mb-6 h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-green-50 to-teal-50"
            >
              {/* Custom Face ID icon representation */}
              <View className="relative h-20 w-20">
                {/* Outer frame */}
                <View className="absolute inset-0 rounded-2xl border-4 border-green-400">
                  {/* Corner brackets */}
                  <View className="absolute -left-1 -top-1 h-4 w-4 border-l-4 border-t-4 border-green-600 rounded-tl-md" />
                  <View className="absolute -right-1 -top-1 h-4 w-4 border-r-4 border-t-4 border-green-600 rounded-tr-md" />
                  <View className="absolute -bottom-1 -left-1 h-4 w-4 border-b-4 border-l-4 border-green-600 rounded-bl-md" />
                  <View className="absolute -bottom-1 -right-1 h-4 w-4 border-b-4 border-r-4 border-green-600 rounded-br-md" />
                </View>
                
                {/* Face representation */}
                <View className="absolute inset-0 items-center justify-center">
                  <View className="h-2 w-2 rounded-full bg-green-600" />
                  <View className="mt-1 flex-row space-x-1">
                    <View className="h-1 w-1 rounded-full bg-green-600" />
                    <View className="h-1 w-1 rounded-full bg-green-600" />
                  </View>
                  <View className="mt-1 h-1 w-3 rounded-full bg-green-600" />
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Title & Description */}
          <View className="mb-12">
            <Text className="mb-4 font-sf-pro-bold text-[28px] leading-[34px] text-gray-900">
              Enable {biometricType}
            </Text>
            <Text className="font-sf-pro-regular text-[16px] leading-[24px] text-gray-600">
              {biometricType} is a convenient and secure method of signing into your account.
            </Text>
          </View>

          {/* Security Features */}
          <View className="mb-8 space-y-4">
            <View className="flex-row items-start">
              <View className="mr-3 mt-1 rounded-full bg-green-100 p-1">
                <Ionicons name="flash" size={16} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="font-sf-pro-medium text-[14px] text-gray-900">
                  Quick & Easy Access
                </Text>
                <Text className="mt-1 font-sf-pro-regular text-[13px] text-gray-600">
                  Sign in instantly without typing your password
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="mr-3 mt-1 rounded-full bg-green-100 p-1">
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="font-sf-pro-medium text-[14px] text-gray-900">
                  Enhanced Security
                </Text>
                <Text className="mt-1 font-sf-pro-regular text-[13px] text-gray-600">
                  Your biometric data never leaves your device
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="absolute bottom-0 left-0 right-0">
            <Button
              title="Enable"
              onPress={handleEnable}
              loading={isLoading}
              className="mb-4 rounded-full"
            />
            
            <TouchableOpacity
              onPress={handleMaybeLater}
              className="items-center py-4"
              disabled={isLoading}
            >
              <Text className="font-sf-pro-medium text-[16px] text-blue-600">
                Maybe later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
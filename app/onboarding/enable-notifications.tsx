import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Button } from '../../components/ui';

export default function EnableNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const bellAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    // Start bell animation
    startBellAnimation();
  }, []);

  const startBellAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnimation, {
          toValue: -1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(2000), // Pause between rings
      ])
    ).start();
  };

  const handleEnable = async () => {
    setIsLoading(true);

    try {
      // Request notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        // Configure notification behavior
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        // Simulate saving notification preferences
        setTimeout(() => {
          setIsLoading(false);
          // Navigate to main app - onboarding complete
          router.replace('/(tabs)');
        }, 1000);
      } else {
        setIsLoading(false);
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive important updates about your account.',
          [
            { text: 'Skip for now', onPress: () => handleMaybeLater() },
            { text: 'Open Settings', onPress: () => handleOpenSettings() },
          ]
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.log('Notification permission error:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMaybeLater = () => {
    // Navigate to main app without notifications
    router.replace('/(tabs)');
  };

  const handleOpenSettings = () => {
    setIsLoading(false);
    // In a real app, you would deep link to device settings
    Alert.alert(
      'Open Settings',
      'Please go to Settings > Notifications > Stacks to enable notifications.',
      [{ text: 'OK' }]
    );
  };

  const bellRotation = bellAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

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
            <View className="mb-6 h-32 w-32 items-center justify-center rounded-3xl bg-yellow-50">
              <Animated.View
                style={{
                  transform: [{ rotate: bellRotation }],
                }}
              >
                <View className="relative">
                  {/* Bell */}
                  <Ionicons name="notifications" size={72} color="#F59E0B" />
                  
                  {/* Notification dot */}
                  <View className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-red-500">
                    <Text className="font-sf-pro-bold text-[10px] text-white">!</Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>

          {/* Title & Description */}
          <View className="mb-12">
            <Text className="mb-4 font-sf-pro-bold text-[28px] leading-[34px] text-gray-900">
              Enable Notifications
            </Text>
            <Text className="font-sf-pro-regular text-[16px] leading-[24px] text-gray-600">
              Keep your financial health and security in check by being notified of purchases, rewards earned, and upcoming credit payments.
            </Text>
          </View>

          {/* Notification Types */}
          <View className="mb-8 space-y-4">
            <View className="flex-row items-start">
              <View className="mr-3 mt-1 rounded-full bg-green-100 p-1">
                <Ionicons name="card" size={16} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="font-sf-pro-medium text-[14px] text-gray-900">
                  Transaction Alerts
                </Text>
                <Text className="mt-1 font-sf-pro-regular text-[13px] text-gray-600">
                  Get notified about purchases and account activity
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="mr-3 mt-1 rounded-full bg-blue-100 p-1">
                <Ionicons name="gift" size={16} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-sf-pro-medium text-[14px] text-gray-900">
                  Rewards & Offers
                </Text>
                <Text className="mt-1 font-sf-pro-regular text-[13px] text-gray-600">
                  Never miss cashback opportunities and special offers
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="mr-3 mt-1 rounded-full bg-orange-100 p-1">
                <Ionicons name="calendar" size={16} color="#F97316" />
              </View>
              <View className="flex-1">
                <Text className="font-sf-pro-medium text-[14px] text-gray-900">
                  Payment Reminders
                </Text>
                <Text className="mt-1 font-sf-pro-regular text-[13px] text-gray-600">
                  Stay on top of due dates and avoid late fees
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="mr-3 mt-1 rounded-full bg-purple-100 p-1">
                <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="font-sf-pro-medium text-[14px] text-gray-900">
                  Security Alerts
                </Text>
                <Text className="mt-1 font-sf-pro-regular text-[13px] text-gray-600">
                  Important security updates and suspicious activity
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
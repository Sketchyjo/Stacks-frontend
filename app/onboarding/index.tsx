import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';

const { width } = Dimensions.get('window');

export default function TrustDevice() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAlwaysTrust = async () => {
    setIsLoading(true);
    
    // Simulate saving trust preference
    setTimeout(() => {
      setIsLoading(false);
      router.push('/(auth)/onboarding/enable-faceid');
    }, 1000);
  };

  const handleTrustOnce = async () => {
    // Navigate to next screen without setting permanent trust
    router.push('/(auth)/onboarding/enable-faceid');
  };

  const handleClose = () => {
    router.back();
  };

  const handleHelp = () => {
    // Could open a help modal or navigate to help screen
    console.log('Help requested');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <Animated.View 
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideUpAnim },
            { scale: scaleAnim },
          ],
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={handleClose}
            className="rounded-full bg-gray-100 p-2"
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleHelp}
            className="rounded-full bg-gray-100 p-2"
          >
            <Ionicons name="help-circle-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          {/* Icon Container */}
          <View className="mb-8 mt-12 items-center">
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-blue-50">
              <Ionicons name="shield-checkmark" size={48} color="#3B82F6" />
            </View>
          </View>

          {/* Title & Description */}
          <View className="mb-12">
            <Text className="mb-4 font-sf-pro-bold text-[28px] leading-[34px] text-gray-900">
              Trust this device?
            </Text>
            <Text className="font-sf-pro-regular text-[16px] leading-[24px] text-gray-600">
              We won't ask to verify your identity again if you trust this device. Only select "Always trust" if this device is not shared.
            </Text>
          </View>

          {/* Security Info */}
          <View className="mb-8 rounded-2xl bg-gray-50 p-4">
            <View className="flex-row items-start">
              <View className="mr-3 mt-1 rounded-full bg-green-100 p-1">
                <Ionicons name="lock-closed" size={16} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="font-sf-pro-medium text-[14px] text-gray-900">
                  Your data is always encrypted
                </Text>
                <Text className="mt-1 font-sf-pro-regular text-[13px] text-gray-600">
                  Even trusted devices are secured with bank-level encryption.
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="absolute bottom-0 left-0 right-0">
            <Button
              title="Always trust"
              onPress={handleAlwaysTrust}
              loading={isLoading}
              className="mb-4 rounded-full"
            />
            
            <TouchableOpacity
              onPress={handleTrustOnce}
              className="items-center py-4"
              disabled={isLoading}
            >
              <Text className="font-sf-pro-medium text-[16px] text-blue-600">
                Trust once
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
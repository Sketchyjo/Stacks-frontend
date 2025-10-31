import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  isReady?: boolean;
}

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  isReady = false,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Initial entrance animation
    const entranceAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]);

    // Logo rotation animation (continuous)
    const rotateAnimation = Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Pulse animation for loading indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations
    entranceAnimation.start();
    rotateAnimation.start();
    pulseAnimation.start();

    // Exit animation when ready
    if (isReady) {
      setTimeout(() => {
        const exitAnimation = Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]);

        exitAnimation.start(() => {
          rotateAnimation.stop();
          pulseAnimation.stop();
          onAnimationComplete?.();
        });
      }, 800); // Show for at least 800ms after ready
    }

    // Cleanup
    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, [isReady]);

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="flex-1 justify-center items-center bg-[#1E1A3E]">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Text className='text-white text-[60px] font-display-artistic font-bold'>STACKs</Text>
    </View>
  );
};

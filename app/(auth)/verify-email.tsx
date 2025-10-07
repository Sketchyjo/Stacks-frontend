import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { OTPInput, Button } from '../../components/ui';

export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Validate OTP code and handle routing
  const validateOTP = useCallback(async (code: string) => {
    if (code.length !== 6) {
      return false;
    }

    setIsLoading(true);
    
    // Simulate API call
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        // For demo purposes, accept only 123456 as valid code
        const isValid = code === '123456';
        
        if (isValid) {
          // Success state
          setIsInvalid(false);
          setError('');
          
         router.replace('/(tabs)')
        } else {
          // Error state
          setIsInvalid(true);
          setError('Invalid verification code. Try 123456 for demo.');
          
          // Announce error to screen readers
          AccessibilityInfo.isScreenReaderEnabled().then(
            screenReaderEnabled => {
              if (screenReaderEnabled) {
                AccessibilityInfo.announceForAccessibility('Invalid verification code. Please try again.');
              }
            }
          );
        }
        
        resolve(isValid);
      }, 1500);
    });
  }, [router]);

  const handleOTPComplete = async (code: string) => {
    setOtp(code);
    setError('');
    
    // Auto-validate when all digits are entered
    await validateOTP(code);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setIsInvalid(true);
      return;
    }

    await validateOTP(otp);
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsResendLoading(true);
    setError('');
    setIsInvalid(false);
    
    // Simulate API call
    setTimeout(() => {
      setIsResendLoading(false);
      setResendTimer(60);
      setCanResend(false);
      setOtp(''); // Clear current OTP input
      
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      
      // Announce to screen readers
      AccessibilityInfo.isScreenReaderEnabled().then(
        screenReaderEnabled => {
          if (screenReaderEnabled) {
            AccessibilityInfo.announceForAccessibility('New verification code sent to your email');
          }
        }
      );
    }, 1500);
  };

  const handlePasteCode = () => {
    // This would typically handle clipboard paste
    // For demo, we'll just focus the first input
    Alert.alert(
      'Paste Code',
      'In a real app, this would paste the code from your clipboard or from SMS.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Main Content */}
      <View className="flex-1 px-6 pb-6">
        {/* Title */}
        <View className="mb-8 mt-8">
          <Text 
            className="font-heading text-[34px] text-gray-900"
            accessibilityRole="header"
          >
            Confirm email
          </Text>
          <View className="mt-4">
            <Text 
              className="font-sf-pro-medium text-[18px] text-gray-600"
              accessibilityLabel="The code has been sent to"
            >
              The code has been sent to
            </Text>
            <Text 
              className="mt-1 font-heading-light text-[28px] text-gray-900"
              accessibilityLabel={`Email: ${email || 'your email'}`}
            >
              {email || 'your email'}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View className="mb-8">
          <Text 
            className="font-sf-pro-medium text-base text-gray-600"
            accessibilityLabel="Please check your inbox and paste the code from the email below"
          >
            Please check your inbox and{'\n'}paste the code from the email below
          </Text>
        </View>

        {/* OTP Input */}
        <View className="mb-8">
          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            error={error}
            isInvalid={isInvalid}
            autoValidate={true}
          />
          <TouchableOpacity
            onPress={handlePasteCode}
            className="mt-4 items-center justify-center mx-auto rounded-full bg-gray-100 px-4 py-2 w-[30%]"
            accessibilityLabel="Paste verification code"
            accessibilityHint="Tap to paste verification code from clipboard"
            accessibilityRole="button"
          >
            <Text className="font-sf-pro-medium text-[14px] text-gray-600">
              Paste
            </Text>
          </TouchableOpacity>
        </View>
    
        <View className="flex-1" />

        {/* Verify Button */}
        <View className="mb-6">
          <Button
            title="Verify Email"
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.length !== 6 || isLoading}
            className='rounded-full'
            accessibilityLabel="Verify Email"
            accessibilityHint="Tap to verify your email with the entered code"
          />
        </View>

        {/* Resend Code */}
        <View className="items-center">
          {canResend ? (
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={isResendLoading}
              className="py-2"
              accessibilityLabel="Didn't receive the code? Resend"
              accessibilityHint="Tap to request a new verification code"
              accessibilityRole="button"
            >
              <Text className="font-sf-pro-rounded-medium text-base text-gray-900">
                {isResendLoading ? 'Sending...' : "Didn't receive the code? Resend"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text 
              className="py-2 font-sf-pro-semibold text-base text-gray-500"
              accessibilityLabel={`Resend code in ${resendTimer} seconds`}
            >
              Resend code in {resendTimer}s
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
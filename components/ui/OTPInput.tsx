import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  AccessibilityInfo,
} from 'react-native';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  error?: string;
  isInvalid?: boolean;
  autoValidate?: boolean;
}

const { width } = Dimensions.get('window');

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  error,
  isInvalid = false,
  autoValidate = false,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasError, setHasError] = useState(isInvalid);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Reset error state when user starts typing again
  useEffect(() => {
    if (hasError && otp.some(digit => digit !== '')) {
      setHasError(false);
    }
  }, [otp, hasError]);

  // Handle external error state changes
  useEffect(() => {
    setHasError(isInvalid);
  }, [isInvalid]);

  // Auto-validate and call onComplete when all digits are filled
  useEffect(() => {
    const isComplete = otp.every((digit) => digit !== '');
    if (isComplete) {
      onComplete?.(otp.join(''));
      
      // If it's the last input, dismiss keyboard if autoValidate is true
      if (autoValidate) {
        Keyboard.dismiss();
      }
    }
  }, [otp, onComplete, autoValidate]);

  // Focus first input on component mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Only take the last character if multiple characters are entered
    const lastChar = value.substring(value.length - 1);
    newOtp[index] = lastChar;
    setOtp(newOtp);

    // Auto-focus next input - ensure this runs immediately
    if (lastChar && index < length - 1) {
      // Use requestAnimationrame to ensure focus happens in the next UI cycle
      requestAnimationFrame(() => {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      });
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
        newOtp[index - 1] = '';
      } else {
        newOtp[index] = '';
      }
      setOtp(newOtp);
    }
  };

  const handlePaste = async () => {
    try {
      // Focus first input for paste functionality
      inputRefs.current[0]?.focus();
      
      // Announce to screen readers
      AccessibilityInfo.isScreenReaderEnabled().then(
        screenReaderEnabled => {
          if (screenReaderEnabled) {
            AccessibilityInfo.announceForAccessibility('Ready to paste verification code');
          }
        }
      );
    } catch (error) {
      console.error('Error handling paste:', error);
    }
  };

  const boxSize = Math.min((width - 60) / length - 4, 90);

  return (
    <View className="w-full" accessible={false}>
      <TouchableOpacity 
        activeOpacity={1}
        onPress={handlePaste}
        className="flex-row justify-center gap-x-2"
        accessibilityLabel="OTP input field"
        accessibilityHint="Enter your verification code"
        accessibilityRole="keyboardkey"
      >
        {otp.map((digit, index) => (
          <View
            key={index}
            style={{ width: boxSize, height: boxSize }}
            className={`items-center justify-center rounded-2xl border-2 bg-gray-50 ${
              hasError
                ? 'border-[#b91c1c] bg-white'
                : activeIndex === index
                ? 'border-gray-400 bg-white'
                : digit
                ? 'border-gray-300 bg-white'
                : 'border-gray-200'
            }`}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setActiveIndex(index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              className="h-full w-full font-sf-pro-rounded-semibold text-2xl text-gray-900"
              caretHidden
              selectTextOnFocus
              accessibilityLabel={`Digit ${index + 1} of ${length}`}
              accessibilityHint={`Enter digit ${index + 1} of verification code`}
              importantForAccessibility="yes"
            />
          </View>
        ))}
      </TouchableOpacity>
      {error && (
        <Text 
          className="mt-2 text-center text-sm font-sf-pro-rounded-regular text-red-500"
          accessibilityLabel={`Error: ${error}`}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
};
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewProps,
  GestureResponderEvent,
} from 'react-native';
import { Icon } from '../atoms/Icon';
import { Button } from '../ui/Button';

const BACKSPACE_KEY = 'backspace';

const DEFAULT_KEYPAD_LAYOUT = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', BACKSPACE_KEY],
] as const;

type KeypadKey = (typeof DEFAULT_KEYPAD_LAYOUT)[number][number] | string;

export type AmountInputStatus = 'empty' | 'default' | 'error';

export interface AmountInputProps extends ViewProps {
  /**
   * Heading rendered at the top of the component (e.g "Invest in basket")
   */
  title?: string;
  /**
   * Label displayed above the primary account selector block
   */
  sourceLabel?: string;
  /**
   * Value displayed inside the account selector block
   */
  sourceValue?: string;
  /**
   * Optional trailing label shown on the right side of the header (e.g "Min investment")
   */
  minLabel?: string;
  /**
   * Value displayed below the trailing label (e.g "$15.25")
   */
  minValue?: string;
  /**
   * Callback triggered when the header/source section is pressed
   */
  onSourcePress?: (event: GestureResponderEvent) => void;
  /**
   * Numeric value of the input. When provided the component acts as a controlled input.
   */
  value?: string;
  /**
   * Default value used for the uncontrolled mode.
   */
  defaultValue?: string;
  /**
   * Callback fired whenever the amount string changes.
   */
  onValueChange?: (nextValue: string) => void;
  /**
   * Optional helper text rendered below the amount (e.g. "= 2.0383 SGT-3402")
   */
  helperText?: string;
  /**
   * Secondary text rendered below the helper (commonly used for error messaging)
   */
  errorText?: string;
  /**
   * Label displayed above the available balance information
   */
  availableBalanceLabel?: string;
  /**
   * Value displayed next to the available balance label
   */
  availableBalanceValue?: string;
  /**
   * Callback fired when the Max button is tapped
   */
  onMaxPress?: () => void;
  /**
   * Controls whether the Max button should be rendered
   */
  showMaxButton?: boolean;
  /**
   * Label used for the action button
   */
  continueLabel?: string;
  /**
   * Callback fired when the action button is pressed
   */
  onContinue?: (amount: string) => void;
  /**
   * Explicitly disable the action button
   */
  continueDisabled?: boolean;
  /**
   * Externally control the visual state of the amount text
   */
  status?: AmountInputStatus;
  /**
   * Symbol prefixed in front of the amount (e.g "$")
   */
  currencySymbol?: string;
  /**
   * Maximum number of fractional digits allowed. When undefined the value is not limited.
   */
  maxDecimals?: number;
  /**
   * Maximum number of numeric digits (excluding the decimal separator)
   */
  maxDigits?: number;
  /**
   * Optional keypad layout override. Each row should contain 3 keys.
   */
  keypadLayout?: readonly KeypadKey[][];
  /**
   * Toggle decimal support in the keypad
   */
  supportsDecimal?: boolean;
  /**
   * Optional note rendered below the primary action button
   */
  footerNote?: string;
  /**
   * Additional container className (nativewind)
   */
  className?: string;
}

const ensureDisplayValue = (value: string) => {
  if (!value || value === '.') {
    return '0';
  }
  if (value.startsWith('.')) {
    return `0${value}`;
  }
  return value;
};

export const AmountInput: React.FC<AmountInputProps> = ({
  title,
  sourceLabel,
  sourceValue,
  minLabel,
  minValue,
  onSourcePress,
  value,
  defaultValue = '0',
  onValueChange,
  helperText,
  errorText,
  availableBalanceLabel,
  availableBalanceValue,
  onMaxPress,
  showMaxButton,
  continueLabel = 'Continue',
  onContinue,
  continueDisabled,
  status,
  currencySymbol = '$',
  maxDecimals = 2,
  maxDigits,
  keypadLayout,
  supportsDecimal = true,
  footerNote,
  className = '',
  ...rest
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);

  const amount = useMemo(() => {
    if (isControlled) {
      return value ?? '0';
    }
    return internalValue;
  }, [isControlled, internalValue, value]);

  const resolvedShowMax = showMaxButton ?? Boolean(onMaxPress);

  const setAmount = useCallback(
    (next: string) => {
      const normalized = next.length ? next : '0';
      if (!isControlled) {
        setInternalValue(normalized);
      }
      onValueChange?.(normalized);
    },
    [isControlled, onValueChange],
  );

  const handleDelete = useCallback(() => {
    if (!amount || amount.length <= 1) {
      setAmount('0');
      return;
    }
    const next = amount.slice(0, -1);
    if (next === '' || next === '0' || next === '0.') {
      setAmount('0');
    } else {
      setAmount(next);
    }
  }, [amount, setAmount]);

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (!digit.match(/^[0-9]$/)) {
        return;
      }

      if (amount === '0') {
        setAmount(digit);
        return;
      }

      const candidate = `${amount}${digit}`;
      if (maxDigits) {
        const digitsCount = candidate.replace('.', '').length;
        if (digitsCount > maxDigits) {
          return;
        }
      }

      if (maxDecimals !== undefined) {
        const decimals = candidate.split('.')[1];
        if (decimals && decimals.length > maxDecimals) {
          return;
        }
      }

      setAmount(candidate);
    },
    [amount, maxDecimals, maxDigits, setAmount],
  );

  const handleDecimalPress = useCallback(() => {
    if (!supportsDecimal) {
      return;
    }
    if (amount.includes('.')) {
      return;
    }

    if (amount.length === 0 || amount === '0') {
      setAmount('0.');
    } else {
      setAmount(`${amount}.`);
    }
  }, [amount, setAmount, supportsDecimal]);

  const handleKeypadPress = useCallback(
    (key: KeypadKey) => {
      if (key === BACKSPACE_KEY) {
        handleDelete();
      } else if (key === '.') {
        handleDecimalPress();
      } else {
        handleDigitPress(key);
      }
    },
    [handleDecimalPress, handleDelete, handleDigitPress],
  );

  const handleContinue = useCallback(() => {
    onContinue?.(amount);
  }, [amount, onContinue]);

  const resolvedStatus: AmountInputStatus = useMemo(() => {
    if (status) {
      return status;
    }
    if (errorText) {
      return 'error';
    }
    const display = ensureDisplayValue(amount);
    return display === '0' || display === '0.' ? 'empty' : 'default';
  }, [amount, errorText, status]);

  const displayValue = useMemo(() => ensureDisplayValue(amount), [amount]);

  const keypadRows = useMemo(() => {
    if (keypadLayout && keypadLayout.length) {
      return keypadLayout;
    }
    return DEFAULT_KEYPAD_LAYOUT;
  }, [keypadLayout]);

  const amountColor =
    resolvedStatus === 'error'
      ? 'text-[#FB088F]'
      : resolvedStatus === 'empty'
      ? 'text-[#B8BCC8]'
      : 'text-[#070914]';

  const helperColor =
    resolvedStatus === 'error' ? 'text-[#FB088F]' : 'text-[#6B7280]';

  const continueIsDisabled =
    continueDisabled !== undefined
      ? continueDisabled
      : resolvedStatus === 'empty';

  return (
    <View
      className={`rounded-3xl bg-white px-6 py-6 shadow-sm ${className}`}
      {...rest}
    >
      {title && (
        <Text className="text-center text-[18px] font-body-semibold text-[#070914]">
          {title}
        </Text>
      )}

      {(sourceLabel || sourceValue || minLabel || minValue) && (
        <View className="mt-6 rounded-[24px] border border-[#F1F3F5] bg-[#F9FAFB] px-4 py-3">
          <View className="flex-row items-center justify-between">
            {(sourceLabel || sourceValue) && (
              <TouchableOpacity
                className="flex-1"
                activeOpacity={0.7}
                onPress={onSourcePress}
                disabled={!onSourcePress}
              >
                {sourceLabel && (
                  <Text className="text-[12px] font-body-medium uppercase tracking-wide text-[#9CA3AF]">
                    {sourceLabel}
                  </Text>
                )}
                <View className="mt-1 flex-row items-center gap-x-2">
                  <Text className="text-[15px] font-body-semibold text-[#070914]">
                    {sourceValue}
                  </Text>
                  {onSourcePress && (
                    <Icon
                      name="chevron-down"
                      size={16}
                      color="#9CA3AF"
                      strokeWidth={2}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}

            {(minLabel || minValue) && (
              <View className="items-end">
                {minLabel && (
                  <Text className="text-[12px] font-body-medium uppercase tracking-wide text-[#9CA3AF]">
                    {minLabel}
                  </Text>
                )}
                {minValue && (
                  <Text className="mt-1 text-[14px] font-body-semibold text-[#FB088F]">
                    {minValue}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      <View className="mt-8 items-center">
        <Text
          className={`text-[44px] font-body-bold leading-none ${amountColor}`}
        >
          {currencySymbol}
          {displayValue}
        </Text>
        {helperText && (
          <Text className={`mt-2 text-sm font-body-medium ${helperColor}`}>
            {helperText}
          </Text>
        )}
        {errorText && (
          <View className="mt-3 flex-row items-center gap-x-2">
            <Icon
              name="alert-triangle"
              size={16}
              color="#FB088F"
              strokeWidth={2}
            />
            <Text className="text-sm font-body-medium text-[#FB088F]">
              {errorText}
            </Text>
          </View>
        )}
      </View>

      {(availableBalanceLabel || availableBalanceValue || resolvedShowMax) && (
        <View className="mt-8 flex-row items-center justify-between">
          <View>
            {availableBalanceLabel && (
              <Text className="text-[12px] font-body-medium uppercase tracking-wide text-[#9CA3AF]">
                {availableBalanceLabel}
              </Text>
            )}
            {availableBalanceValue && (
              <Text className="mt-1 text-[14px] font-body-semibold text-[#070914]">
                {availableBalanceValue}
              </Text>
            )}
          </View>

          {resolvedShowMax && (
            <TouchableOpacity
              onPress={onMaxPress}
              activeOpacity={0.7}
              className="rounded-full bg-[#070914] px-4 py-2"
            >
              <Text className="text-[13px] font-body-semibold text-white">
                Max
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View className="mt-6">
        {keypadRows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            className={`flex-row items-center justify-between ${
              rowIndex === 0 ? '' : 'mt-4'
            }`}
          >
            {row.map((key) => {
              const isBackspace = key === BACKSPACE_KEY;
              const isDecimal = key === '.';
              const isDisabled =
                (!supportsDecimal && isDecimal) ||
                (isDecimal && amount.includes('.'));

              return (
                <TouchableOpacity
                  key={key.toString()}
                  className="mx-1 h-16 flex-1 items-center justify-center rounded-2xl bg-[#F4F4F5]"
                  activeOpacity={isDisabled ? 1 : 0.8}
                  onPress={() => !isDisabled && handleKeypadPress(key)}
                >
                  {isBackspace ? (
                    <Icon
                      name="backspace"
                      library="ionicons"
                      size={26}
                      color="#070914"
                    />
                  ) : (
                    <Text className="text-[20px] font-body-semibold text-[#070914]">
                      {key}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View className="mt-8">
        <Button
          title={continueLabel}
          onPress={handleContinue}
          disabled={continueIsDisabled}
          className="bg-[#070914]"
        />
      </View>

      {footerNote && (
        <Text className="mt-4 text-center text-[13px] font-body-medium text-[#6B7280]">
          {footerNote}
        </Text>
      )}
    </View>
  );
};

AmountInput.displayName = 'AmountInput';

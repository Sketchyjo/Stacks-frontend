import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Card } from '../atoms/Card';
import { Icon } from '../atoms/Icon';
import {
  colors,
  typography,
  spacing,
  shadows,
  animations,
} from '../../design/tokens';

export interface CardData {
  cardType?: 'visa' | 'mastercard';
  cardNumber: string;
  balance: number;
  currency?: string;
}

export interface VirtualCreditCardProps {
  id?: string;
  cardTitle?: string;
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  cvc?: string;
  cardType?: 'visa' | 'mastercard';
  balance?: number;
  currency?: string;
  card?: CardData;
  backgroundColor?: string;
  textColor?: string;
}

export const VirtualCreditCard: React.FC<VirtualCreditCardProps> = ({
  cardTitle,
  cardNumber,
  cardholderName,
  expiryDate,
  cvc,
  cardType = 'visa',
  balance = 0,
  currency = 'USD',
  card,
  backgroundColor,
  textColor,
}) => {
  // Use card object values as fallbacks if direct props aren't provided
  const resolvedCardType = cardType || card?.cardType || 'visa';
  const resolvedCardNumber = cardNumber || card?.cardNumber || '';
  const resolvedBalance = balance || card?.balance || 0;
  const resolvedCurrency = currency || card?.currency || 'USD';
  const resolvedBackgroundColor = backgroundColor || colors.accent.limeGreen;
  const resolvedTextColor = textColor || colors.text.onAccent;
  const [isFlipped, setIsFlipped] = useState(false);
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const formatCardNumber = (num: string) => {
    if (!num) return '';
    return `**** **** **** ${num.slice(-4)}`;
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: resolvedCurrency,
    }).format(amount);
  };

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: rotationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: rotationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  const flipCard = () => {
    Animated.timing(rotationAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: animations.normal,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  return (
    <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
      <View style={{ height: 230, width: '100%' }}>
        <Animated.View
          style={[
            shadows.lg,
            {
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
            },
            frontAnimatedStyle,
          ]}
        >
          <Card
            padding="medium"
            style={{
              height: '100%',
              backgroundColor: resolvedBackgroundColor,
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  {
                    fontFamily: typography.fonts.secondary,
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: resolvedTextColor,
                  },
                ]}
              >
                {cardTitle || 'Virtual Card'}
              </Text>
              <Icon
                name={resolvedCardType === 'visa' ? 'cc-visa' : 'cc-mastercard'}
                library="fontawesome"
                size={28}
                color={resolvedTextColor}
              />
            </View>
            <View>
              <Text
                style={[
                  {
                    fontSize: typography.styles.body.size,
                    color: resolvedTextColor,
                    letterSpacing: 2,
                    marginBottom: spacing.md,
                    fontFamily: 'monospace',
                  },
                ]}
              >
                {formatCardNumber(resolvedCardNumber)}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={[
                    {
                      fontFamily: typography.fonts.primary,
                      fontSize: typography.styles.caption.size,
                      color: resolvedTextColor,
                    },
                  ]}
                >
                  {cardholderName || ''}
                </Text>
              </View>
            </View>
            <View>
              <Text
                style={[
                  {
                    fontFamily: typography.fonts.primary,
                    fontSize: typography.styles.caption.size,
                    color: colors.text.secondary,
                  },
                ]}
              >
                Balance
              </Text>
              <Text
                style={[
                  {
                    fontFamily: typography.fonts.secondary,
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: resolvedTextColor,
                  },
                ]}
              >
                {formatBalance(resolvedBalance)}
              </Text>
            </View>
          </Card>
        </Animated.View>
        <Animated.View
          style={[
            shadows.lg,
            {
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
            },
            backAnimatedStyle,
          ]}
        >
          <Card
            padding="medium"
            style={{
              height: '100%',
              backgroundColor: resolvedBackgroundColor,
              justifyContent: 'space-between',
            }}
          >
            <View>
              <View
                style={{
                  backgroundColor: colors.text.onAccent,
                  height: 50,
                  marginTop: spacing.lg,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: spacing.md,
                  backgroundColor: colors.text.onAccent,
                  padding: spacing.sm,
                  borderRadius: spacing.xs,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    textAlign: 'right',
                    color: colors.text.onPrimary,
                    fontFamily: 'monospace',
                    fontSize: 16,
                  }}
                >
                  {cvc || '***'}
                </Text>
              </View>
              <Text
                style={{
                  color: resolvedTextColor,
                  fontSize: 12,
                  marginTop: spacing.lg,
                  alignSelf: 'flex-end',
                }}
              >
                {expiryDate ? `Expires: ${expiryDate}` : 'Expires: MM/YY'}
              </Text>
            </View>
            <Icon
              name={resolvedCardType === 'visa' ? 'cc-visa' : 'cc-mastercard'}
              library="fontawesome"
              size={28}
              color={resolvedTextColor}
              style={{ alignSelf: 'flex-end' }}
            />
          </Card>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

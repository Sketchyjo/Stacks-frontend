import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  X,
} from 'lucide-react-native';

import { VirtualCreditCardFeed } from '@/components/molecules/VirtualCreditCardFeed';
import { VirtualCreditCardProps } from '@/components/molecules/VirtualCardDisplay';
import { Button } from '@/components/ui/Button';
import { colors } from '@/design/tokens';

type CardColorOption = {
  id: string;
  label: string;
  swatch: string;
  textColor: string;
};

type CardTier = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  perks: string[];
  requirement: string;
  colors: CardColorOption[];
  card: Omit<VirtualCreditCardProps, 'id' | 'backgroundColor' | 'textColor'>;
};

const CARD_TIERS: CardTier[] = [
  {
    id: 'spark',
    name: 'Spark',
    tagline: 'Find the card that suits you.',
    description:
      'The Spark card offers unmatched convenience and rewards for everyday spending. Stake Volt tokens to unlock exclusive benefits and advanced features for seamless financial management.',
    highlights: [
      '5% cashback in $VOLT on all purchases.',
      'Daily spending limit: $500',
      'Instant virtual card issuance',
      'Multi-currency support',
      'Apple Pay, Google Pay, Samsung Pay',
    ],
    perks: [
      '5% $VOLT token cashback on every purchase.',
      'Compatible with Apple Pay, Google Pay, and Samsung Pay.',
      'Daily spending limit of $500 for controlled usage.',
      'Instant access to your virtual card after approval.',
      'Use in multiple currencies without extra steps.',
      'Real-time notifications for every transaction.',
      'Priority, dedicated support when you need it.',
    ],
    requirement: 'Requires $100 Volt-Token Stake',
    colors: [
      { id: 'teal', label: 'Teal', swatch: '#A4F3DA', textColor: colors.text.primary },
      { id: 'lavender', label: 'Lavender', swatch: '#D8D5FF', textColor: colors.text.primary },
      { id: 'pink', label: 'Pink', swatch: '#FFCCE5', textColor: colors.text.primary },
    ],
    card: {
      cardTitle: 'Spark',
      cardNumber: '5243123499884433',
      cardholderName: 'Volt Member',
      expiryDate: '08/28',
      cvc: '842',
      cardType: 'mastercard',
      balance: 1250,
      currency: 'USD',
    },
  },
  {
    id: 'surge',
    name: 'Surge',
    tagline: 'Elevate your everyday spend.',
    description:
      'Surge is built for travellers and power users who need elevated limits and lifestyle perks. Unlock companion benefits, premium insurance, and concierge support anywhere you go.',
    highlights: [
      '8% cashback on partner merchants',
      'Daily spending limit: $1,500',
      'Airport lounge access credits',
      'Built-in travel insurance',
      'Concierge assistance 24/7',
    ],
    perks: [
      'Earn 8% back at partner merchants and services.',
      'Higher daily limit of $1,500 for flexible payments.',
      'Complimentary lounge visits every quarter.',
      'Automatic travel insurance for peace of mind.',
      'Concierge assistance when you are on the move.',
      'Multi-currency wallet with smart FX rates.',
      'Instant notifications and granular spend controls.',
    ],
    requirement: 'Requires $250 Volt-Token Stake',
    colors: [
      { id: 'sky', label: 'Sky', swatch: '#C6E5FF', textColor: colors.text.primary },
      { id: 'sunrise', label: 'Sunrise', swatch: '#FFD7E8', textColor: colors.text.primary },
      { id: 'ice', label: 'Ice', swatch: '#DDF7FF', textColor: colors.text.primary },
    ],
    card: {
      cardTitle: 'Surge',
      cardNumber: '4532980045123344',
      cardholderName: 'Volt Explorer',
      expiryDate: '03/29',
      cvc: '605',
      cardType: 'visa',
      balance: 4820,
      currency: 'USD',
    },
  },
  {
    id: 'bolt',
    name: 'Bolt',
    tagline: 'Premium power, limitless rewards.',
    description:
      'Bolt unlocks elite membership status with the highest limits, stacking rewards, and the most exclusive Volt experiences. Perfect for heavy spenders who want the very best.',
    highlights: [
      '10% cashback in rotating Volt categories',
      'No preset spending limit',
      'Dedicated relationship manager',
      'Automated savings sweeps',
      'VIP event and launch access',
    ],
    perks: [
      'Earn up to 10% $VOLT back in rotating categories.',
      'Enjoy no preset spending limit with smart safeguards.',
      'Dedicated relationship manager for personal assistance.',
      'Automate savings sweeps based on your spending habits.',
      'Access private Volt events and early product launches.',
      'Priority airport, travel, and lifestyle partners worldwide.',
      'Advanced AI insights on spend and portfolio performance.',
    ],
    requirement: 'Requires $1,000 Volt-Token Stake',
    colors: [
      { id: 'slate', label: 'Slate', swatch: '#E3E6EF', textColor: colors.text.primary },
      { id: 'aurora', label: 'Aurora', swatch: '#D2F5F0', textColor: colors.text.primary },
      { id: 'lumen', label: 'Lumen', swatch: '#F5E0FF', textColor: colors.text.primary },
    ],
    card: {
      cardTitle: 'Bolt',
      cardNumber: '376411112234556',
      cardholderName: 'Volt Elite',
      expiryDate: '11/28',
      cvc: '129',
      cardType: 'mastercard',
      balance: 14820,
      currency: 'USD',
    },
  },
];

const CardScreen = () => {
  const [selectedTierId, setSelectedTierId] = useState<string>(CARD_TIERS[0].id);
  const [selectedColorId, setSelectedColorId] = useState<string>(CARD_TIERS[0].colors[0].id);
  const [activeCardId, setActiveCardId] = useState<string>(CARD_TIERS[0].id);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const selectedTier = useMemo(
    () => CARD_TIERS.find(tier => tier.id === selectedTierId) ?? CARD_TIERS[0],
    [selectedTierId],
  );

  const selectedColor = useMemo(
    () =>
      selectedTier.colors.find(color => color.id === selectedColorId) ??
      selectedTier.colors[0],
    [selectedTier, selectedColorId],
  );

  const cardFeedData = useMemo(() => {
    return CARD_TIERS.map(tier => {
      const fallbackColor = tier.colors[0];
      const tierColor =
        tier.id === selectedTier.id ? selectedColor : fallbackColor;

      return {
        ...tier.card,
        id: tier.id,
        cardTitle: tier.card.cardTitle ?? `${tier.name} Card`,
        backgroundColor: tierColor.swatch,
        textColor: tierColor.textColor,
      };
    });
  }, [selectedColor, selectedTier]);

  useEffect(() => {
    const tier = CARD_TIERS.find(item => item.id === selectedTierId);
    if (!tier) return;

    const hasColor = tier.colors.some(color => color.id === selectedColorId);
    if (!hasColor) {
      setSelectedColorId(tier.colors[0].id);
    }
  }, [selectedColorId, selectedTierId]);

  useEffect(() => {
    if (activeCardId !== selectedTierId) {
      setActiveCardId(selectedTierId);
    }
  }, [activeCardId, selectedTierId]);

  const handleTierSelect = useCallback((tierId: string) => {
    const tier = CARD_TIERS.find(item => item.id === tierId);
    if (!tier) return;

    setSelectedTierId(tier.id);
    setSelectedColorId(tier.colors[0].id);
    setActiveCardId(tier.id);
  }, []);

  const handleColorSelect = useCallback((colorId: string) => {
    setSelectedColorId(colorId);
  }, []);

  const handleCardChange = useCallback(
    (card: VirtualCreditCardProps) => {
      if (!card?.id) return;
      const tier = CARD_TIERS.find(item => item.id === card.id);
      if (!tier) return;

      if (tier.id !== selectedTierId) {
        setSelectedTierId(tier.id);
        setSelectedColorId(tier.colors[0].id);
      }
      setActiveCardId(tier.id);
    },
    [selectedTierId],
  );

  const openDetails = useCallback(() => setIsDetailsVisible(true), []);
  const closeDetails = useCallback(() => setIsDetailsVisible(false), []);

  const handleBackPress = useCallback(() => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/index');
      }
    } catch (navigationError) {
      console.warn('Navigation unavailable for back action:', navigationError);
    }
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-2">
         

          <View className="mb-6">
            <Text className="text-[28px] font-body-bold text-[#1E1A3E]">
              Select your Card
            </Text>
            <Text className="mt-2 text-[15px] font-body-medium text-[#5B6072]">
              {selectedTier.tagline}
            </Text>
          </View>

          <View className="flex-row items-center rounded-full bg-[#F4F4F6] p-1 mb-6">
            {CARD_TIERS.map(tier => {
              const isActive = tier.id === selectedTier.id;
              return (
                <TouchableOpacity
                  key={tier.id}
                  onPress={() => handleTierSelect(tier.id)}
                  activeOpacity={0.8}
                  className={`flex-1 rounded-full px-4 py-3 ${
                    isActive ? 'bg-white shadow-md' : ''
                  }`}
                >
                  <Text
                    className={`text-center text-[14px] font-body-semibold ${
                      isActive ? 'text-[#1E1A3E]' : 'text-[#7B7F92]'
                    }`}
                  >
                    {tier.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <VirtualCreditCardFeed
            cards={cardFeedData}
            activeCardId={activeCardId}
            onCardChange={handleCardChange}
            className="mb-8"
          />

          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-[24px] font-body-bold text-[#1E1A3E]">
                {selectedTier.name}
              </Text>
              <Text className="mt-1 text-[13px] font-body-medium text-[#7B7F92]">
                Choose your colorway
              </Text>
            </View>
            <View className="flex-row items-center gap-x-2">
              {selectedTier.colors.map(color => {
                const isSelected = color.id === selectedColor.id;
                return (
                  <TouchableOpacity
                    key={color.id}
                    onPress={() => handleColorSelect(color.id)}
                    activeOpacity={0.8}
                    className={`h-8 w-8 items-center justify-center rounded-full ${
                      isSelected ? 'border-2 border-[#1E1A3E]' : 'border border-transparent'
                    }`}
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <View
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: color.swatch }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mb-6 rounded-3xl border border-[#ECECF1] bg-[#FAFAFC] p-5">
            {selectedTier.highlights.map(highlight => (
              <View key={highlight} className="mb-4 flex-row items-start">
                <View className="mt-[2px]">
                  <CheckCircle2 size={20} color={colors.accent.softGreen} />
                </View>
                <Text className="ml-3 flex-1 text-[15px] font-body-medium text-[#40445A]">
                  {highlight}
                </Text>
              </View>
            ))}

            <View className="mt-2 flex-row items-center rounded-2xl bg-white px-4 py-3">
              <ShieldCheck size={20} color={colors.text.primary} />
              <Text className="ml-3 flex-1 text-[14px] font-body-semibold text-[#1E1A3E]">
                {selectedTier.requirement}
              </Text>
            </View>
          </View>

          <View className="mb-10 flex-row items-center gap-x-3">
            <TouchableOpacity
              onPress={openDetails}
              activeOpacity={0.8}
              className="flex-1 items-center justify-center rounded-full border border-[#D4D5DB] px-6 py-4"
            >
              <Text className="text-[15px] font-body-semibold text-[#1E1A3E]">
                Details
              </Text>
            </TouchableOpacity>
            <Button
              title="Order now"
              rightIcon={<ArrowRight size={18} color="#fff" />}
              className="flex-1"
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isDetailsVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDetails}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[90%] rounded-t-[32px] bg-white px-6 pb-10 pt-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[18px] font-body-semibold text-[#1E1A3E]">
                Card Details
              </Text>
              <TouchableOpacity
                onPress={closeDetails}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F7]"
              >
                <X size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              <Text className="text-[22px] font-body-bold text-[#1E1A3E]">
                {selectedTier.name} Card
              </Text>
              <Text className="mt-2 text-[14px] font-body-medium leading-5 text-[#5B6072]">
                {selectedTier.description}
              </Text>

              <View className="mt-6">
                {selectedTier.perks.map(perk => (
                  <View key={perk} className="mb-4 flex-row items-start">
                    <View className="mt-[2px]">
                      <CheckCircle2 size={20} color={colors.accent.softGreen} />
                    </View>
                    <Text className="ml-3 flex-1 text-[15px] font-body-medium text-[#40445A]">
                      {perk}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="mt-6 rounded-2xl border border-[#ECECF1] bg-[#FAFAFC] px-4 py-3">
                <View className="flex-row items-start">
                  <ShieldCheck size={20} color={colors.text.primary} />
                  <View className="ml-3 flex-1">
                    <Text className="text-[14px] font-body-semibold text-[#1E1A3E]">
                      Other Details
                    </Text>
                    <Text className="mt-1 text-[14px] font-body-medium text-[#5B6072]">
                      {selectedTier.requirement}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-6">
                <Text className="mb-3 text-[14px] font-body-semibold text-[#1E1A3E]">
                  Colors
                </Text>
                <View className="flex-row flex-wrap">
                  {selectedTier.colors.map(color => (
                    <View
                      key={`${selectedTier.id}-${color.id}`}
                      className="mr-3 mb-3 flex-row items-center rounded-full bg-[#F2F2F7] px-3 py-2"
                    >
                      <View
                        className="mr-2 h-3 w-3 rounded-full"
                        style={{ backgroundColor: color.swatch }}
                      />
                      <Text className="text-[12px] font-body-medium text-[#1E1A3E]">
                        {color.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CardScreen;

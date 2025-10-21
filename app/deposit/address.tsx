import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, Copy, Info, Share2, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-skia';

import DepositScreenHeader from '@/components/deposit/ScreenHeader';
import { getNetworkForStablecoin, getStablecoinById } from '@/constants/depositOptions';
import { breakpoints } from '@/design/tokens';

const FallbackScreen = () => (
  <SafeAreaView className="flex-1 bg-white">
    <DepositScreenHeader
      title="Digital Dollars"
      subtitle="Select preferred digital dollar"
      onBack={() => router.replace('/deposit')}
    />
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-2 text-xl font-body-bold text-[#0B1120]">We need more info</Text>
      <Text className="text-center text-sm text-[#6B7280]">
        Select a stablecoin and network to see the deposit address.
      </Text>
    </View>
  </SafeAreaView>
);

const Highlight = ({
  message,
  tone = 'default',
}: {
  message: string;
  tone?: 'default' | 'warning';
}) => {
  const isWarning = tone === 'warning';

  return (
    <View
      className="flex-row items-center rounded-3xl px-4 py-4"
      style={{
        backgroundColor: isWarning ? '#FEF3C7' : '#E8F1FF',
      }}
    >
      <View
        className="mr-3 h-9 w-9 items-center justify-center rounded-full"
        style={{
          backgroundColor: isWarning ? '#FDE68A' : '#D0E0FF',
        }}
      >
        {isWarning ? (
          <AlertTriangle size={16} color="#B45309" strokeWidth={1.5} />
        ) : (
          <Info size={16} color="#1D4ED8" strokeWidth={1.5} />
        )}
      </View>
      <Text
        className="flex-1 text-sm leading-5"
        style={{ color: isWarning ? '#92400E' : '#1F2937' }}
      >
        {message}
      </Text>
    </View>
  );
};

const DepositAddressScreen = () => {
  const params = useLocalSearchParams<{ coin?: string; network?: string }>();
  const coinParam = useMemo(
    () => (Array.isArray(params.coin) ? params.coin[0] : params.coin),
    [params.coin]
  );
  const networkParam = useMemo(
    () => (Array.isArray(params.network) ? params.network[0] : params.network),
    [params.network]
  );

  const stablecoin = useMemo(() => getStablecoinById(coinParam), [coinParam]);
  const network = useMemo(
    () => getNetworkForStablecoin(coinParam, networkParam),
    [coinParam, networkParam]
  );
  const { width } = useWindowDimensions();
  const isCompactWidth = width <= breakpoints.sm;
  const isCondensedWidth = width <= breakpoints.md;
  const qrSize = isCompactWidth ? 180 : isCondensedWidth ? 192 : 210;
  const containerPadding = isCompactWidth ? 20 : 24;
  const contentBottomPadding = isCompactWidth ? 24 : 32;
  const cardPadding = isCompactWidth ? 16 : 20;
  const cardRadius = isCompactWidth ? 24 : 28;
  const infoSpacing = isCompactWidth ? 32 : 54;
  const actionSpacing = isCompactWidth ? 48 : 72;
  const shareButtonPaddingVertical = isCompactWidth ? 18 : 24;
  const shareButtonPaddingHorizontal = isCompactWidth ? 20 : 24;
  const shareButtonRadius = isCompactWidth ? 28 : 32;

  if (!stablecoin || !network) {
    return <FallbackScreen />;
  }

  const shareAddress = async () => {
    try {
      await Share.share({
        message: `${stablecoin.symbol} • ${network.name}\n${network.address}`,
      });
    } catch (error) {
      Alert.alert('Unable to share address right now.');
    }
  };

  const copyAddress = async () => {
    try {
      await Clipboard.setStringAsync(network.address);
      Alert.alert('Address copied', 'Wallet address copied to clipboard.');
    } catch (error) {
      Alert.alert('Unable to copy address right now.');
    }
  };

  const closeButton = (
    <TouchableOpacity
      onPress={() => router.dismiss()}
      activeOpacity={0.9}
      className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]"
      accessibilityLabel="Close deposit flow"
    >
      <X size={18} color="#111827" strokeWidth={1.5} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <DepositScreenHeader
        title={`${stablecoin.name} (${stablecoin.symbol})`}
        subtitle={`${network.name} address`}
        // rightAccessory={closeButton}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: containerPadding,
          paddingBottom: contentBottomPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            borderRadius: cardRadius,
            paddingHorizontal: cardPadding,
            paddingVertical: cardPadding,
          }}
          className="bg-white"
        >
          <View className="items-center">
            <QRCode value={network.address} size={qrSize} />
            <Text className="mt-6 text-lg font-body-bold text-[#0B1120]">
              Your {network.name} Address
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-[#6B7280]">
              Scan this code or copy this wallet address to receive {stablecoin.symbol} on{' '}
              {network.name}.
            </Text>
          </View>

          <View
            className="rounded-2xl bg-[#F5F7FB]"
            style={{
              marginTop: infoSpacing,
              paddingHorizontal: isCompactWidth ? 12 : 16,
              paddingVertical: isCompactWidth ? 14 : 16,
            }}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-xs uppercase tracking-[1.5px] text-[#6B7280]">
                  Wallet Address
                </Text>
                <Text className="mt-2 text-[15px] font-body-bold leading-6 text-[#0B1120]" selectable>
                  {network.address}
                </Text>
              </View>
              <TouchableOpacity
                onPress={copyAddress}
                activeOpacity={0.85}
                className="mt-1 h-10 w-10 items-center justify-center rounded-full bg-[#F5F7FB]"
                accessibilityLabel="Copy wallet address"
              >
                <Copy size={18} color="#111827" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            <View className="mt-5 border-t border-[#E5E7EB] pt-4">
              <Text className="text-xs uppercase tracking-[1.5px] text-[#6B7280]">Network</Text>
              <Text className="mt-1 text-sm font-body-bold text-[#0B1120]">{network.name}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-[#111827]"
          style={{
            marginTop: actionSpacing,
            borderRadius: shareButtonRadius,
            paddingHorizontal: shareButtonPaddingHorizontal,
            paddingVertical: shareButtonPaddingVertical,
          }}
          activeOpacity={0.9}
          onPress={shareAddress}
        >
          <Share2 size={18} color="#FFFFFF" strokeWidth={1.5} />
          <Text className="ml-2 text-sm font-body-bold text-white">Share wallet address</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DepositAddressScreen;

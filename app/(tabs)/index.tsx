import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { BalanceCard } from '@/components/molecules/BalanceCard';
import { BasketItemCard } from '@/components/molecules/BasketItemCard';
import { BasketCard } from '@/components/molecules/BasketCard';
import { Avatar } from '@rneui/themed';
import { Bell, Grid3X3Icon } from 'lucide-react-native';

const Dashboard = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <View className='flex-row items-center gap-x-3 pl-[14px]'>
          <Grid3X3Icon size={28} strokeWidth={0.8} fill={"#000"} color={"#fff"}  />
          {/* <View>
          <Text className='text-[14px] font-body-medium'>morning</Text>
          <Text className='text-[#000] text-[20px] font-body-bold font-bold '>OLUWATOBILOBA</Text>
          </View> */}
        </View>
      ),
      headerRight: () => (
        <View className='flex-row gap-x-[12px] items-center pr-[14px]'>
         <Bell size={24} strokeWidth={2} color={"#000"} />
        </View>
      ),
      title: "",
      headerStyle: {
        backgroundColor: 'transparent',
      },
    })
  }, [navigation]);

  // Mock data for the portfolio balance
  const mockChartData = [
    { x: 0, y: 10 },
    { x: 1, y: 15 },
    { x: 2, y: 12 },
    { x: 3, y: 18 },
    { x: 4, y: 15 },
    { x: 5, y: 22 },
  ];

  return (
    <ScrollView className="flex-1">
      <View className="px-[14px] py-4">
        {/* Portfolio Balance Card */}
        <View className="mb-6">
          <BalanceCard
            balance="$86,480.93"
            percentChange="23.94%"
            timeframe="Last 30d"
            className="rounded-x"
          />
          
         
        </View>

        {/* My Baskets Section */}
        <View className="mb-6">
          <Text className="text-[18px] font-body-medium mb-3">My baskets</Text>
          
          <View className="flex-row mb-4">
            <BasketItemCard
              code="GME-08"
              status="Safe"
              aum="288.56"
              performance="11.5%"
              performanceType="positive"
              badges={[
                { color: '#FF6B6B', icon: 'trending-up' },
                { color: '#4CAF50', icon: 'shield-checkmark' }
              ]}
              className="mr-3 flex-1"
            />
            
            <BasketItemCard
              code="FRVR"
              status="Safe"
              aum="512.03"
              performance="8.2%"
              performanceType="positive"
              badges={[
                { color: '#4CAF50', icon: 'shield-checkmark' },
                { color: '#2196F3', icon: 'time' }
              ]}
              className="flex-1"
            />
          </View>
        </View>

        {/* Baskets to Watch Section */}
        <View>
          <Text className="text-[18px] font-body-medium mb-1">Baskets to watch</Text>
          <Text className="text-[14px] font-body-light text-gray-500 mb-3">Similar to those on your watchlist</Text>
          
          <View className="gap-y-3">
            <BasketCard
              id="dpi-4"
              name="DPI-4"
              description="Diversified Protocol Index"
              riskLevel="MEDIUM"
              performanceIndicator={{
                returnPercentage: 15.3,
                totalInvested: 102.44 * 1e6,
                currentValue: 102.44 * 1e6 * (1 + 0.153),
              }}
              badges={[
                { color: '#FF9800', icon: 'trending-up' },
                { color: '#2196F3', icon: 'analytics' },
              ]}
              onPress={() => {}}
            />

            <BasketCard
              id="sgt-3402"
              name="SGT-3402"
              description="Growth strategy basket"
              riskLevel="LOW"
              performanceIndicator={{
                returnPercentage: 23.8,
                totalInvested: 87.44 * 1e6,
                currentValue: 87.44 * 1e6 * (1 + 0.238),
              }}
              badges={[
                { color: '#FF9800', icon: 'trending-up' },
                { color: '#2196F3', icon: 'analytics' },
              ]}
              onPress={() => {}}
            />

            <BasketCard
              id="sai"
              name="SAI"
              iconUrl={require('@/assets/illustration/basket.png')}
              description="Stability and income"
              riskLevel="HIGH"
              performanceIndicator={{
                returnPercentage: -2.4,
                totalInvested: 117.34 * 1e6,
                currentValue: 117.34 * 1e6 * (1 - 0.024),
              }}
              badges={[
                { color: '#FF9800', icon: 'trending-up' },
                { color: '#2196F3', icon: 'analytics' },
              ]}
              onPress={() => {}}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Dashboard;

import { View, Text, ScrollView } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Avatar } from '@rneui/base';
import { CategoryCard } from '@/components/molecules/CategoryCard';
import { avatar, cards, checkmark } from '@/assets/images';

const Invest = () => {
    const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <View className='items-start pl-[14px]'>
          <Text className='text-[#000] text-[40px] font-body-bold font-bold '>Invest</Text>
        </View>
      ),
      headerRight: () => (
        <View className='flex-row gap-x-[12px] items-center pr-[14px]'>
         <Avatar 
          size={40}
          rounded
          title="Fc"
          containerStyle={{ backgroundColor: '#3d4db7' }}
           />
        </View>
      ),
      title: "",
      headerStyle: {
        backgroundColor: 'transparent',
      },
    })
  }, [navigation]);

  const categories = [
    {
      id: 'defi',
      title: 'DeFi',
      basketsCount: 86,
      performancePercent: 62.15,
    },
  ]
  return (
    <ScrollView className="flex-1">
      <View className="px-[14px] py-4 mt-[24px]">
        <Text className="text-[24px] font-body-medium mb-3">Categories</Text>

        <View className="flex-row gap-x-3">
          <View className="flex-1">
            <CategoryCard
              id="defi"
              title="DeFi"
              basketsCount={86}
              performancePercent={62.15}
              iconName="coins"
              tokenLogos={[avatar, cards, checkmark]}
              onPress={() => {}}
            />
          </View>

          <View className="flex-1">
            <CategoryCard
              id="gaming"
              title="Gaming"
              basketsCount={19}
              performancePercent={-1.24}
              iconName="gamepad-2"
              tokenLogos={[avatar, cards, checkmark]}
              onPress={() => {}}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Invest;

import { View, Text, ScrollView } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { Avatar } from '@rneui/base';
import { CategoryCard } from '@/components/molecules/CategoryCard';
import { avatar, cards, checkmark } from '@/assets/images';
import FinanceIcon from '@/assets/Icons/finance-26.svg';
import DataExplorationIcon from '@/assets/Icons/data-exploration-20.svg';

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
      icon: FinanceIcon,
      iconGradient: ['#F5F5FF', '#D6E4FF'] as const,
    },
    {
      id: 'gaming',
      title: 'Gaming',
      basketsCount: 19,
      performancePercent: 1.24,
      icon: DataExplorationIcon,
      iconGradient: ['#FFF5F7', '#E4E8FF'] as const,
    },
  ];
  return (
    <ScrollView className="flex-1">
      <View className="px-[14px] py-4 mt-[24px]">
        <Text className="text-[24px] font-body-medium mb-3">Categories</Text>

        <View className="flex-row gap-x-3">
          {categories.map(({ id: categoryId, title, basketsCount, performancePercent, icon, iconGradient }) => (
            <View className="flex-1" key={categoryId}>
              <CategoryCard
                id={categoryId}
                title={title}
                basketsCount={basketsCount}
                performancePercent={performancePercent}
                icon={icon}
                iconGradient={iconGradient}
                tokenLogos={[avatar, cards, checkmark]}
                onPress={() => {}}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Invest;

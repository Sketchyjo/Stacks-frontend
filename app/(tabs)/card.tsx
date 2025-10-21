import { Avatar } from '@rneui/base';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const CardScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <View className='items-start pl-[14px]'>
          <Text className='text-[#000] text-[40px] font-body-bold font-bold '>Card</Text>
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
      headerStyle: {
        backgroundColor: 'transparent',
      },
    })
  }, [navigation]);
  return (
    <SafeAreaView className="flex-1 bg-white">
  
       
    </SafeAreaView>
  );
};

export default CardScreen;

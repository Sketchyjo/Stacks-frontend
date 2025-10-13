import { View, Text } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { Home, Heart, Star, ArrowBigDown, MoveLeft } from 'lucide-react-native';
import { Header } from '@/components';
import { useNavigation } from 'expo-router';

const Dashboard = () => {
  const navigation = useNavigation();

useLayoutEffect(() => {
    navigation.setOptions({
        headerShown: true,
        headerLeft: () => (
           <View className='flex-row items-center'>
             
            <Text className='text-white ml-2'>Test</Text>
           </View>
        ),
        title: "",
        headerStyle: {
            backgroundColor: 'transparent',
        },
    })
}, [navigation])
  return <View className="flex-1 min-H-screen">
    
     <Text className="text-2xl font-bold">hello</Text>
  </View>;
};

export default Dashboard;

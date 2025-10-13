import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { MoveLeft } from 'lucide-react-native';

const TrustDevice = () => {
const navigation = useNavigation();

useLayoutEffect(() => {
    navigation.setOptions({
        headerShown: true,
        headerLeft: () => (
            <>
            <MoveLeft size={24} />
            </>
        ),
        title: "",
        headerStyle: {
            backgroundColor: 'transparent',
        },
    })
}, [navigation])
  
  return (
    <View className='flex-1 min-h-screen'>
      
    </View>
  )
}

export default TrustDevice
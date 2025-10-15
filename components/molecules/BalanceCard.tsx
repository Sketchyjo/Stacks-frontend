import React from 'react';
import {
  View,
  Text,
  ViewProps,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Icon } from '../atoms/Icon';
import { Eye } from 'lucide-react-native';

export interface BalanceCardProps extends ViewProps {
  balance?: string;
  percentChange?: string;
  timeframe?: string;
  currency?: string;
  onSendPress?: () => void;
  onReceivePress?: () => void;
  onHistoryPress?: () => void;
  onMorePress?: () => void;
  className?: string;
}

const ActionButton = ({
  icon,
  label,
  onPress,
  library = 'lucide',
  bgColor = 'bg-secondary',
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  library?: string;
  bgColor?: string;
}) => (
  <TouchableOpacity 
    className="items-center justify-center"
    onPress={onPress}
    accessibilityLabel={label}
  >
    <View className={`w-14 h-14 rounded-full ${bgColor} items-center justify-center mb-1`}>
      <Icon
        library={library as any}
        name={icon}
        size={24}
        strokeWidth={1.5}
      />
    </View>
    <Text className="text-[14px] font-body-medium">{label}</Text>
  </TouchableOpacity>
);

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance = '$0.00',
  percentChange = '0.00%',
  timeframe = '1D',
  currency = 'USD',
  onSendPress,
  onReceivePress,
  onHistoryPress,
  onMorePress,
  className,
  ...props
}) => {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <View
      className={`overflow-hidden ${className || ''}`}
      {...props}
    >
      {/* Main Balance Display */}
      <View className="px-4 pt-6 pb-4">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className='text-[14px] text-[#545454] font-body leading-6'>Portfolio Balance</Text>
            <View className='flex-row items-center gap-x-2'>
            <Text className="text-[34px] font-bold font-body-bold mb-1">
              {balance}
            </Text>
            <Eye size={24} color="#545454" strokeWidth={0.9} />
            </View>
           
            <View className="flex-row items-center">
              <Text className="text-base text-[#545454]">
                {percentChange} <Text className='text-[#000] font-body-bold'>{timeframe}</Text>
              </Text>
            </View>
          </View>
          
          {/* <View className="flex-1 ml-[35px]">
            <Chart
              data={[
                { value: 20, color: '#34D399' },
                { value: 25, color: '#34D399' },
                { value: 22, color: '#34D399' },
                { value: 30, color: '#34D399' },
                { value: 28, color: '#34D399' },
                { value: 35, color: '#34D399' }
              ]}
              width={(screenWidth - 88) * 0.4}
              height={100}
              type="line"
              color="#34D399"
              startFillColor="#34D399"
              endFillColor="rgba(52, 211, 153, 0.1)"
              showValues={false}
              className="mt-2"
            />
          </View> */}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between px-[14px] pb-6">
        <ActionButton
          icon="shopping-basket"
          label="Create"
          bgColor="bg-[#F7F7F7]"
          onPress={onSendPress}
        />

        <ActionButton
          icon="arrow-down"
          label="Receive"
          bgColor="bg-[#F7F7F7]"
          onPress={onReceivePress}
        />

        <ActionButton
          icon="arrow-up"
          label="Withdraw"
          bgColor="bg-[#F7F7F7]"
          onPress={onHistoryPress}
        />

        <ActionButton
          icon="credit-card"
          label="Cards"
          bgColor="bg-[#F7F7F7]"
          onPress={onMorePress}
        />
      </View>
    </View>
  );
};

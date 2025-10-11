import React from 'react';
import { View, FlatList, Dimensions, ViewProps } from 'react-native';
import {
  VirtualCreditCard,
  VirtualCreditCardProps,
} from './VirtualCardDisplay';

export interface VirtualCreditCardFeedProps extends ViewProps {
  cards: VirtualCreditCardProps[];
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.85;
const spacing = 16;
const emptyItemWidth = (screenWidth - cardWidth) / 2;

export const VirtualCreditCardFeed: React.FC<VirtualCreditCardFeedProps> = ({
  cards,
  ...props
}) => {
  const data = [
    { id: 'left-spacer' },
    ...cards.map((card, index) => ({ ...card, id: `card-${index}` })),
    { id: 'right-spacer' },
  ];

  const renderItem = ({ item }: { item: any }) => {
    if (item.id.includes('spacer')) {
      return <View style={{ width: emptyItemWidth }} />;
    }
    return (
      <View style={{ width: cardWidth, marginHorizontal: spacing / 2 }}>
        <VirtualCreditCard {...item} />
      </View>
    );
  };

  return (
    <View {...props}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={cardWidth + spacing}
        contentContainerStyle={{ alignItems: 'center' }}
      />
    </View>
  );
};

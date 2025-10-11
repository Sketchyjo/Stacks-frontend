import React from 'react';
import { View, Text, FlatList, ViewProps } from 'react-native';
import { TransactionItem, Transaction } from './TransactionItem';
import { colors, typography, spacing } from '@/design/tokens';
import { Icon } from '@/components/atoms';

export interface TransactionListProps extends Omit<ViewProps, 'children'> {
  transactions: Transaction[];
  title?: string;
  onTransactionPress?: (transaction: Transaction) => void;
  emptyStateMessage?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title,
  onTransactionPress,
  emptyStateMessage = 'You have no transactions yet.',
  style,
  ...props
}) => {
  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => onTransactionPress?.(item)}
    />
  );

  const renderEmptyState = () => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
      }}
    >
      <Icon name="file-tray-outline" size={48} color={colors.text.tertiary} />
      <Text
        style={{
          fontFamily: typography.fonts.primary,
          fontSize: 16,
          color: colors.text.secondary,
          marginTop: spacing.md,
          textAlign: 'center',
        }}
      >
        {emptyStateMessage}
      </Text>
    </View>
  );

  return (
    <View style={style} {...props}>
      {title && (
        <Text
          style={{
            fontFamily: typography.fonts.primary,
            fontSize: 22,
            fontWeight: typography.weights.bold,
            color: colors.text.primary,
            marginBottom: spacing.md,
          }}
        >
          {title}
        </Text>
      )}
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyState}
        scrollEnabled={false} // Assuming the list is inside a ScrollView
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />} // Use spacing instead of a visible line
        contentContainerStyle={{ paddingVertical: spacing.sm }}
      />
    </View>
  );
};

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TouchableOpacityProps,
  ImageSourcePropType,
} from 'react-native';
import { Card } from '../atoms/Card';
import { Icon } from '../atoms/Icon';

export interface CategoryCardProps extends Omit<TouchableOpacityProps, 'children'> {
  /** Unique identifier */
  id: string;
  /** Category title */
  title: string;
  /** Number of baskets in this category */
  basketsCount: number;
  /** Performance percentage for the category */
  performancePercent: number;
  /** Optional icon name to render inside a soft background */
  iconName?: string;
  /** Optional background color for the icon bubble */
  iconBackgroundColor?: string;
  /** Token/logo images shown as overlapping avatars */
  tokenLogos?: ImageSourcePropType[];
  /** Press handler */
  onPress?: () => void;
  /** Additional tailwind class names */
  className?: string;
}

/**
 * CategoryCard
 * A compact, reusable card for displaying a basket category with:
 * - Leading icon bubble
 * - Title and baskets count
 * - Performance indicator
 * - Row of overlapping token avatars
 * Matches the reference design while using shared atoms and tokens.
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  title,
  basketsCount,
  performancePercent,
  iconName = 'layers-3',
  iconBackgroundColor = 'bg-primary-lavender/20',
  tokenLogos = [],
  onPress,
  className,
  style,
  ...props
}) => {
  const isPositive = performancePercent >= 0;
  const performanceColorClass = isPositive ? 'text-semantic-success' : 'text-semantic-danger';
  const performanceBgClass = isPositive ? 'bg-semantic-success/20' : 'bg-semantic-danger/20';

  const accessibilityLabel = useMemo(() => (
    `${title} category. ${basketsCount} baskets. Performance ${isPositive ? 'up' : 'down'} ${Math.abs(performancePercent).toFixed(2)} percent.`
  ), [title, basketsCount, performancePercent, isPositive]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`rounded-2xl overflow-hidden ${className || ''}`}
      style={style}
      {...props}
    >
      <View
        className={`bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden ${className || ''}`}
      >
        <View className="p-md">
          {/* Top row: icon and baskets count */}
          <View className="flex-row justify-between items-center gap-x-3 mb-md">
            {/* Icon bubble */}
            <View
              className={`w-14 h-14 rounded-full items-center justify-center ${typeof iconBackgroundColor === 'string' && iconBackgroundColor.startsWith('bg-') ? iconBackgroundColor : 'bg-primary-lavender/20'}`}
              accessibilityLabel={`${title} icon`}
            >
              <Icon name={iconName} size={28} color="#1E1A3E" />
            </View>

            {/* Baskets count */}
            <Text className="font-body-medium text-body text-text-secondary">
              {basketsCount} baskets
            </Text>
          </View>

               {/* Title */}
          <Text
            className="font-body-bold text-[24px] text-text-primary mb-xs"
            numberOfLines={1}
          >
            {title}
          </Text>

          {/* Bottom row: performance and token avatars */}
          <View className="flex-row items-center justify-between mt-sm">
            {/* Performance indicator: circle + arrow + percentage */}
            <View className="flex-row items-center">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center mr-1.5 ${performanceColorClass}`}
                accessibilityLabel={isPositive ? 'Positive performance' : 'Negative performance'}
              >
                <Icon
                  name={isPositive ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={isPositive ? '#ADF48C' : '#FB088F'}
                />
              </View>

              <Text
                className={`font-body-medium text-body `}
              >
                {Math.abs(performancePercent).toFixed(2)}%
              </Text>
            </View>

            {/* Token avatars row */}
            <View className="flex-row">
              {tokenLogos.slice(0, 3).map((src, index) => (
                <View
                  key={`${id}-token-${index}`}
                  className="w-8 h-8 rounded-full items-center justify-center border-2 border-background-main"
                  style={{
                    marginLeft: index > 0 ? -8 : 0,
                    zIndex: 3 - index,
                  }}
                >
                  <Image
                    source={src}
                    className="w-7 h-7 rounded-full"
                  />
                </View>
              ))}
              {tokenLogos.length > 3 && (
                <View
                  className="w-8 h-8 rounded-full items-center justify-center border-2 border-background-main -ml-2 bg-primary-lavender"
                  style={{ zIndex: 0 }}
                >
                  <Text
                    className="font-primary text-caption font-bold text-text-on-primary"
                  >
                    +{tokenLogos.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCard;
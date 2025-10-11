import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  TouchableOpacityProps,
} from 'react-native';
import { Card } from '../atoms/Card';
import { Chart, ChartDataPoint } from '../atoms/Chart';
import { colors, typography, spacing, shadows } from '../../design/tokens';

/**
 * Props for the BasketCard component.
 */
export interface BasketCardProps
  extends Omit<TouchableOpacityProps, 'children'> {
  /** Unique identifier for the basket */
  id: string;
  /** The main name of the basket */
  name: string;
  /** Description of the basket */
  description: string;
  /** Risk level of the basket */
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  /** URL for the basket icon */
  iconUrl?: string;
  /** Performance indicator data */
  performanceIndicator: {
    returnPercentage: number;
    totalInvested: number;
    currentValue: number;
  };
  /** Function to call when the card is pressed */
  onPress?: () => void;
  /** Additional class names for styling */
  className?: string;
}

export const BasketCard: React.FC<BasketCardProps> = ({
  id,
  name,
  description,
  riskLevel,
  iconUrl,
  performanceIndicator,
  onPress,
  className,
  style,
  ...props
}) => {
  const { width: screenWidth } = useWindowDimensions();

  // Adjust chart width based on typical screen padding.
  const chartWidth = screenWidth / 2 - 48;

  /**
   * Formats a number into a currency string.
   * e.g., 60692 -> $60,692
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Get risk level color
   */
  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return colors.semantic.success;
      case 'MEDIUM':
        return colors.semantic.warning;
      case 'HIGH':
        return colors.semantic.danger;
      default:
        return colors.text.secondary;
    }
  };

  /**
   * Get performance color based on percentage
   */
  const getPerformanceColor = (percentage: number) => {
    return percentage >= 0 ? colors.semantic.success : colors.semantic.danger;
  };

  // Generate simple chart data based on performance
  const generateChartData = (): ChartDataPoint[] => {
    const baseValue = performanceIndicator.totalInvested;
    const currentValue = performanceIndicator.currentValue;
    const change = currentValue - baseValue;
    
    // Create a simple upward or downward trend
    return Array.from({ length: 7 }, (_, i) => ({
      value: baseValue + (change * i) / 6,
      label: `Day ${i + 1}`,
    }));
  };

  const chartData = generateChartData();
  const chartColor = getPerformanceColor(performanceIndicator.returnPercentage);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={className}
      style={[shadows.md, style]}
      {...props}
    >
      <Card
        variant="default"
        padding="none" // Padding is handled internally for more control
        style={{
          backgroundColor: colors.background.main, // White background
          overflow: 'hidden', // Ensures the chart gradient doesn't bleed out
        }}
      >
        {/* Top Content Section */}
        <View style={{ padding: spacing.lg, paddingBottom: spacing.md }}>
          {/* Icon */}
          {iconUrl ? (
            <Image
              source={{ uri: iconUrl }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
              }}
              resizeMode="contain"
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: colors.surface.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fonts.primary,
                  fontSize: 16,
                  fontWeight: typography.weights.bold,
                  color: colors.text.primary,
                }}
              >
                {name.charAt(0)}
              </Text>
            </View>
          )}
          
          <Text
            style={{
              fontFamily: typography.fonts.primary,
              fontSize: typography.styles.h2.size,
              fontWeight: typography.weights.bold,
              color: colors.text.primary,
              marginTop: spacing.lg,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
          
          <Text
            style={{
              fontFamily: typography.fonts.secondary,
              fontSize: typography.styles.label.size,
              color: colors.text.secondary,
              marginTop: spacing.xs,
            }}
            numberOfLines={2}
          >
            {description}
          </Text>

          {/* Risk Level Badge */}
          <View
            style={{
              backgroundColor: getRiskLevelColor(riskLevel),
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: 12,
              alignSelf: 'flex-start',
              marginTop: spacing.sm,
            }}
          >
            <Text
              style={{
                fontFamily: typography.fonts.primary,
                fontSize: typography.styles.caption.size,
                fontWeight: typography.weights.medium,
                color: colors.background.main,
              }}
            >
              {riskLevel} RISK
            </Text>
          </View>
          
          {/* Performance Value */}
          <Text
            style={{
              fontFamily: typography.fonts.primary,
              fontSize: 32,
              fontWeight: typography.weights.semibold,
              color: colors.text.primary,
              marginTop: spacing.md,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(performanceIndicator.currentValue)}
          </Text>

          {/* Performance Percentage */}
          <Text
            style={{
              fontFamily: typography.fonts.primary,
              fontSize: typography.styles.body.size,
              fontWeight: typography.weights.medium,
              color: getPerformanceColor(performanceIndicator.returnPercentage),
              marginTop: spacing.xs,
            }}
          >
            {performanceIndicator.returnPercentage >= 0 ? '+' : ''}
            {performanceIndicator.returnPercentage.toFixed(2)}%
          </Text>
        </View>

        {/* Chart Section */}
        <View style={{ marginLeft: -spacing.lg, marginBottom: -spacing.lg }}>
          <Chart
            data={chartData}
            type="line"
            height={80}
            width={chartWidth + spacing.lg * 2} // Make chart span full width of card
            color={chartColor}
            startFillColor={chartColor}
            endFillColor={`${colors.background.main}00`} // Fade to transparent white
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

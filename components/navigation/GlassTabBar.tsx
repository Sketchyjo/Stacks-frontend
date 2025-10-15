import React from 'react';
import { Platform, StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Host, Namespace, GlassEffectContainer, HStack, Group, VStack, Text, Image } from '@expo/ui/swift-ui';
import {
  glassEffect,
  glassEffectId,
  padding,
  shadow,
  opacity,
  frame,
} from '@expo/ui/swift-ui/modifiers';
import type { SFSymbol } from 'sf-symbols-typescript';

const TAB_CONFIG: Record<
  string,
  {
    icon: SFSymbol;
    title: string;
  }
> = {
  index: { icon: 'house.fill', title: 'Home' },
  invest: { icon: 'chart.line.uptrend.xyaxis', title: 'Invest' },
  card: { icon: 'creditcard.fill', title: 'Card' },
  profile: { icon: 'person.crop.circle', title: 'Profile' },
};

export function GlassTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();
  const namespaceId = React.useId();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const shellTint = isDark ? '#0f172a73' : '#ffffff40';
  const activeTint = isDark ? '#1f293780' : '#ffffff66';
  const inactiveTint = isDark ? '#0f172a4d' : '#ffffff29';
  const activeForeground = isDark ? '#f9fafb' : '#111827';
  const inactiveForeground = isDark ? '#cbd5f5' : '#374151';
  const focusShadow = shadow({
    radius: 28,
    y: 14,
    color: isDark ? '#00000066' : '#00000033',
  });

  if (Platform.OS !== 'ios') {
    return <BottomTabBar {...props} />;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}>
      <Host style={styles.host} colorScheme={scheme ?? 'light'}>
        <Namespace id={namespaceId}>
          <GlassEffectContainer spacing={18}>
            <HStack
              spacing={10}
              alignment="center"
              modifiers={[
                glassEffect({
                  glass: {
                    variant: 'regular',
                    tint: shellTint,
                  },
                  shape: 'capsule',
                }),
                glassEffectId('tabbar-shell', namespaceId),
                padding({ horizontal: 18, vertical: 12 }),
                frame({ maxWidth: 640 }),
                focusShadow,
              ]}>
              {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const options = descriptors[route.key]?.options ?? {};
                const config = TAB_CONFIG[route.name] ?? {
                  icon: 'square.fill' as SFSymbol,
                  title:
                    typeof options.tabBarLabel === 'string'
                      ? options.tabBarLabel
                      : options.title ?? route.name,
                };

                const label =
                  typeof options.tabBarLabel === 'string'
                    ? options.tabBarLabel
                    : options.title ?? config.title;

                const onPress = () => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                };

                return (
                  <Group
                    key={route.key}
                    onPress={onPress}
                    testID={options.tabBarTestID}
                    modifiers={[
                      glassEffect({
                        glass: {
                          variant: isFocused ? 'regular' : 'clear',
                          tint: isFocused ? activeTint : inactiveTint,
                          interactive: true,
                        },
                        shape: 'capsule',
                      }),
                      glassEffectId(route.key, namespaceId),
                      padding({ horizontal: 16, vertical: 10 }),
                      isFocused ? focusShadow : opacity(0.92),
                    ]}>
                    <VStack spacing={4} alignment="center">
                      <Image
                        systemName={config.icon}
                        size={20}
                        color={isFocused ? activeForeground : inactiveForeground}
                      />
                      <Text
                        size={12}
                        weight={isFocused ? 'semibold' : 'regular'}
                        color={isFocused ? activeForeground : inactiveForeground}>
                        {label}
                      </Text>
                    </VStack>
                  </Group>
                );
              })}
            </HStack>
          </GlassEffectContainer>
        </Namespace>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  host: {
    width: '100%',
  },
});

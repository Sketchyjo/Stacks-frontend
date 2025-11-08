// Learn more https://docs.expo.io/guides/customizing-metro
const getDefaultConfig = () => require('expo/metro-config').getDefaultConfig(__dirname);
const withNativeWind = () => require('nativewind/metro').withNativeWind;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig();

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = withNativeWind()(config, { input: './global.css' });

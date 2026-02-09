const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
const { resolver } = config;

config.resolver = {
  ...resolver,
  assetExts: [...resolver.assetExts.filter((ext) => ext !== 'svg'), 'avif'],
  sourceExts: [...resolver.sourceExts, 'svg'],
};

const nativeWindConfig = withNativeWind(config, { input: './global.css' });
// Delegate .svg to react-native-svg-transformer so SVGs are not parsed as JS
nativeWindConfig.transformer.babelTransformerPath = require.resolve('./metro.transformer.js');
module.exports = nativeWindConfig;

/**
 * Delegate .svg to react-native-svg-transformer; everything else to Expo's Babel transformer.
 * This preserves SVG handling while NativeWind's Babel preset still runs via babel.config.js.
 */
const path = require('path');
const svgTransformer = require('react-native-svg-transformer/expo');
const defaultTransformer = require('@expo/metro-config/build/babel-transformer');

module.exports.transform = function (options) {
  if (path.extname(options.filename) === '.svg') {
    return svgTransformer.transform(options);
  }
  return defaultTransformer.transform(options);
};

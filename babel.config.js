module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // Disable Fast Refresh on web to avoid "Invalid hook call" (multiple React instances on HMR).
          web: { enableReactFastRefresh: false },
        },
      ],
      'nativewind/babel',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};

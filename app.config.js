const appConfig = require('./app.json');

module.exports = () => {
  const mapboxToken = process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN || '';

  return {
    ...appConfig,
    expo: {
      ...appConfig.expo,
      plugins: [
        [
          '@rnmapbox/maps',
          {
            RNMapboxMapsImpl: 'mapbox',
            RNMapboxMapsDownloadToken: mapboxToken,
          },
        ],
        [
          'expo-location',
          {
            locationAlwaysAndWhenInUsePermission:
              'Allow CAC-Platform to use your location.',
          },
        ],
      ],
    },
  };
};

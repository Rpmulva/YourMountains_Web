import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const backgroundImage = require('../assets/background-hike.04.png');

/**
 * Web-specific outdoor background. Uses local asset so the site doesn't depend on external URLs.
 * Image (not CSS background) is more reliable with Metro-bundled assets on web.
 */
export default function OutdoorBackground() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        key="background-hike-02"
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.darkOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    minHeight: '120vh',
    zIndex: 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
});

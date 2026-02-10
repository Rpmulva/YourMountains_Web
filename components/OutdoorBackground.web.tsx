import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

const backgroundImage = require('../assets/background-hike.06.png');

/**
 * Web-specific outdoor background. Uses local asset so the site doesn't depend on external URLs.
 * Image (not CSS background) is more reliable with Metro-bundled assets on web.
 */
export default function OutdoorBackground() {
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        key="background-hike-06"
        source={backgroundImage}
        style={[
          styles.backgroundImage,
          isWide && styles.backgroundImageWide,
        ]}
        resizeMode="cover"
      />
      <View style={styles.darkOverlay} />
    </View>
  );
}

const HEADER_HEIGHT = 120;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: -80,
    width: '100%',
    minHeight: '100vh',
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
    objectPosition: 'center top',
    transform: [{ translateY: -60 }],
  },
  backgroundImageWide: {
    transform: [{ translateY: -20 }],
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

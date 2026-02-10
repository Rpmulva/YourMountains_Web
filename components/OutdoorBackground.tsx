import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

const backgroundImage = require('../assets/background-hike.06.png');

/**
 * Outdoor-themed nature background component
 * Uses a local mountain/nature image so the site doesn't depend on external URLs.
 */
export default function OutdoorBackground() {
  return (
    <ImageBackground 
      source={backgroundImage}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
      pointerEvents="none"
    >
      {/* Subtle dark overlay for text readability */}
      <View style={styles.darkOverlay} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    transform: [{ translateY: -60 }],
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '120%',
    zIndex: 0,
  },
  // Dark overlay - subtle darkening for text readability while keeping nature image visible
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Lighter overlay to keep the image brighter
  },
});

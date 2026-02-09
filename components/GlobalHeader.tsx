import { useRouter } from 'expo-router';
import { Dimensions, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

const brandLogo = require('../assets/brand-logo.png');

const { width } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 30;

export default function GlobalHeader() {
  const router = useRouter();
  const logoWidth = width * 0.5;
  const logoHeight = (logoWidth * 130) / 260;

  return (
    <View style={styles.floatingContainer}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={() => router.replace('/(tabs)')} 
        style={styles.logoWrapper}
      >
        <Image source={brandLogo} style={[styles.logo, { width: logoWidth, height: logoHeight }]} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute', // Forces it to float on top of everything
    top: 0,
    left: 0,
    right: 0,
    height: 180, // INCREASED HEIGHT significantly
    paddingTop: STATUS_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 9999, // Highest layer
    elevation: 10,
  },
  logoWrapper: {
    width: width, // Full Screen Width
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'center',
  },
});
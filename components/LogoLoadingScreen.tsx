import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';

const brandLogo = require('../assets/brand-logo.png');

const INTRO_TEXT = 'We need your help validating our idea!';
const LOGO_POP_DELAY_MS = 1600;
const LOGO_POP_DURATION_MS = 500;
const LOGO_HOLD_MS = 1400;
const CONTENT_FADE_OUT_MS = 280; // Hide content before overlay fade so they don't overlap
const FADE_OUT_DURATION_MS = 1800; // Slower fade into site
const LOGO_TRAVEL_DURATION_MS = 900;
const LOGO_TRAVEL_X = -220;
const LOGO_TRAVEL_Y = -260;
const TEXT_TRAVEL_Y = -220;

interface LogoLoadingScreenProps {
  /** When provided (e.g. overlay mode), fade out and call this instead of navigating. */
  onDone?: () => void;
  /** Called when the fade-out animation starts (for crossfade with main content). */
  onFadeStart?: () => void;
}

export default function LogoLoadingScreen({ onDone: onDoneProp, onFadeStart }: LogoLoadingScreenProps = {}) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateX = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;
  const isWeb = Platform.OS === 'web';

  // Show intro text first, then pop the logo, then fade out.
  useEffect(() => {
    const showLogoTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: LOGO_POP_DURATION_MS,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: LOGO_POP_DURATION_MS,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.4)),
        }),
      ]).start();
    }, LOGO_POP_DELAY_MS);
    const doneTimer = setTimeout(() => setDone(true), LOGO_POP_DELAY_MS + LOGO_HOLD_MS);
    return () => {
      clearTimeout(showLogoTimer);
      clearTimeout(doneTimer);
    };
  }, [logoOpacity, logoScale]);

  // When loading sequence is done: hide logo/text first, then fade overlay and call onDone.
  useEffect(() => {
    if (!done) return;
    const logoTravel = Animated.parallel([
      Animated.timing(logoTranslateX, {
        toValue: isWeb ? LOGO_TRAVEL_X : 0,
        duration: LOGO_TRAVEL_DURATION_MS,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(logoTranslateY, {
        toValue: isWeb ? LOGO_TRAVEL_Y : 0,
        duration: LOGO_TRAVEL_DURATION_MS,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(textTranslateY, {
        toValue: isWeb ? TEXT_TRAVEL_Y : 0,
        duration: LOGO_TRAVEL_DURATION_MS,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: CONTENT_FADE_OUT_MS,
        delay: LOGO_TRAVEL_DURATION_MS - CONTENT_FADE_OUT_MS,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]);
    const fadeOverlay = Animated.timing(fadeOut, {
      toValue: 0,
      duration: FADE_OUT_DURATION_MS,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    });
    logoTravel.start(({ finished }) => {
      if (finished) {
        onFadeStart?.();
        fadeOverlay.start(({ finished: overlayFinished }) => {
          if (overlayFinished) {
            if (onDoneProp) {
              onDoneProp();
            } else if (Platform.OS === 'web') {
              router.replace('/(web)');
            } else {
              router.replace('/auth');
            }
          }
        });
      }
    });
    return () => {
      logoTravel.stop();
      fadeOverlay.stop();
    };
  }, [
    done,
    contentOpacity,
    fadeOut,
    isWeb,
    logoTranslateX,
    logoTranslateY,
    onDoneProp,
    onFadeStart,
    router,
    textTranslateY,
  ]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Animated.View style={[styles.logoWrap, { opacity: contentOpacity }]}>
        <Animated.View style={{ transform: [{ translateY: textTranslateY }] }}>
          <Text style={styles.introText}>{INTRO_TEXT}</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.logoPop,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateX: logoTranslateX },
                { translateY: logoTranslateY },
              ],
            },
          ]}
        >
          <Image source={brandLogo} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { minHeight: '100vh' as unknown as number }),
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  introText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 30,
  },
  logoPop: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 260,
    height: 130,
  },
});

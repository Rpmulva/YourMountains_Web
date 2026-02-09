import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Dimensions, Platform, StyleSheet, View } from 'react-native';
import {
    SafeAreaFrameContext,
    SafeAreaInsetsContext,
    SafeAreaProvider,
} from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const DEFAULT_INSETS = { top: 0, left: 0, right: 0, bottom: 0 };

function WebSafeAreaProvider({ children }: { children: React.ReactNode }) {
  const frame = {
    x: 0,
    y: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  };
  return (
    <SafeAreaFrameContext.Provider value={frame}>
      <SafeAreaInsetsContext.Provider value={DEFAULT_INSETS}>
        {children}
      </SafeAreaInsetsContext.Provider>
    </SafeAreaFrameContext.Provider>
  );
}

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inWebGroup = segments[0] === '(web)';
    const atRoot = segments.length === 0 || segments[0] === 'index';

    if (isWeb) {
      // Web: when at root, index shows 5s logo loading then redirects; don't redirect here.
      // Redirect to (web) only when we're in (tabs) or another non-(web)/auth route.
      if (!atRoot && !inWebGroup && !inAuthGroup) {
        router.replace('/(web)');
      }
      // If on auth, stay there. If on (web), stay there. We never redirect web to (tabs).
    } else {
      if (!user && !inAuthGroup) {
        router.replace('/auth');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, segments]);

  // On web, don't block on auth loading—show the app so the marketing site can paint immediately.
  if (isLoading && !isWeb) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.claire.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isWeb && styles.containerWeb]}>
      <StatusBar style="light" translucent={true} backgroundColor="transparent" />
      
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'default',
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(web)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const isWeb = Platform.OS === 'web';
  const SafeAreaWrapper = isWeb ? WebSafeAreaProvider : SafeAreaProvider;
  return (
    <SafeAreaWrapper>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000000', // Dark background to prevent white flash
    overflow: 'hidden',
  },
  containerWeb: {
    minHeight: '100vh' as unknown as number,
    height: '100%' as unknown as number,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import LogoLoadingScreen from '../components/LogoLoadingScreen';

/**
 * Root index: on web go straight to (web) (loading overlay is there); on native show loading then auth.
 */
export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const id = setTimeout(() => {
      if (Platform.OS === 'web') {
        router.replace('/(web)');
      } else {
        router.replace('/auth');
      }
    }, 0);
    return () => clearTimeout(id);
  }, [router]);

  if (Platform.OS === 'web') {
    return null; // Web: redirect goes to (web) which shows overlay + site.
  }
  return <LogoLoadingScreen />;
}

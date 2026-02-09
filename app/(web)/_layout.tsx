import { Stack } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

export default function WebLayout() {
  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.containerWeb]}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A', flex: 1 } }}>
        <Stack.Screen name="index" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  containerWeb: { minHeight: '100vh' as unknown as number },
});

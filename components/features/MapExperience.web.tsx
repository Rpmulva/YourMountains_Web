import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MapExperienceWeb({
  onClose,
  onStartActivity,
}: {
  onClose?: () => void;
  onStartActivity?: () => void;
}) {
  const router = useRouter();

  const handleExit = () => {
    if (onClose) {
      onClose();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.page}>
      <SafeAreaView style={styles.fallbackContainer}>
        <View style={styles.fallbackContent}>
          <Text style={styles.fallbackTitle}>Map</Text>
          <Text style={styles.fallbackText}>
            The interactive map is available in the iOS and Android app.
          </Text>
          <Text style={styles.fallbackSubtext}>
            Use the app to explore trails and start activities from the map.
          </Text>
          <TouchableOpacity style={styles.fallbackButton} onPress={handleExit}>
            <Text style={styles.fallbackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  fallbackContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  fallbackText: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  fallbackButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

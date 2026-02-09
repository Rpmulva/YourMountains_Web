import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 30;

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false, 
          tabBarStyle: { display: 'none' }, // We use custom dock
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="planning" />
        <Tabs.Screen name="clubhouse" />
        <Tabs.Screen name="content" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
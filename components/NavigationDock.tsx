import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';

interface NavigationDockProps {
  activeTab?: string;
  onTabSelect?: (tab: string) => void;
}

export default function NavigationDock({ activeTab, onTabSelect }: NavigationDockProps) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : Spacing.sm;
  
  // Get current route from segments
  const currentRoute = segments[segments.length - 1] || 'index';
  const isActive = (tabId: string) => {
    if (activeTab) return activeTab === tabId;
    // Map tab IDs to route names
    const routeMap: { [key: string]: string } = {
      'discover': 'discover',
      'planning': 'planning',
      'clubhouse': 'clubhouse',
      'content': 'content',
      'profile': 'profile',
    };
    return currentRoute === routeMap[tabId] || (tabId === 'clubhouse' && currentRoute === 'index');
  };
  
  const handleTabPress = (tabId: string) => {
    if (onTabSelect) {
      onTabSelect(tabId);
    }
    // Navigate to the route
    const routeMap: { [key: string]: string } = {
      'discover': '/(tabs)/discover',
      'planning': '/(tabs)/planning',
      'clubhouse': '/(tabs)', // Home/index route
      'content': '/(tabs)/content',
      'profile': '/(tabs)/profile',
    };
    const route = routeMap[tabId];
    if (route) {
      router.push(route as any);
    }
  };
  
  const getIconStyle = (tabName: string) => {
    if (isActive(tabName)) {
      return {
        transform: [{ translateY: -4 }, { scale: 1.1 }],
      };
    }
    return {};
  };

  const getTabColor = (tabName: string) => {
    return isActive(tabName) ? '#1A1A1A' : '#737373';
  };

  const tabs = [
    {
      id: 'discover',
      label: 'Discover',
      icon: (active: boolean) => (
        <Ionicons 
          name={active ? "compass" : "compass-outline"} 
          size={22} 
          color={getTabColor('discover')} 
        />
      ),
    },
    {
      id: 'planning',
      label: 'Plan',
      icon: (active: boolean) => (
        <MaterialCommunityIcons 
          name={active ? "map-marker-path" : "map-marker-outline"} 
          size={22} 
          color={getTabColor('planning')} 
        />
      ),
    },
    {
      id: 'clubhouse',
      label: 'Home',
      icon: (active: boolean) => (
        <Ionicons 
          name="home" 
          size={26} 
          color={isActive('clubhouse') ? Colors.claire.primary : '#737373'} 
        />
      ),
      isCenter: true,
    },
    {
      id: 'content',
      label: 'Content',
      icon: (active: boolean) => (
        <Ionicons 
          name={active ? "play-circle" : "play-circle-outline"} 
          size={22} 
          color={getTabColor('content')} 
        />
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (active: boolean) => (
        <Ionicons 
          name={active ? "person" : "person-outline"} 
          size={22} 
          color={getTabColor('profile')} 
        />
      ),
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {tabs.map((tab) => {
        if (tab.isCenter) {
          return (
            <View key={tab.id} style={styles.centerDock}>
              <TouchableOpacity 
                style={[
                  styles.centerButton, 
                  isActive(tab.id) && styles.centerButtonActive
                ]} 
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.8}
              >
                {tab.icon(isActive(tab.id))}
              </TouchableOpacity>
              <Text 
                style={[
                  styles.centerLabel, 
                  { color: isActive(tab.id) ? Colors.claire.primary : '#737373' }
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </View>
          );
        }

        return (
          <TouchableOpacity 
            key={tab.id}
            style={styles.navItem} 
            onPress={() => handleTabPress(tab.id)} 
            activeOpacity={0.7}
          >
            <View style={getIconStyle(tab.id)}>
              {tab.icon(isActive(tab.id))}
            </View>
            <Text 
              style={[
                styles.navLabel, 
                { color: getTabColor(tab.id) }
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 68,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    zIndex: 1000,
    elevation: 10,
    ...Shadows.lg,
  },
  navItem: { 
    alignItems: 'center', 
    justifyContent: 'center',
    flex: 1,
    paddingVertical: Spacing.xs,
  },
  navLabel: { 
    ...Typography.caption,
    fontWeight: '600',
    marginTop: Spacing.xs,
    backgroundColor: 'transparent',
  },
  
  centerDock: { 
    alignItems: 'center',
    marginTop: -Spacing.lg,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  centerButtonActive: {
    backgroundColor: Colors.claire.primary,
    borderColor: Colors.claire.primary,
  },
  centerLabel: { 
    ...Typography.caption,
    fontWeight: '700',
    marginTop: Spacing.xs,
    backgroundColor: 'transparent',
  },
});
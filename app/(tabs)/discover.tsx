import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatureButton from '../../components/FeatureButton';
import NavigationDock from '../../components/NavigationDock';
import OutdoorBackground from '../../components/OutdoorBackground';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <OutdoorBackground />
      <View style={styles.contentContainer}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="compass" size={32} color={Colors.ui.text} />
          </View>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Explore trails and tools</Text>
        </View>

        {/* Features Grid */}
        <View style={styles.grid}>
          <FeatureButton 
            title="Maps" 
            icon="map-outline" 
            isLocked={false} 
            onPress={() => alert("Map View")}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Motion Diary" 
            icon="walk-outline" 
            isLocked={false}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Altitude Tools" 
            icon="image-filter-hdr" 
            isLocked={false}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Speed Tools" 
            icon="speedometer-outline" 
            isLocked={false}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Tracking" 
            icon="navigate-outline" 
            isLocked={false}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Weather" 
            icon="cloud-outline" 
            isLocked={true}
            iconColor={Colors.ui.text}
          />
        </View>
      </ScrollView>
      
      {/* Navigation Dock */}
      <NavigationDock />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3a52', // Fallback outdoor background
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#252525', // Fully opaque
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.ui.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
  },
});
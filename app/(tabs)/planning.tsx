import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatureButton from '../../components/FeatureButton';
import NavigationDock from '../../components/NavigationDock';
import OutdoorBackground from '../../components/OutdoorBackground';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';

export default function PlanningScreen() {
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
            <MaterialCommunityIcons name="map-marker-path" size={32} color={Colors.ui.text} />
          </View>
          <Text style={styles.title}>Trip Planning</Text>
          <Text style={styles.subtitle}>Plan your next adventure with Claire</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
            <MaterialCommunityIcons name="map-search" size={24} color={Colors.ui.text} />
            <Text style={styles.quickActionLabel}>Find Trails</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
            <MaterialCommunityIcons name="weather-cloudy" size={24} color={Colors.ui.text} />
            <Text style={styles.quickActionLabel}>Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
            <MaterialCommunityIcons name="backpack" size={24} color={Colors.ui.text} />
            <Text style={styles.quickActionLabel}>Gear List</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planning Tools</Text>
          <View style={styles.grid}>
            <FeatureButton 
              title="Route Builder" 
              icon="map-outline" 
              isLocked={false}
              iconColor={Colors.ui.text}
            />
            <FeatureButton 
              title="Trip Planner" 
              icon="calendar-outline" 
              isLocked={false}
              iconColor={Colors.ui.text}
            />
            <FeatureButton 
              title="Checklist" 
              icon="checkmark-circle-outline" 
              isLocked={true}
              iconColor={Colors.ui.text}
            />
            <FeatureButton 
              title="Share Plans" 
              icon="share-outline" 
              isLocked={true}
              iconColor={Colors.ui.text}
            />
          </View>
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Fully opaque
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  quickActionLabel: {
    ...Typography.smallBold,
    color: Colors.ui.text,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.ui.text,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
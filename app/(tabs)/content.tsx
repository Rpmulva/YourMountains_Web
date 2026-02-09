import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatureButton from '../../components/FeatureButton';
import NavigationDock from '../../components/NavigationDock';
import OutdoorBackground from '../../components/OutdoorBackground';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';

export default function ContentScreen() {
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
            <Ionicons name="play-circle" size={32} color={Colors.ui.text} />
          </View>
          <Text style={styles.title}>Content</Text>
          <Text style={styles.subtitle}>Learn, watch, and discover</Text>
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccess}>
          <TouchableOpacity style={styles.quickCard} activeOpacity={0.8}>
            <Ionicons name="videocam" size={28} color={Colors.ui.text} />
            <Text style={styles.quickCardLabel}>Videos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} activeOpacity={0.8}>
            <Ionicons name="library" size={28} color={Colors.ui.text} />
            <Text style={styles.quickCardLabel}>Library</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Library</Text>
          <View style={styles.grid}>
            <FeatureButton 
              title="Tutorials" 
              icon="school-outline" 
              isLocked={false}
              iconColor={Colors.ui.text}
            />
            <FeatureButton 
              title="Gear Reviews" 
              icon="star-outline" 
              isLocked={false}
              iconColor={Colors.ui.text}
            />
            <FeatureButton 
              title="Adventure Stories" 
              icon="book-outline" 
              isLocked={true}
              iconColor={Colors.ui.text}
            />
            <FeatureButton 
              title="Live Streams" 
              icon="radio-outline" 
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
  quickAccess: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Fully opaque
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  quickCardLabel: {
    ...Typography.bodyBold,
    color: Colors.ui.text,
    marginTop: Spacing.sm,
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
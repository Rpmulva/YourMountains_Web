import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatureButton from '../../components/FeatureButton';
import NavigationDock from '../../components/NavigationDock';
import OutdoorBackground from '../../components/OutdoorBackground';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function ClubhouseScreen() {
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
          <Text style={styles.title}>The Clubhouse</Text>
          <Text style={styles.subtitle}>Connect with the Community</Text>
        </View>

        {/* Features Grid */}
        <View style={styles.grid}>
          <FeatureButton 
            title="Message Board" 
            icon="chatbubbles-outline" 
            isLocked={false} 
            onPress={() => alert("Open Messages")}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Find a Buddy" 
            icon="people-outline" 
            isLocked={true}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Gear Locker" 
            icon="briefcase-outline" 
            isLocked={true}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Gear Swap" 
            icon="swap-horizontal-outline" 
            isLocked={true}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Events" 
            icon="calendar-outline" 
            isLocked={true}
            iconColor={Colors.ui.text}
          />
          <FeatureButton 
            title="Merch Store" 
            icon="shirt-outline" 
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
  },
  title: { 
    ...Typography.h1,
    color: Colors.ui.text,
    marginBottom: Spacing.xs,
  },
  subtitle: { 
    ...Typography.body,
    color: Colors.ui.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
  },
});
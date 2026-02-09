import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenuRow from '../../components/MenuRow';
import NavigationDock from '../../components/NavigationDock';
import OutdoorBackground from '../../components/OutdoorBackground';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  return (
    <View style={styles.container}>
      <OutdoorBackground />
      <View style={styles.contentContainer}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar} />
            <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Ionicons name="camera" size={16} color={Colors.ui.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.name || 'Adventure Seeker'}</Text>
          <Text style={styles.username}>{user?.email || '@adventurer'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Miles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Peaks</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuRow 
            title="My Trips" 
            icon="map-outline" 
            isLocked={false}
            iconColor={Colors.ui.text}
          />
          <MenuRow 
            title="Achievements" 
            icon="trophy-outline" 
            isLocked={false}
            iconColor={Colors.ui.text}
          />
          <MenuRow 
            title="Settings" 
            icon="settings-outline" 
            isLocked={false}
            iconColor={Colors.ui.text}
          />
          <MenuRow 
            title="Help & Support" 
            icon="help-circle-outline" 
            isLocked={false}
            iconColor={Colors.ui.text}
          />
          <MenuRow 
            title="Sign Out" 
            icon="log-out-outline" 
            isLocked={false}
            iconColor={Colors.claire.primary}
            onPress={signOut}
            isLast={true}
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
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.claire.primary, // Use Claire orange instead
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A1A', // Fully opaque
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.ui.background,
    ...Shadows.sm,
  },
  name: {
    ...Typography.h2,
    color: Colors.ui.text,
    marginBottom: Spacing.xs,
  },
  username: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A', // Fully opaque
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.claire.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.ui.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.ui.border,
  },
  menuSection: {
    backgroundColor: '#1A1A1A', // Fully opaque
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
});
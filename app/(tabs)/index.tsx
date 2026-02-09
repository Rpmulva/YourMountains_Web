import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Dimensions, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeedPost from '../../components/FeedPost';
import NavigationDock from '../../components/NavigationDock';
import OutdoorBackground from '../../components/OutdoorBackground';
import AltitudeCockpit from '../../components/features/AltitudeCockpit';
import ClaireExperience from '../../components/features/ClaireExperience';
import MapExperience from '../../components/features/MapExperience';
import MotionDiaries, { DiaryEntry } from '../../components/features/MotionDiaries';
import SpeedCockpit from '../../components/features/SpeedCockpit';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';

const { width } = Dimensions.get('window'); 

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeBottomTab, setActiveBottomTab] = useState<string | null>(null);
  const [showCockpit, setShowCockpit] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showClaire, setShowClaire] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [claireInitialPrompt, setClaireInitialPrompt] = useState('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  const scrollRef = useRef<ScrollView>(null);

  const handleBottomTabSelect = (tab: string) => {
    setActiveBottomTab(activeBottomTab === tab ? null : tab);
  };
  
  const launchAltitudeTools = () => { setActiveBottomTab(null); setShowCockpit(true); };
  const launchMap = () => { setActiveBottomTab(null); setShowMap(true); };
  const launchTracking = () => { setActiveBottomTab(null); setShowTracking(true); };
  const launchDiary = () => { setActiveBottomTab(null); setShowDiary(true); };
  
  const askClaire = (text: string) => {
    setActiveBottomTab(null);
    setClaireInitialPrompt(text);
    setShowClaire(true);
  };

  const handleStartFromMap = () => {
    setShowMap(false);
    setTimeout(() => setShowTracking(true), 300);
  };

  const handleSaveTrip = (entry: DiaryEntry) => {
    setDiaryEntries(prev => [entry, ...prev]); 
    setShowTracking(false); 
    setShowDiary(true); 
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      {/* Outdoor Background */}
      <OutdoorBackground />

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Hero Section with Claire */}
        <ScrollView 
        ref={scrollRef} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.lg }]} 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Claire Hero Card */}
        <View style={styles.heroSection}>
          <View style={styles.claireCard}>
            <View style={styles.claireHeader}>
              <View style={styles.claireIconContainer}>
                <MaterialCommunityIcons name="creation" size={32} color={Colors.claire.primary} />
              </View>
              <View style={styles.claireTitleContainer}>
                <Text style={styles.claireTitle}>Claire</Text>
                <Text style={styles.claireSubtitle}>Your AI Adventure Guide</Text>
              </View>
            </View>
            
            <Text style={styles.claireDescription}>
              Plan trips, discover trails, check weather, get gear recommendations, and connect with the community—all powered by AI.
            </Text>
            
            <TouchableOpacity 
              style={styles.claireButton}
              onPress={() => askClaire('')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="chat" size={20} color="#FFF" />
              <Text style={styles.claireButtonText}>Chat with Claire</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={launchMap}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="map" size={24} color={Colors.ui.text} />
              <Text style={styles.quickActionLabel}>Map</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={launchTracking}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="speedometer" size={24} color={Colors.ui.text} />
              <Text style={styles.quickActionLabel}>Track</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={launchAltitudeTools}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="image-filter-hdr" size={24} color={Colors.ui.text} />
              <Text style={styles.quickActionLabel}>Altitude</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={launchDiary}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="book-open-variant" size={24} color={Colors.ui.text} />
              <Text style={styles.quickActionLabel}>Diary</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Feed */}
        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Community Feed</Text>
          <FeedPost 
            username="SummitSeeker" 
            location="Breckenridge, CO" 
            likes={124} 
            caption="First tracks! 🏔️❄️" 
            imageUrl="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
          />
          <FeedPost 
            username="TrailRunner99" 
            location="Moab, UT" 
            likes={89} 
            caption="Desert sunset. 🌵🌅" 
            imageUrl="https://images.unsplash.com/photo-1474031317822-f51f48735ddd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
          />
          <FeedPost 
            username="CampVibes" 
            location="RMNP" 
            likes={210} 
            caption="Camp coffee. ☕🔥" 
            imageUrl="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
          />
        </View>
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Navigation Dock */}
      <NavigationDock activeTab={activeBottomTab || ''} onTabSelect={handleBottomTabSelect} />
      </View>

      {/* Modals */}
      <Modal visible={showCockpit} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            onPress={() => setShowCockpit(false)} 
            style={styles.modalCloseBtn}
          >
            <MaterialCommunityIcons name="close-circle" size={40} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <AltitudeCockpit />
          </View>
        </View>
      </Modal>
      
      <Modal visible={showMap} animationType="fade" transparent={false}>
        <MapExperience 
          onClose={() => setShowMap(false)} 
          onStartActivity={handleStartFromMap}
        />
      </Modal>
      
      <Modal visible={showTracking} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SpeedCockpit 
              onCancel={() => setShowTracking(false)} 
              onSave={handleSaveTrip} 
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showDiary} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <MotionDiaries 
            entries={diaryEntries} 
            onClose={() => setShowDiary(false)} 
          />
        </View>
      </Modal>

      <Modal visible={showClaire} animationType="slide" transparent={true}>
        <View style={styles.claireModalOverlay}>
          <ClaireExperience 
            onClose={() => setShowClaire(false)} 
            initialPrompt={claireInitialPrompt} 
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000000', // Dark background to prevent white bar
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0, // Will be set dynamically
    paddingBottom: Spacing.xxxl,
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  claireCard: {
    backgroundColor: '#1A1A1A', // Fully opaque - no transparency
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  claireHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  claireIconContainer: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: `${Colors.claire.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  claireTitleContainer: {
    flex: 1,
  },
  claireTitle: {
    ...Typography.h1,
    color: Colors.claire.primary,
    marginBottom: Spacing.xs,
  },
  claireSubtitle: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
  },
  claireDescription: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  claireButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.claire.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadows.claire,
  },
  claireButtonText: {
    ...Typography.bodyBold,
    color: '#FFF',
    marginLeft: Spacing.sm,
  },
  
  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.ui.text,
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  quickActionCard: {
    width: (width - Spacing.md * 2 - Spacing.xs * 2) / 2,
    backgroundColor: '#1A1A1A', // Fully opaque - no transparency
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    margin: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  quickActionLabel: {
    ...Typography.smallBold,
    color: Colors.ui.text,
    marginTop: Spacing.sm,
  },
  
  // Feed Section
  feedSection: {
    paddingHorizontal: Spacing.md,
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
  },
  claireModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 60,
  },
});
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import config from '../../configs';
import MenuRow from '../MenuRow';

interface ExploreMenuProps {
  onLaunchAltitude: () => void;
  onLaunchMap: () => void;
  onLaunchTracking: () => void; // Renamed
  onLaunchDiary: () => void;    // New
}

export default function ExploreMenu({ onLaunchAltitude, onLaunchMap, onLaunchTracking, onLaunchDiary }: ExploreMenuProps) {
  const THEME_COLOR = config.colors.exploringGold;

  return (
    <View>
       <Text style={[styles.header, { color: THEME_COLOR }]}>Exploring</Text>
       
       <MenuRow title="Open Map" icon="map-outline" isLocked={false} onPress={onLaunchMap} iconColor={THEME_COLOR} />
       
       {/* RENAMED to Tracking */}
       <MenuRow title="Tracking" icon="speedometer-outline" isLocked={false} onPress={onLaunchTracking} iconColor={THEME_COLOR} />
       
       <MenuRow title="Altitude" icon="image-filter-hdr" useMaterialIcon={true} isLocked={false} onPress={onLaunchAltitude} iconColor={THEME_COLOR} />
       
       {/* UNLOCKED Motion Diary */}
       <MenuRow title="Motion Diary" icon="walk-outline" isLocked={false} onPress={onLaunchDiary} isLast={true} iconColor={THEME_COLOR} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
});
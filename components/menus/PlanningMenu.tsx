import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import config from '../../configs';
import MenuRow from '../MenuRow';

export default function PlanningMenu() {
  const THEME_COLOR = config.colors.claireOrange;

  return (
    <View>
       <Text style={[styles.header, { color: THEME_COLOR }]}>Planning</Text>
       <MenuRow title="Saved Trips" icon="heart-outline" isLocked={false} iconColor={THEME_COLOR} />
       <MenuRow title="Route Builder" icon="map-outline" isLocked={false} iconColor={THEME_COLOR} />
       <MenuRow title="Permits & Passes" icon="card-outline" isLocked={true} isLast={true} iconColor={THEME_COLOR} />
    </View>
  );
}
const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
});
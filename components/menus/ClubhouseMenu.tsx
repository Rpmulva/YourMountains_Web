import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import config from '../../configs';
import MenuRow from '../MenuRow';

export default function ClubhouseMenu() {
  const THEME_COLOR = config.colors.communityGreen;

  return (
    <View>
       <Text style={[styles.header, { color: THEME_COLOR }]}>The Clubhouse</Text>
       <MenuRow title="Community Feed" icon="newspaper-outline" isLocked={false} iconColor={THEME_COLOR} />
       <MenuRow title="Local Events" icon="calendar-outline" isLocked={false} iconColor={THEME_COLOR} />
       <MenuRow title="Groups & Crews" icon="people-circle-outline" isLocked={true} isLast={true} iconColor={THEME_COLOR} />
    </View>
  );
}
const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
});
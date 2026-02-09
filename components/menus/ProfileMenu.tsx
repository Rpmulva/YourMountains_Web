import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import config from '../../configs';
import MenuRow from '../MenuRow';

export default function ProfileMenu() {
  const THEME_COLOR = config.colors.communityGreen;

  return (
    <View>
       <Text style={[styles.header, { color: THEME_COLOR }]}>Profile</Text>
       <MenuRow title="My Stats" icon="bar-chart-outline" isLocked={false} iconColor={THEME_COLOR} />
       <MenuRow title="Garage (Gear)" icon="pricetag-outline" isLocked={false} iconColor={THEME_COLOR} />
       <MenuRow title="Settings" icon="settings-outline" isLocked={false} isLast={true} iconColor={THEME_COLOR} />
    </View>
  );
}
const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
});
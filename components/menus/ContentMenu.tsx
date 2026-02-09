import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import config from '../../configs';
import MenuRow from '../MenuRow';

export default function ContentMenu() {
  const THEME_COLOR = config.colors.enablementBlue;

  return (
    <View>
       <Text style={[styles.header, { color: THEME_COLOR }]}>Content</Text>
       <MenuRow title="Latest Videos" icon="play-circle-outline" isLocked={false} iconColor={THEME_COLOR} />
       <MenuRow title="Skills & Tutorials" icon="school-outline" isLocked={false} iconColor={THEME_COLOR} />
       <MenuRow title="Community Stories" icon="people-outline" isLocked={true} isLast={true} iconColor={THEME_COLOR} />
    </View>
  );
}
const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
});
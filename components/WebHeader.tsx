import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

const brandLogo = require('../assets/brand-logo.png');

export default function WebHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.message}>
          We need your help validating our idea!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.ui.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  logo: {
    width: 220,
    height: 110,
    alignSelf: 'flex-start',
  },
  message: {
    ...Typography.h3,
    color: Colors.ui.text,
  },
});

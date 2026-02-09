import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

interface MenuRowProps {
  title: string;
  icon: any;
  isLocked: boolean;
  onPress?: () => void;
  isLast?: boolean;
  iconColor?: string;
  useMaterialIcon?: boolean;
}

export default function MenuRow({ 
  title, 
  icon, 
  isLocked, 
  onPress, 
  isLast, 
  iconColor = Colors.claire.primary,
  useMaterialIcon = false 
}: MenuRowProps) {
  
  return (
    <TouchableOpacity 
      style={[styles.row, isLast && styles.noBorder, isLocked && styles.lockedRow]} 
      onPress={!isLocked ? onPress : undefined}
      activeOpacity={isLocked ? 1 : 0.7}
    >
      <View style={styles.left}>
        <View style={[
          styles.iconBox, 
          isLocked ? styles.iconBoxLocked : { backgroundColor: `${iconColor}15` }
        ]}>
          {useMaterialIcon ? (
            <MaterialCommunityIcons 
              name={isLocked ? "lock" : icon} 
              size={20} 
              color={isLocked ? Colors.ui.textTertiary : iconColor} 
            />
          ) : (
            <Ionicons 
              name={isLocked ? "lock-closed" : icon} 
              size={20} 
              color={isLocked ? Colors.ui.textTertiary : iconColor} 
            />
          )}
        </View>
        <Text style={[styles.title, isLocked && styles.lockedText]}>{title}</Text>
      </View>
      
      {!isLocked && (
        <Ionicons name="chevron-forward" size={20} color={Colors.ui.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  noBorder: { 
    borderBottomWidth: 0 
  },
  lockedRow: { 
    opacity: 0.5 
  },
  left: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconBoxLocked: {
    backgroundColor: '#252525', // Fully opaque
  },
  title: {
    ...Typography.body,
    color: Colors.ui.text,
  },
  lockedText: {
    color: Colors.ui.textTertiary,
  },
});
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

interface FeatureProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap; 
  isLocked?: boolean; 
  onPress?: () => void;
  iconColor?: string;
}

export default function FeatureButton({ 
  title, 
  icon, 
  isLocked = true, 
  onPress,
  iconColor,
}: FeatureProps) {
  // Use unified modern color scheme
  const iconColorToUse = isLocked ? Colors.ui.textTertiary : Colors.ui.text;
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isLocked ? styles.locked : styles.active 
      ]}
      onPress={isLocked ? () => alert("Coming Soon!") : onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        isLocked && styles.iconContainerLocked
      ]}>
        <Ionicons 
          name={icon} 
          size={28} 
          color={iconColorToUse} 
        />
        {isLocked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={10} color={Colors.ui.textTertiary} />
          </View>
        )}
      </View>
      
      <Text style={[styles.text, isLocked && styles.textLocked]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '47%', 
    aspectRatio: 1.2, 
    backgroundColor: '#1A1A1A', // Fully opaque - no transparency
    borderRadius: Radius.md,
    padding: Spacing.md,
    margin: Spacing.xs,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  active: {
    borderColor: Colors.ui.border,
    borderWidth: 1,
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: '#252525', // Fully opaque
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  iconContainerLocked: {
    backgroundColor: '#1A1A1A', // Fully opaque
    opacity: 0.6,
  },
  lockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.ui.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  text: {
    ...Typography.bodyBold,
    color: Colors.ui.text,
  },
  textLocked: {
    color: Colors.ui.textTertiary,
  },
});
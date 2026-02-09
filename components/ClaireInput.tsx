import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Shadows, Spacing, Typography } from '../constants/theme';

interface ClaireInputProps {
  onAsk: (text: string) => void;
  style?: any;
  isDark?: boolean; 
}

export default function ClaireInput({ onAsk, style, isDark = false }: ClaireInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim().length > 0) {
      onAsk(text);
      setText('');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label Row */}
      <View style={styles.headerRow}>
        <MaterialCommunityIcons 
          name="sparkles"
          size={14} 
          color={Colors.claire.primary} 
        />
        <Text style={styles.label}>
          Ask Claire
        </Text>
      </View>
      
      {/* Input Field */}
      <View style={[
        styles.inputWrapper, 
        isDark && styles.inputWrapperDark
      ]}>
        <TextInput 
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="Trips, trails, weather, gear..." 
          placeholderTextColor={isDark ? Colors.ui.textTertiary : Colors.ui.textTertiary}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
        />
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.sendBtn, isDark && styles.sendBtnDark]}
          disabled={!text.trim()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="arrow-up" 
            size={20} 
            color={text.trim() ? '#FFF' : Colors.ui.textTertiary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginBottom: Spacing.md,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: Spacing.xs, 
    marginLeft: Spacing.xs,
  },
  label: { 
    ...Typography.caption,
    fontWeight: '700',
    marginLeft: Spacing.xs, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5,
    color: Colors.claire.primary,
  },
  
  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#FFF', 
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md, 
    height: 56,
    borderWidth: 1, 
    borderColor: Colors.ui.border,
    ...Shadows.sm,
  },
  
  inputWrapperDark: {
    backgroundColor: '#252525', // Fully opaque 
    borderColor: Colors.claire.primary,
    borderWidth: 2,
    ...Shadows.claire,
  },
  
  input: { 
    flex: 1, 
    ...Typography.body,
    color: Colors.ui.text,
    height: '100%',
  },
  inputDark: {
    color: Colors.ui.text,
  },
  
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.claire.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  sendBtnDark: {
    backgroundColor: Colors.claire.primary,
  },
});
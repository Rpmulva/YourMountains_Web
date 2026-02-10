import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

const brandLogo = require('../assets/brand-logo.png');

interface WebHeaderProps {
  onScrollToSurvey?: () => void;
  onScrollToFounders?: () => void;
  onHeaderLayout?: (height: number) => void;
}

export default function WebHeader({ onScrollToSurvey, onScrollToFounders, onHeaderLayout }: WebHeaderProps) {
  const { width } = useWindowDimensions();
  const narrow = width < 900;
  const compact = width < 640;

  const mobile = width < 768;
  const logoWidth = mobile ? 140 : compact ? 100 : narrow ? 130 : 160;
  const logoHeight = mobile ? 70 : compact ? 50 : narrow ? 65 : 80;
  const messageFontSize = compact ? 12 : narrow ? 14 : 17;
  const buttonFontSize = mobile ? 13 : compact ? 11 : narrow ? 12 : 13;
  const buttonPaddingH = mobile ? Spacing.md : compact ? Spacing.sm : narrow ? Spacing.md : Spacing.lg;
  const buttonPaddingV = mobile ? 4 : compact ? 6 : 6;
  const leftGap = compact ? Spacing.xs : Spacing.sm;
  const headerMinHeight = mobile ? 60 : compact ? 70 : 80;

  return (
    <View
      style={[styles.header, { minHeight: headerMinHeight }]}
      onLayout={(e) => onHeaderLayout?.(e.nativeEvent.layout.height)}
    >
      <View style={[styles.left, { gap: leftGap }]}>
        <Image
          source={brandLogo}
          style={[styles.logo, { width: logoWidth, height: logoHeight }]}
          resizeMode="contain"
        />
        {!mobile && (
          <Text
            style={[
              styles.message,
              {
                fontSize: messageFontSize,
                flexShrink: 1,
              },
            ]}
          >
            We need your help validating our idea!
          </Text>
        )}
      </View>
      <View style={[styles.right, narrow && styles.rightStacked]}>
        <TouchableOpacity
          style={[
            styles.headerButton,
            {
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
            },
          ]}
          onPress={onScrollToSurvey}
          activeOpacity={0.8}
        >
          <Text style={[styles.headerButtonText, { fontSize: buttonFontSize }]}>
            Take the Survey
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.headerButton,
            styles.headerButtonAlt,
            {
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
            },
          ]}
          onPress={onScrollToFounders}
          activeOpacity={0.8}
        >
          <Text style={[styles.headerButtonText, { fontSize: buttonFontSize }]}>
            Join the Founders Club
          </Text>
        </TouchableOpacity>
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
    minHeight: 80,
    paddingVertical: Spacing.sm,
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
    minWidth: 0,
    flexShrink: 1,
    marginRight: Spacing.lg,
  },
  logo: {
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  message: {
    ...Typography.h3,
    color: Colors.ui.text,
    flexShrink: 1,
    textAlign: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    flexShrink: 0,
  },
  rightStacked: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  headerButton: {
    backgroundColor: '#C3825A',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonAlt: {
    backgroundColor: Colors.brand.burntGreen,
  },
  headerButtonText: {
    ...Typography.bodyBold,
    color: '#FFF',
  },
});

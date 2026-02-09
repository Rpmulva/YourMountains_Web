/**
 * Modern Design System for CAC Platform
 * Focused on Claire AI and Community Tools
 */

import { Platform } from 'react-native';

// Modern Design System - Sleek & Minimal
export const Colors = {
  // Primary Brand - Claire (Single accent color)
  claire: {
    primary: '#FF6B35', // Vibrant orange (only accent)
    secondary: '#FF8C5A',
    accent: '#FFB88C',
    dark: '#E55A2B',
  },
  
  // Modern Monochromatic Palette - Fully Opaque
  ui: {
    background: '#0A0A0A', // Deep black (fallback, but outdoor bg is used)
    surface: '#1A1A1A', // Fully opaque dark surface - NO transparency
    surfaceElevated: '#252525', // Fully opaque elevated surface
    border: 'rgba(255, 255, 255, 0.15)', // Subtle white borders
    text: '#FFFFFF',
    textSecondary: '#E0E0E0',
    textTertiary: '#A0A0A0',
    accent: '#FF6B35', // Use Claire orange as the only accent
  },
  
  // Legacy community colors (kept for compatibility)
  community: {
    green: '#4CAF50',
    blue: '#2196F3',
    gold: '#FFC107',
  },
  
  // Semantic Colors (muted, modern)
  semantic: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
};

// Typography System
export const Typography = {
  // Display
  display: {
    fontSize: 36,
    fontWeight: '800' as const,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // Small
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  
  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

// Spacing System (8px base)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border Radius
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  claire: {
    shadowColor: Colors.claire.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Fonts
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

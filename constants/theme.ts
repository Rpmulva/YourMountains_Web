/**
 * YourMountains — Web Theme (v1.1)
 *
 * Source of truth:
 *   OneDrive/Projects/Brand standards/claude-design-output-v1/TOKENS_colors_and_type_css.md
 *   OneDrive/Projects/Brand standards/BRAND_STANDARDS_V1.1_AMENDMENT.md
 *
 * THE LAW: only twelve hex values are approved (six locked + six tonal
 * derivatives), plus pure #fff / #000 and opacity variations.
 *
 * This file preserves the legacy `Colors.claire / ui / community / brand /
 * semantic` nesting so existing consumers compile. Values have been remapped
 * to v1.1 tokens. Prefer `Colors.tokens` and `Colors.semantic` (canonical)
 * for new code.
 */

import { Platform } from 'react-native';

// -------- Six locked (v1) --------
const orange    = '#db7947';
const green     = '#96966c';
const blue      = '#7291a1';
const yellow    = '#f6ba68';
const brown     = '#705339';
const sandstone = '#fff9de';

// -------- Six tonal derivatives (v1.1) --------
const brownDeep     = '#2c2419';
const brownInk      = '#3a2d20';
const brownInk2     = '#4a3a2a';
const brownInkMuted = '#7a6a55';
const sandstone2    = '#f4ecc9';
const sandstone3    = '#e9dfb5';

// -------- Segment → color mapping --------
const segments = {
  explorers: orange,
  vendors:   green,
  anchors:   blue,
  creators:  yellow,
};

export const Colors = {
  // Canonical v1.1 surface (prefer this in new code)
  tokens: {
    orange, green, blue, yellow, brown, sandstone,
    brownDeep, brownInk, brownInk2, brownInkMuted, sandstone2, sandstone3,
  },
  segments,

  // Legacy shapes — values remapped to v1.1 ----------------------------
  claire: {
    primary:   orange,   // was #B44A1F (rusty burnt-orange)
    secondary: orange,   // was #C85C2A — collapses onto brand orange
    accent:    yellow,   // was #E08B55 — warmer tone → brand yellow
    dark:      brown,    // was #953A15 — grounding dark → brand brown
  },

  ui: {
    background:       brownDeep,                  // was #0A0A0A
    surface:          'rgba(44, 36, 25, 0.75)',    // was rgba(30,30,30,0.75) — now brown-deep tint
    surfaceElevated:  brownInk2,                  // was #252525
    border:           'rgba(255, 255, 255, 0.15)', // unchanged (white-opacity allowed)
    text:             '#ffffff',                   // unchanged
    textSecondary:    sandstone3,                 // was #E0E0E0
    textTertiary:     brownInkMuted,              // was #A0A0A0
    accent:           orange,                     // was #FF6B35
  },

  community: {
    green: green,   // was #4CAF50 (Material)
    blue:  blue,    // was #2196F3 (Material)
    gold:  yellow,  // was #FFC107 (Material amber) — canonical "gold" is brand yellow
  },

  brand: {
    burntGreen: green,  // was #6F7D45 (off-palette)
    burntBlue:  blue,   // was #4A6278 (off-palette)
  },

  semantic: {
    // Note: v1.1 has no red/amber channel. Success/warning/info mapped to
    // closest brand equivalents; error uses orange (brand CTA/attention).
    // Flag for DeDe: if a distinct error channel is required pre-beta,
    // it needs palette ratification before any new hue is introduced.
    success: green,
    warning: yellow,
    error:   orange,   // TODO(DeDe): true error hue requires v1.2 ratification
    info:    blue,
  },
};

// -------- Typography (v1) --------
export const Typography = {
  hero: {
    fontSize: 52,
    fontWeight: '700' as const,
    lineHeight: 58,
    letterSpacing: -1,
  },
  display: {
    fontSize: 36,
    fontWeight: '600' as const,  // v1: .ym-display uses 600 (was 800)
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,  // v1: h1 uses 800 (was 700)
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
    fontWeight: '700' as const,  // v1: h3 uses 700 (was 600)
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  lead: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
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
  caption: {
    fontSize: 12,
    fontWeight: '700' as const,   // v1: caption is 700, uppercase, letter-spaced
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
    color: orange,
  },
};

// -------- Spacing (v1 — 4px base, 8-step) --------
export const Spacing = {
  none: 0,
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
  // v1 numeric tokens (sp-0..sp-8)
  sp0: 0,
  sp1: 4,
  sp2: 8,
  sp3: 12,   // v1 adds this intermediate step
  sp4: 16,
  sp5: 24,
  sp6: 32,
  sp7: 48,
  sp8: 64,
};

// -------- Radii (v1) --------
export const Radius = {
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  xxl:   24,    // legacy value — kept so existing consumers don't shift
  xxl2:  28,    // v1 r-2xl: patch-like, badge feel
  round: 9999,
};

// -------- Shadows (v1 — brown-tinted, not black) --------
// RN shadow maps the primary layer of each v1 multi-stop shadow. On web,
// the style sheet translates this to a single box-shadow; for exact v1
// parity on web use inline CSS with the double-stop values in comments.
export const Shadows = {
  sm: {
    // v1: 0 1px 2px rgba(44,36,25,0.08), 0 2px 4px rgba(44,36,25,0.06)
    shadowColor: brownDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    // v1: 0 4px 8px rgba(44,36,25,0.10), 0 8px 16px rgba(44,36,25,0.08)
    shadowColor: brownDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    // v1: 0 8px 16px rgba(44,36,25,0.12), 0 16px 32px rgba(44,36,25,0.12)
    shadowColor: brownDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  claire: {
    // v1: --shadow-glow-orange: 0 4px 12px rgba(219,121,71,0.35)
    shadowColor: orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
};

// -------- Motion (new in v1) --------
export const Motion = {
  duration: {
    quick: 120,
    base:  200,
    slow:  360,
  },
  easing: {
    out:     'cubic-bezier(0.2, 0.8, 0.2, 1)',
    inOut:   'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// -------- Hit targets (new in v1) --------
export const HitTargets = {
  min: 44,
};

// -------- Fonts --------
// Montserrat is the v1.1-ratified brand typeface (locked by Ryan, brand-wide).
// Web: loaded via <link> in public/index.html + standalone-deploy/*.html.
// Native: must be pre-loaded via expo-font before these strings resolve.
export const Fonts = Platform.select({
  ios: {
    sans:    'Montserrat',
    serif:   'ui-serif',
    rounded: 'Montserrat',
    mono:    'JetBrains Mono',
  },
  default: {
    sans:    'Montserrat',
    serif:   'serif',
    rounded: 'Montserrat',
    mono:    'monospace',
  },
  web: {
    sans:    "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "Montserrat, 'SF Pro Rounded', system-ui, sans-serif",
    mono:    "'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});

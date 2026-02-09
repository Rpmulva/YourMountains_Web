import React from 'react';
import Svg, { Path } from 'react-native-svg';

// From Group 2.svg – viewBox 482 x 134
const ICON_ASPECT_WIDTH = 482;
const ICON_ASPECT_HEIGHT = 134;

const VIEW_BOX = '0 0 482 134';

// Exact paths from Group 2.svg. Draw order = right-to-left overlap (left in back, rightmost on top).
// Default: white. Pass color prop to override.
const PEAK_PATHS: [string, string][] = [
  ['M88.4475 45.7656C92.3485 41.885 98.6515 41.885 102.552 45.7656L191 133.75H0L88.4475 45.7656Z', '#FFFFFF'],
  ['M189.093 8.89733C193.085 4.22563 200.307 4.22563 204.298 8.89733L311.196 134H82.1958L189.093 8.89733Z', '#FFFFFF'],
  ['M294.43 40.4346C298.375 36.2619 305.016 36.2619 308.962 40.4346L397.196 133.75H206.196L294.43 40.4346Z', '#FFFFFF'],
  ['M392.284 55.5225C396.22 51.4195 402.78 51.4195 406.716 55.5225L482 134H317L392.284 55.5225Z', '#FFFFFF'],
];

interface AppIconProps {
  size?: number;
  width?: number;
  height?: number;
  /** Single color for all peaks (e.g. white). Omit to use per-peak colors. */
  color?: string;
  backgroundColor?: string;
}

/**
 * Vector app icon: 4 overlapping mountain triangles (Group 2.svg).
 */
export default function AppIcon({
  size = 80,
  width: widthProp,
  height: heightProp,
  color,
  backgroundColor,
}: AppIconProps) {
  const width = widthProp ?? size;
  const height = heightProp ?? (widthProp != null ? (widthProp * ICON_ASPECT_HEIGHT) / ICON_ASPECT_WIDTH : size);

  return (
    <Svg width={width} height={height} viewBox={VIEW_BOX}>
      {backgroundColor ? (
        <Path d="M241 134 m -241 0 a 241 241 0 1 1 482 0 a 241 241 0 1 1 -482 0" fill={backgroundColor} />
      ) : null}
      {PEAK_PATHS.map(([d, defaultFill], i) => (
        <Path key={i} d={d} fill={color ?? defaultFill} />
      ))}
    </Svg>
  );
}

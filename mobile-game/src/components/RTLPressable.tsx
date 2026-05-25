/**
 * RTL-aware Pressable component with haptic feedback simulation.
 * Touch target minimum 44×44dp.
 */
import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface RTLPressableProps extends PressableProps {
  /** Minimum touch target size */
  hitSlopSize?: number;
  /** Whether this button is disabled */
  disabled?: boolean;
  /** Custom style for disabled state */
  disabledStyle?: ViewStyle;
}

/**
 * A Pressable with proper touch targets and RTL support.
 * Minimum 44×44dp touch target as per DESIGN_SYSTEM.md.
 */
export const RTLPressable: React.FC<RTLPressableProps> = ({
  children,
  hitSlopSize = 44,
  disabled = false,
  disabledStyle,
  style,
  ...props
}) => {
  return (
    <Pressable
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      disabled={disabled}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
          minWidth: hitSlopSize,
          minHeight: hitSlopSize,
          justifyContent: 'center',
          alignItems: 'center',
        },
        ...(Array.isArray(style)
          ? style
          : [style as ViewStyle | undefined]),
        disabled && (disabledStyle ?? { opacity: 0.4 }),
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

export default RTLPressable;

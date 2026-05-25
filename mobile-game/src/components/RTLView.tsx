/**
 * RTL-aware View wrapper.
 * Automatically applies flexDirection based on current RTL setting.
 */
import React from 'react';
import { View, ViewStyle, I18nManager, StyleSheet } from 'react-native';

interface RTLViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Override the automatic RTL direction */
  direction?: 'row' | 'row-reverse' | 'column';
  /** Whether to flip direction in RTL mode */
  rtlFlip?: boolean;
}

/**
 * A View that automatically adjusts its flexDirection based on RTL mode.
 * When rtlFlip is true (default), row becomes row-reverse in RTL.
 */
export const RTLView: React.FC<RTLViewProps> = ({
  children,
  style,
  direction = 'row',
  rtlFlip = true,
}) => {
  const isRTL = I18nManager.isRTL;

  const getDirection = (): ViewStyle['flexDirection'] => {
    if (!rtlFlip) return direction;
    if (direction === 'row') {
      return isRTL ? 'row-reverse' : 'row';
    }
    if (direction === 'row-reverse') {
      return isRTL ? 'row' : 'row-reverse';
    }
    return direction;
  };

  return (
    <View
      style={[
        { flexDirection: getDirection() },
        ...(Array.isArray(style) ? style : [style as ViewStyle]),
      ]}
    >
      {children}
    </View>
  );
};

/**
 * A spacer component that respects RTL (marginStart/marginEnd).
 */
export const RTLSpacer: React.FC<{ size: number }> = ({ size }) => {
  return <View style={{ width: size, height: size }} />;
};

export default RTLView;

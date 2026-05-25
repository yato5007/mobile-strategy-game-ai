/**
 * RTL-aware Text component.
 * Automatically adjusts text alignment based on current language.
 */
import React from 'react';
import {
  Text,
  TextProps,
  I18nManager,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { Colors } from '../theme';

interface RTLTextProps extends TextProps {
  /** Override text alignment */
  align?: 'left' | 'right' | 'center' | 'auto';
  /** Use gold color (for VP, titles) */
  gold?: boolean;
  /** Use danger color */
  danger?: boolean;
  /** Bold font weight */
  bold?: boolean;
  /** Small font size */
  small?: boolean;
  /** Large font size */
  large?: boolean;
}

/**
 * A Text component that automatically adjusts alignment for RTL/LTR.
 * Handles Arabic text alignment and color scheme.
 */
export const RTLText: React.FC<RTLTextProps> = ({
  children,
  style,
  align,
  gold,
  danger,
  bold,
  small,
  large,
  ...props
}) => {
  const isRTL = I18nManager.isRTL;

  const textStyle: TextStyle = {
    color: gold
      ? Colors.vpText
      : danger
        ? Colors.danger
        : Colors.neutralText,
    fontWeight: bold ? '700' : '400',
    fontSize: small ? 12 : large ? 18 : 14,
    textAlign: align ?? (isRTL ? 'right' : 'left'),
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };

  return (
    <Text
      style={[textStyle, ...(Array.isArray(style) ? style : [style])]}
      {...props}
    >
      {children}
    </Text>
  );
};

/**
 * Heading text component with gold color and larger size.
 */
export const HeadingText: React.FC<RTLTextProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <RTLText
      gold
      bold
      large
      style={[{ fontSize: 24, marginVertical: 8 }, style as TextStyle]}
      {...props}
    >
      {children}
    </RTLText>
  );
};

export default RTLText;

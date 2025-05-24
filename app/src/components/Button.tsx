import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'gold' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...SHADOWS.small,
    };

    // Button size
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = SPACING.xs;
        baseStyle.paddingHorizontal = SPACING.md;
        baseStyle.borderRadius = BORDER_RADIUS.sm;
        break;
      case 'large':
        baseStyle.paddingVertical = SPACING.md;
        baseStyle.paddingHorizontal = SPACING.xl;
        baseStyle.borderRadius = BORDER_RADIUS.lg;
        break;
      default: // medium
        baseStyle.paddingVertical = SPACING.sm;
        baseStyle.paddingHorizontal = SPACING.lg;
        baseStyle.borderRadius = BORDER_RADIUS.md;
    }

    // Width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Variant
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = COLORS.secondary.main;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = COLORS.primary.main;
        break;
      case 'gold':
        baseStyle.backgroundColor = COLORS.gold.main;
        break;
      case 'text':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        break;
      default: // primary
        baseStyle.backgroundColor = COLORS.primary.main;
    }

    // Disabled state
    if (disabled) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
    };

    // Text size based on button size
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default: // medium
        baseStyle.fontSize = 16;
    }

    // Text color based on variant
    switch (variant) {
      case 'outline':
        baseStyle.color = COLORS.primary.main;
        break;
      case 'text':
        baseStyle.color = COLORS.primary.main;
        break;
      default:
        baseStyle.color = COLORS.white;
    }

    return baseStyle;
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default: // medium
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'outline' || variant === 'text' ? COLORS.primary.main : COLORS.white}
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <MaterialIcons
              name={icon as any}
              size={getIconSize()}
              color={
                variant === 'outline' || variant === 'text'
                  ? COLORS.primary.main
                  : COLORS.white
              }
              style={styles.leftIcon}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <MaterialIcons
              name={icon as any}
              size={getIconSize()}
              color={
                variant === 'outline' || variant === 'text'
                  ? COLORS.primary.main
                  : COLORS.white
              }
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
});

export default Button; 
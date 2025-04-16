import React from 'react';
import { View, Text, StyleSheet, ViewProps, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from '../constants/theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'premium';
export type CardElevation = 'small' | 'medium' | 'large' | 'xlarge';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  elevation?: CardElevation;
  title?: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: string;
  bordered?: boolean;
  gradientBorder?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  elevation = 'medium',
  title,
  subtitle,
  icon,
  onPress,
  actionLabel,
  onAction,
  actionIcon,
  bordered = false,
  gradientBorder = false,
  children,
  style,
  ...props
}) => {
  // Get base card style
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.card,
    };

    // Variant styling
    switch (variant) {
      case 'elevated':
        baseStyle.backgroundColor = COLORS.background.paper;
        switch (elevation) {
          case 'small':
            Object.assign(baseStyle, SHADOWS.small);
            break;
          case 'large':
            Object.assign(baseStyle, SHADOWS.large);
            break;
          case 'xlarge':
            Object.assign(baseStyle, SHADOWS.xlarge);
            break;
          default: // medium
            Object.assign(baseStyle, SHADOWS.medium);
        }
        break;
      case 'outlined':
        baseStyle.backgroundColor = COLORS.background.paper;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = COLORS.gray[200];
        break;
      case 'premium':
        baseStyle.backgroundColor = '#E8EFFF'; // Very light blue background
        Object.assign(baseStyle, SHADOWS.large);
        if (gradientBorder) {
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = COLORS.gold.main;
        }
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = COLORS.primary.main;
        break;
      default: // default
        baseStyle.backgroundColor = COLORS.background.paper;
    }

    // Add border if needed
    if (bordered && variant !== 'outlined' && variant !== 'premium') {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = COLORS.gray[200];
    }

    return baseStyle;
  };

  const CardContent = () => (
    <View style={styles.cardContent}>
      {/* Header section with icon, title, subtitle */}
      {(title || icon) && (
        <View style={styles.cardHeader}>
          {icon && (
            <View
              style={[
                styles.iconContainer,
                variant === 'premium' && styles.premiumIconContainer
              ]}
            >
              <MaterialIcons
                name={icon as any}
                size={24}
                color={variant === 'premium' ? COLORS.gold.main : COLORS.primary.main}
              />
            </View>
          )}
          <View style={styles.titleContainer}>
            {title && (
              <Text
                style={[
                  styles.title,
                  variant === 'premium' && styles.premiumTitle
                ]}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  variant === 'premium' && styles.premiumSubtitle
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Children content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer section with action button if provided */}
      {(actionLabel || actionIcon) && (
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              variant === 'premium' && styles.premiumActionButton
            ]}
            onPress={onAction}
          >
            {actionIcon && (
              <MaterialIcons
                name={actionIcon as any}
                size={18}
                color={variant === 'premium' ? COLORS.gold.main : COLORS.primary.main}
                style={styles.actionIcon}
              />
            )}
            <Text
              style={[
                styles.actionText,
                variant === 'premium' && styles.premiumActionText
              ]}
            >
              {actionLabel}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Render as touchable if onPress is provided, otherwise as regular View
  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]} {...props}>
      <CardContent />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: `${COLORS.primary.main}15`, // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  premiumIconContainer: {
    backgroundColor: `${COLORS.gold.main}15`, // 15% opacity
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  premiumTitle: {
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  premiumSubtitle: {
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  content: {
    marginVertical: SPACING.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  premiumActionButton: {
    borderTopColor: COLORS.gray[700],
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary.main,
  },
  premiumActionText: {
    color: COLORS.gold.main,
  },
});

export default Card;
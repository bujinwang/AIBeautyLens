import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';
import AILogoIcon from './AILogoIcon';

interface SkinMatrixHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const SkinMatrixHeader: React.FC<SkinMatrixHeaderProps> = ({
  title,
  subtitle,
  icon
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <AILogoIcon size="small" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  logoContainer: {
    marginRight: SPACING.md,
  },

  textContainer: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  iconContainer: {
    marginLeft: SPACING.sm,
  },
});

export default SkinMatrixHeader;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../constants/theme';

interface AILogoIconProps {
  size?: 'small' | 'medium' | 'large';
  style?: object;
}

const AILogoIcon: React.FC<AILogoIconProps> = ({
  size = 'medium',
  style
}) => {
  // Get size dimensions
  const getDimensions = () => {
    switch (size) {
      case 'small': return { width: 24, height: 24, fontSize: 12 };
      case 'large': return { width: 48, height: 48, fontSize: 20 };
      default: return { width: 36, height: 36, fontSize: 16 };
    }
  };

  const { width, height, fontSize } = getDimensions();

  return (
    <View
      style={[
        styles.container,
        { width, height },
        style
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>AI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    color: COLORS.white,
    fontWeight: '700',
  }
});

export default AILogoIcon;

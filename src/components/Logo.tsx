import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white';
  containerStyle?: object;
  showTagline?: boolean;
}

/**
 * Logo component for BeautyLens™ with SkinMatrix™ Analysis
 * Modern, clean design with integrated eye/lens icon
 */
const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  color = 'primary',
  containerStyle,
  showTagline = false
}) => {
  // Determine size values
  const fontSize = size === 'small' ? 20 : size === 'medium' ? 24 : 32;
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 28;
  const spacing = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
  const taglineSize = size === 'small' ? 10 : size === 'medium' ? 12 : 14;
  
  // Determine color values
  const textColor = color === 'primary' ? COLORS.primary.main : COLORS.white;
  const accentColor = COLORS.secondary.main;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.logoRow}>
        <Text style={[styles.textBeauty, { fontSize, color: textColor }]}>Beauty</Text>
        <Text style={[styles.textLens, { fontSize, color: textColor }]}>Lens</Text>
        <Text style={[styles.trademark, { fontSize: fontSize * 0.4, color: textColor }]}>™</Text>
        
        {/* Lens icon integrated with the logo */}
        <View style={[styles.iconContainer, { marginHorizontal: spacing / 2 }]}>
          <MaterialIcons 
            name="lens" 
            size={iconSize} 
            color={accentColor} 
          />
        </View>
      </View>
      
      {showTagline && (
        <View style={styles.taglineContainer}>
          <Text style={[styles.taglineText, { fontSize: taglineSize, color: textColor }]}>
            with SkinMatrix™ Analysis
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBeauty: {
    fontWeight: '600',
    letterSpacing: -0.25,
  },
  textLens: {
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  trademark: {
    fontWeight: '400',
    top: -5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  taglineContainer: {
    marginTop: 2,
    paddingLeft: 2,
  },
  taglineText: {
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0,
  }
});

export default Logo; 
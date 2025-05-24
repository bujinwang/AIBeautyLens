import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white';
  containerStyle?: object;
  showTagline?: boolean;
}

/**
 * Logo component for BeautyLens™ with DermaGraph™ Analysis
 * Modern, clean design with integrated custom lens icon
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
  const accentColor = color === 'primary' ? COLORS.secondary.main : COLORS.secondary.light;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.logoRow}>
        <Text 
          style={[
            styles.textBeauty, 
            { fontSize, color: textColor },
            color === 'white' && styles.textShadow
          ]}
        >
          Beauty
        </Text>
        <Text 
          style={[
            styles.textLens, 
            { fontSize, color: textColor },
            color === 'white' && styles.textShadow
          ]}
        >
          Lens
        </Text>
        <Text 
          style={[
            styles.trademark, 
            { fontSize: fontSize * 0.4, color: textColor },
            color === 'white' && styles.textShadow
          ]}
        >
          ™
        </Text>
        
        {/* Custom lens icon integrated with the logo */}
        <View style={[styles.iconContainer, { marginHorizontal: spacing / 2 }]}>
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
            <Circle
              cx="12"
              cy="12"
              r="8"
              fill={accentColor}
              fillOpacity="0.8"
              stroke={accentColor}
              strokeWidth="1.5"
            />
            <Circle
              cx="12"
              cy="12"
              r="4"
              fill="white"
              fillOpacity="0.5"
            />
          </Svg>
        </View>
      </View>
      
      {showTagline && (
        <View style={styles.taglineContainer}>
          <Text 
            style={[
              styles.taglineText, 
              { fontSize: taglineSize, color: textColor },
              color === 'white' && styles.textShadow
            ]}
          >
            with DermaGraph™ Analysis
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
  },
  textShadow: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});

export default Logo; 
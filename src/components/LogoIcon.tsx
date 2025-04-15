import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface LogoIconProps {
  size?: number;
  color?: 'primary' | 'white';
  containerStyle?: object;
}

/**
 * LogoIcon component for BeautyLens™ with DermaGraph™ Analysis
 * Compact icon version of the logo for app icon and small spaces
 */
const LogoIcon: React.FC<LogoIconProps> = ({ 
  size = 60, 
  color = 'primary',
  containerStyle 
}) => {
  // Determine sizes based on main size
  const fontSize = size * 0.7;
  const iconSize = size * 0.35;
  
  // Determine color values
  const textColor = color === 'primary' ? COLORS.primary.main : COLORS.white;
  const accentColor = COLORS.secondary.main;
  const bgColor = color === 'primary' ? COLORS.white : COLORS.primary.light;

  return (
    <View style={[
      styles.container, 
      { width: size, height: size, borderRadius: size / 2 },
      { backgroundColor: bgColor },
      containerStyle
    ]}>
      <View style={styles.contentContainer}>
        <Text style={[styles.textB, { fontSize, color: textColor }]}>B</Text>
        
        {/* Custom lens icon integrated with the logo */}
        <View style={[styles.iconContainer, { top: fontSize * 0.15 }]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for the logo icon
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textB: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: -5,
  }
});

export default LogoIcon; 
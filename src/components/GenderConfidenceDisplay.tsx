import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface GenderConfidenceDisplayProps {
  gender: string;
  confidence: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * A component that displays gender with a confidence score indicator
 */
const GenderConfidenceDisplay: React.FC<GenderConfidenceDisplayProps> = ({ 
  gender, 
  confidence, 
  showLabel = true,
  size = 'medium' 
}) => {
  // Function to get confidence color based on score
  const getConfidenceColor = (confidenceScore: number): string => {
    if (confidenceScore >= 0.85) return COLORS.confidence.high;
    if (confidenceScore >= 0.60) return COLORS.confidence.medium;
    return COLORS.confidence.low;
  };

  // Function to get confidence label based on score
  const getConfidenceLabel = (confidenceScore: number): string => {
    if (confidenceScore >= 0.85) return 'High';
    if (confidenceScore >= 0.60) return 'Medium';
    return 'Low';
  };

  // Get size-based styles
  const getStyles = () => {
    switch (size) {
      case 'small':
        return {
          text: { fontSize: 12 },
          indicator: { width: 6, height: 6 }
        };
      case 'large':
        return {
          text: { fontSize: 16 },
          indicator: { width: 10, height: 10 }
        };
      default:
        return {
          text: { fontSize: 14 },
          indicator: { width: 8, height: 8 }
        };
    }
  };

  const sizeStyles = getStyles();
  
  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.genderText, sizeStyles.text]}>
          {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Unknown'}
        </Text>
      )}
      
      <View style={styles.confidenceContainer}>
        <View 
          style={[
            styles.confidenceIndicator, 
            sizeStyles.indicator,
            { backgroundColor: getConfidenceColor(confidence) }
          ]} 
        />
        <Text style={[styles.confidenceText, sizeStyles.text]}>
          {Math.round(confidence * 100)}% 
          <Text style={styles.confidenceLabelText}> 
            ({getConfidenceLabel(confidence)})
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderText: {
    color: COLORS.text.primary,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceIndicator: {
    borderRadius: 4,
    marginRight: 4,
  },
  confidenceText: {
    color: COLORS.text.secondary,
  },
  confidenceLabelText: {
    color: COLORS.text.hint,
    fontStyle: 'italic',
  }
});

export default GenderConfidenceDisplay; 
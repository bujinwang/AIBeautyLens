import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface FeatureSeverityRatingProps {
  severity: number;
  maxSeverity?: number;
  showText?: boolean;
  colorScheme?: 'standard' | 'inverted';
  size?: 'small' | 'medium' | 'large';
  style?: object;
}

/**
 * A component that displays a feature severity rating with dots
 */
const FeatureSeverityRating: React.FC<FeatureSeverityRatingProps> = ({
  severity,
  maxSeverity = 5,
  showText = true,
  colorScheme = 'standard',
  size = 'medium',
  style
}) => {
  // Get color based on severity and color scheme
  const getColor = (index: number, severity: number) => {
    const isActive = index <= severity;

    if (!isActive) {
      return COLORS.gray[200]; // Inactive dot color
    }

    if (colorScheme === 'inverted') {
      // Inverted: high severity = red (bad), low severity = green (good)
      if (severity >= 5) return '#FF5252'; // Bright red for severe issues
      if (severity >= 4) return '#FF7676'; // Lighter red
      if (severity >= 3) return '#FFA726'; // Orange for medium issues
      if (severity >= 2) return '#FFCC80'; // Light orange
      return '#81C784'; // Green for minor issues
    } else {
      // Standard: high severity = green (good), low severity = red (bad)
      if (severity >= 5) return '#4CAF50'; // Bright green for excellent
      if (severity >= 4) return '#81C784'; // Light green
      if (severity >= 3) return '#FFA726'; // Orange for medium
      if (severity >= 2) return '#FFCC80'; // Light orange
      return '#FF5252'; // Red for poor
    }
  };

  // Get dot size based on component size
  const getDotSize = () => {
    switch (size) {
      case 'small': return 8;
      case 'large': return 16;
      default: return 12;
    }
  };

  // Get text size based on component size
  const getTextSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 16;
      default: return 13;
    }
  };

  const dotSize = getDotSize();
  const textSize = getTextSize();
  const dots = [];

  // Create dots based on severity
  for (let i = 1; i <= maxSeverity; i++) {
    dots.push(
      <View
        key={i}
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: getColor(i, severity),
            marginRight: i < maxSeverity ? SPACING.xs : 0
          }
        ]}
      />
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.dotsContainer}>
        {dots}
      </View>

      {showText && (
        <Text style={[styles.severityText, { fontSize: textSize }]}>
          {severity}/{maxSeverity}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 999,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  severityText: {
    marginLeft: SPACING.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  }
});

export default FeatureSeverityRating;

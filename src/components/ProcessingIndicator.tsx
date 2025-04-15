import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TextStyle } from 'react-native';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from '../constants/theme';
import CustomIcon from './CustomIcon';

// List of processing steps to display (in sequence)
const PROCESSING_STEPS = [
  { id: 1, text: "Initializing intelligent analysis...", icon: "memory" },
  { id: 2, text: "Facial feature mapping in progress...", icon: "face" },
  { id: 3, text: "Analyzing skin composition...", icon: "gesture" },
  { id: 4, text: "Calculating biometric parameters...", icon: "biotech" },
  { id: 5, text: "Running dermatological assessment...", icon: "science" },
  { id: 6, text: "Generating personalized recommendations...", icon: "lightbulb" },
  { id: 7, text: "Finalizing aesthetic evaluation...", icon: "auto-awesome" },
];

interface ProcessingIndicatorProps {
  isAnalyzing?: boolean;
  processingText?: string;
  showDetailedSteps?: boolean;
}

// Define valid typography styles without string literals for fontWeight
const TYPOGRAPHY_STYLES = {
  h5: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  body2: {
    fontSize: 14,
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 12,
    letterSpacing: 0.4,
  },
};

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  isAnalyzing = true,
  processingText = "Advanced AI analysis in progress",
  showDetailedSteps = true,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const spinValue = new Animated.Value(0);
  const fadeValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);
  const progressWidth = new Animated.Value(0);

  // Rotate animation
  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Progress bar animation
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: PROCESSING_STEPS.length * 1500,
        useNativeDriver: false,
      }).start();

      // Step animation
      if (showDetailedSteps) {
        const interval = setInterval(() => {
          setCurrentStep((prev) => {
            const next = prev + 1;
            if (next >= PROCESSING_STEPS.length) {
              clearInterval(interval);
              return prev;
            }
            // Start fade-in animation
            fadeValue.setValue(0);
            Animated.timing(fadeValue, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start();
            return next;
          });
        }, 1500); // Change step every 1.5 seconds

        return () => clearInterval(interval);
      }
    }
  }, [isAnalyzing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isAnalyzing) return null;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.iconBackground,
              {
                transform: [{ rotate: spin }, { scale: pulseValue }],
              },
            ]}
          >
            <CustomIcon name="settings" size={40} color={COLORS.primary.main} />
          </Animated.View>
          <View style={styles.iconCore}>
            <CustomIcon name="auto-awesome" size={20} color={COLORS.white} />
          </View>
        </View>

        <Text style={styles.title}>{processingText}</Text>

        {showDetailedSteps && PROCESSING_STEPS[currentStep] && (
          <Animated.View style={[styles.stepContainer, { opacity: fadeValue }]}>
            <CustomIcon
              name={PROCESSING_STEPS[currentStep].icon}
              size={20}
              color={COLORS.secondary.main}
            />
            <Text style={styles.stepText}>{PROCESSING_STEPS[currentStep].text}</Text>
          </Animated.View>
        )}

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.securityText}>
          Enterprise-grade analysis with encrypted data processing
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  innerContainer: {
    width: '85%',
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  iconContainer: {
    height: 80,
    width: 80,
    marginBottom: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBackground: {
    height: 80,
    width: 80,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(144, 97, 255, 0.1)',
  },
  iconCore: {
    position: 'absolute',
    height: 30,
    width: 30,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY_STYLES.h5.fontSize,
    fontWeight: TYPOGRAPHY_STYLES.h5.fontWeight,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
    backgroundColor: 'rgba(144, 97, 255, 0.05)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  stepText: {
    fontSize: TYPOGRAPHY_STYLES.body2.fontSize,
    letterSpacing: TYPOGRAPHY_STYLES.body2.letterSpacing,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.round,
    marginVertical: SPACING.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.secondary.main,
    borderRadius: BORDER_RADIUS.round,
  },
  securityText: {
    fontSize: TYPOGRAPHY_STYLES.caption.fontSize,
    letterSpacing: TYPOGRAPHY_STYLES.caption.letterSpacing,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default ProcessingIndicator; 
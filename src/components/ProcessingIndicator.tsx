import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TextStyle, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import CustomIcon from './CustomIcon';
import AILogoIcon from './AILogoIcon';
import { useLocalization } from '../i18n/localizationContext';

// List of processing steps to display (in sequence)
const PROCESSING_STEPS = [
  { id: 1, text: "Activating DermaTrack™ Sensor Technology...", icon: "memory" },
  { id: 2, text: "Performing 3D Facial Cartography Analysis...", icon: "face" },
  { id: 3, text: "Analyzing Lipid-Ceramide Composition...", icon: "gesture" },
  { id: 4, text: "Measuring Transepidermal Water Loss (TEWL)...", icon: "biotech" },
  { id: 5, text: "Running ChromaClear™ Hyperpigmentation Assessment...", icon: "science" },
  { id: 6, text: "Generating MicroInfusion™ Treatment Protocols...", icon: "lightbulb" },
  { id: 7, text: "Finalizing NeoCollagen™ Stimulation Potential...", icon: "auto-awesome" },
];

// Tech stack used in the app
const TECH_STACK = [
  {
    name: "ChromaScan™ HD",
    description: "Medical-grade dermatological imaging system",
    icon: "auto-awesome-motion"
  },
  {
    name: "HydraSense™ Pro",
    description: "Advanced skin hydration measurement technology",
    icon: "image"
  },
  {
    name: "DermaMatrix™",
    description: "Clinically-validated skin assessment platform",
    icon: "cloud"
  },
  {
    name: "BioResonance™ Scanner",
    description: "Multi-spectral skin layer mapping technology",
    icon: "smartphone"
  }
];

interface ProcessingIndicatorProps {
  isAnalyzing?: boolean;
  processingText?: string;
  showDetailedSteps?: boolean;
  showTechStack?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

// Define valid typography styles without string literals for fontWeight
const TYPOGRAPHY_STYLES = {
  h5: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 26,
  },
  body2: {
    fontSize: 14,
    letterSpacing: 0.25,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 18,
  },
};

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  isAnalyzing = true,
  processingText = "Clinical-grade dermatological analysis in progress",
  showDetailedSteps = true,
  showTechStack = true,
  error = null,
  onRetry,
}) => {
  const { t } = useLocalization();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTech, setCurrentTech] = useState(0);
  const spinValue = new Animated.Value(0);
  const fadeValue = new Animated.Value(0);
  const techFadeValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);
  const progressWidth = new Animated.Value(0);

  // Rotate animation
  useEffect(() => {
    if (isAnalyzing) {
      // Create the rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // Start the rotation
      rotateAnimation.start();

      // Cleanup function to stop animation when component unmounts or isAnalyzing becomes false
      return () => {
        rotateAnimation.stop();
        spinValue.setValue(0); // Reset the value
      };
    }
  }, [isAnalyzing, spinValue]);

  // Pulse animation
  useEffect(() => {
    if (isAnalyzing) {
      // Create the pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      );

      // Start the pulse animation
      pulseAnimation.start();

      // Cleanup function
      return () => {
        pulseAnimation.stop();
        pulseValue.setValue(1); // Reset the value
      };
    }
  }, [isAnalyzing, pulseValue]);

  // Progress bar and other animations...
  useEffect(() => {
    if (isAnalyzing) {
      // Progress bar animation
      progressWidth.setValue(0.5);
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 180000, // 3 minutes
        useNativeDriver: false,
      }).start();

      // Step animation
      if (showDetailedSteps) {
        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => {
            const next = prev + 1;
            if (next >= PROCESSING_STEPS.length) {
              return prev;
            }
            // Start fade-in animation
            fadeValue.setValue(0);
            Animated.timing(fadeValue, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }).start();
            return next;
          });
        }, 25000);

        return () => clearInterval(stepInterval);
      }
    }
  }, [isAnalyzing, showDetailedSteps]);

  // Tech stack animation
  useEffect(() => {
    if (isAnalyzing && showTechStack) {
      // Initial fade in
      techFadeValue.setValue(0);
      Animated.timing(techFadeValue, {
        toValue: 1,
        duration: 250, // Faster initial fade-in
        useNativeDriver: true,
      }).start();

      // Cycle through tech stack
      const techInterval = setInterval(() => {
        setCurrentTech((prev) => {
          const next = (prev + 1) % TECH_STACK.length;

          // Fade out and fade in
          Animated.sequence([
            Animated.timing(techFadeValue, {
              toValue: 0,
              duration: 150, // Faster fade out
              useNativeDriver: true,
            }),
            Animated.timing(techFadeValue, {
              toValue: 1,
              duration: 150, // Faster fade in
              useNativeDriver: true,
            })
          ]).start();

          return next;
        });
      }, 15000); // Change tech every 15 seconds to match the slower pace

      return () => clearInterval(techInterval);
    }
  }, [isAnalyzing, showTechStack]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isAnalyzing && !error) return null;

  if (error) {
    return (
      <View style={styles.container}>
        <View style={[styles.innerContainer, { paddingTop: '15%' }]}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, styles.errorBackground]}>
              <CustomIcon
                name="error"
                size={40}
                color={COLORS.error.main}
              />
            </View>
          </View>

          <Text style={[styles.processingText, styles.errorText]}>
            Analysis Error
          </Text>

          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessage}>
              {error.message || "An unexpected error occurred during analysis. Please try again."}
            </Text>
          </View>

          {onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <CustomIcon
                name="refresh"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.retryButtonText}>Retry Analysis</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.securityText}>
            Your data is secure and no partial analysis was stored
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, { paddingTop: '15%' }]}>
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.iconBackground,
              {
                transform: [{ rotate: spin }, { scale: pulseValue }],
              },
            ]}
          >
            <AILogoIcon size="large" />
          </Animated.View>
        </View>

        <Text style={styles.processingText}>{processingText}</Text>

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

        <View style={styles.timeEstimateContainer}>
          <Text style={styles.timeEstimateText}>{t('estimatedTime')}</Text>
        </View>

        {showTechStack && (
          <Animated.View style={[styles.techStackContainer, { opacity: techFadeValue }]}>
            <View style={styles.techItem}>
              <CustomIcon
                name={TECH_STACK[currentTech].icon}
                size={20}
                color={COLORS.secondary.main}
              />
              <View style={styles.techTextContainer}>
                <Text style={styles.techName}>{TECH_STACK[currentTech].name}</Text>
                <Text style={styles.techDescription}>
                  {TECH_STACK[currentTech].description}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

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
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    ...TYPOGRAPHY_STYLES.h5,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background.paper,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  stepText: {
    ...TYPOGRAPHY_STYLES.body2,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.background.default,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
  },
  timeEstimateContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timeEstimateText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  securityText: {
    fontSize: TYPOGRAPHY_STYLES.caption.fontSize,
    letterSpacing: TYPOGRAPHY_STYLES.caption.letterSpacing,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  techStackContainer: {
    width: '100%',
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.paper,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  techTextContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  techName: {
    ...TYPOGRAPHY_STYLES.body2,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  techDescription: {
    ...TYPOGRAPHY_STYLES.caption,
    color: COLORS.text.secondary,
  },
  errorBackground: {
    backgroundColor: COLORS.error.light,
  },
  errorText: {
    color: COLORS.error.main,
  },
  errorMessageContainer: {
    width: '100%',
    backgroundColor: COLORS.error.light,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  errorMessage: {
    ...TYPOGRAPHY_STYLES.body2,
    color: COLORS.error.main,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  retryButtonText: {
    ...TYPOGRAPHY_STYLES.body2,
    color: COLORS.white,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
});

export default ProcessingIndicator;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TextStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import CustomIcon from './CustomIcon';
import AILogoIcon from './AILogoIcon';

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
  processingText = "Clinical-grade dermatological analysis in progress",
  showDetailedSteps = true,
  showTechStack = true,
}) => {
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
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500, // Faster rotation
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 750, // Faster pulse expansion
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 750, // Faster pulse contraction
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Progress bar animation - even faster progress
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: PROCESSING_STEPS.length * 600, // Reduced from 1000 to 600 for faster progress
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
              duration: 250, // Faster fade-in for steps
              useNativeDriver: true,
            }).start();
            return next;
          });
        }, 600); // Change step every 0.6 seconds (even faster)

        return () => clearInterval(interval);
      }
    }
  }, [isAnalyzing]);

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
      }, 1000); // Change tech every 1 second (even faster)

      return () => clearInterval(techInterval);
    }
  }, [isAnalyzing, showTechStack]);

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
            <AILogoIcon size="large" />
          </Animated.View>
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

        {showTechStack && (
          <View style={styles.techStackContainer}>
            <Text style={styles.techStackTitle}>Powered by cutting-edge technology</Text>

            <View style={styles.techGridContainer}>
              {TECH_STACK.map((tech, index) => (
                <Animated.View
                  key={index}
                  style={[styles.techGridItem, { opacity: index === currentTech ? 1 : 0.6 }]}
                >
                  <View style={styles.techGridIconContainer}>
                    <AILogoIcon size="small" />
                  </View>
                  <Text style={styles.techGridName} numberOfLines={1}>{tech.name}</Text>
                </Animated.View>
              ))}
            </View>

            <View style={styles.techItemWrapper}>
              <Animated.View style={[styles.techItemContainer, { opacity: techFadeValue }]}>
                <View style={styles.techMainContainer}>
                  <View style={styles.techIconContainer}>
                    <AILogoIcon size="small" />
                  </View>
                  <View style={styles.techTextContainer}>
                    <Text style={styles.techName}>{TECH_STACK[currentTech].name}</Text>
                    <Text style={styles.techDescription}>{TECH_STACK[currentTech].description}</Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
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
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.round,
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
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  techStackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  techItemWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  techItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  techMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '80%',
    alignSelf: 'center',
  },
  techIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(144, 97, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  techTextContainer: {
    flex: 1,
  },
  techName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary.main,
    marginBottom: 4,
  },
  techDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'left',
  },
  techGridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
  },
  techGridItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: SPACING.md,
  },
  techGridIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(144, 97, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  techGridName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary.main,
    textAlign: 'center',
    marginTop: 4,
  },

});

export default ProcessingIndicator;
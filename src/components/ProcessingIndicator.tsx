import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TextStyle, Dimensions, ScrollView } from 'react-native';
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

// Eye area specific tech stack
const EYE_TECH_STACK = [
  {
    name: "OptiScan™ HD",
    description: "Precision eye area imaging system",
    icon: "visibility"
  },
  {
    name: "PeriOrbital™ Analyzer",
    description: "Advanced eye contour assessment technology",
    icon: "center_focus_strong"
  },
  {
    name: "OcuMatrix™",
    description: "Clinically-validated eye area assessment platform",
    icon: "remove_red_eye"
  },
  {
    name: "MicroVision™ Scanner",
    description: "High-resolution periocular tissue mapping",
    icon: "loupe"
  }
];

const HAIR_SCALP_PROCESSING_STEPS = [
  { id: 1, text: "Activating TrichoScan™ Imaging...", icon: "memory" },
  { id: 2, text: "Mapping Scalp & Hair Density...", icon: "face" },
  { id: 3, text: "Analyzing Follicular Miniaturization...", icon: "gesture" },
  { id: 4, text: "Assessing Scalp Health Markers...", icon: "biotech" },
  { id: 5, text: "Classifying Hair Loss Pattern...", icon: "science" },
  { id: 6, text: "Generating Trichology Report...", icon: "lightbulb" },
  { id: 7, text: "Finalizing Recommendations...", icon: "auto-awesome" },
];

const HAIR_SCALP_TECH_STACK = [
  {
    name: "TrichoScan™ HD",
    description: "High-resolution scalp imaging system",
    icon: "auto-awesome-motion"
  },
  {
    name: "FollicleMap™ Analyzer",
    description: "Advanced follicular density mapping",
    icon: "image"
  },
  {
    name: "ScalpMatrix™",
    description: "Clinically-validated scalp assessment",
    icon: "cloud"
  },
  {
    name: "Miniaturization Detector",
    description: "AI-based follicle miniaturization analysis",
    icon: "smartphone"
  }
];

interface ProcessingIndicatorProps {
  isAnalyzing?: boolean;
  processingText?: string;
  showDetailedSteps?: boolean;
  showTechStack?: boolean;
  analysisType?: 'facial' | 'eye' | 'hairScalp';
}

// Define valid typography styles
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
  processingText,
  showDetailedSteps = true,
  showTechStack = true,
  analysisType = 'facial',
}) => {
  const { t } = useLocalization();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTech, setCurrentTech] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const techFadeValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const animationRefs = useRef<{
    spin?: Animated.CompositeAnimation;
    pulse?: Animated.CompositeAnimation;
    progress?: Animated.CompositeAnimation;
  }>({});

  // Get screen width
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const isVerySmallScreen = SCREEN_WIDTH < 360;

  // Main animations setup
  useEffect(() => {
    if (!isAnalyzing) {
      // Clean up animations when not analyzing
      animationRefs.current.spin?.stop();
      animationRefs.current.pulse?.stop();
      animationRefs.current.progress?.stop();
      return;
    }

    // Stop any existing animations before starting new ones
    animationRefs.current.spin?.stop();
    animationRefs.current.pulse?.stop();
    animationRefs.current.progress?.stop();

    // Continuous rotation animation
    animationRefs.current.spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animationRefs.current.spin.start();

    // Continuous pulse animation
    animationRefs.current.pulse = Animated.loop(
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

    animationRefs.current.pulse.start();

    // Progress bar animation
    const animateProgress = () => {
      if (!isAnalyzing) return;
      
      animationRefs.current.progress = Animated.sequence([
        Animated.timing(progressWidth, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(progressWidth, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]);

      animationRefs.current.progress.start(({ finished }) => {
        if (finished && isAnalyzing) {
          animateProgress();
        }
      });
    };

    animateProgress();

    // Step animation
    let stepInterval: NodeJS.Timeout;
    if (showDetailedSteps) {
      stepInterval = setInterval(() => {
        if (!isAnalyzing) return;
        
        setCurrentStep((prev) => {
          const next = (prev + 1) % PROCESSING_STEPS.length;
          fadeValue.setValue(0);
          Animated.timing(fadeValue, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }).start();
          return next;
        });
      }, 3000);
    }

    return () => {
      if (stepInterval) clearInterval(stepInterval);
      animationRefs.current.spin?.stop();
      animationRefs.current.pulse?.stop();
      animationRefs.current.progress?.stop();
    };
  }, [isAnalyzing]);

  // Tech stack animation
  useEffect(() => {
    if (!isAnalyzing || !showTechStack) return;

    techFadeValue.setValue(0);
    Animated.timing(techFadeValue, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    const techInterval = setInterval(() => {
      if (!isAnalyzing) return;
      
      setCurrentTech((prev) => {
        const techStack = analysisType === 'eye' ? EYE_TECH_STACK : TECH_STACK;
        const next = (prev + 1) % techStack.length;
        Animated.sequence([
          Animated.timing(techFadeValue, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(techFadeValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        return next;
      });
    }, 2000);

    return () => {
      clearInterval(techInterval);
    };
  }, [isAnalyzing, showTechStack]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Determine processing text and steps based on analysisType
  let displayProcessingText = processingText;
  let steps = PROCESSING_STEPS;
  let techStack = TECH_STACK;
  if (analysisType === 'hairScalp') {
    displayProcessingText = t('hairScalpProcessingText') || 'Analyzing your hair and scalp... Our AI is processing multi-angle images to assess hair density, scalp health, and follicular miniaturization.';
    steps = HAIR_SCALP_PROCESSING_STEPS;
    techStack = HAIR_SCALP_TECH_STACK;
  } else if (analysisType === 'eye') {
    displayProcessingText = t('analyzingEyeAreaDetailPoints') || 'Analyzing your eye area...';
    steps = PROCESSING_STEPS;
    techStack = EYE_TECH_STACK;
  } else {
    displayProcessingText = processingText || t('processingText') || 'Clinical-grade dermatological analysis in progress';
    steps = PROCESSING_STEPS;
    techStack = TECH_STACK;
  }

  if (!isAnalyzing) return null;

  return (
    <View style={styles.container}>
      <View style={[
        styles.innerContainer,
        isVerySmallScreen && styles.innerContainerVerySmall
      ]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
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

          <Text style={styles.title}>{displayProcessingText}</Text>

          {showDetailedSteps && steps[currentStep] && (
            <Animated.View style={[styles.stepContainer, { opacity: fadeValue }]}>
              <CustomIcon
                name={steps[currentStep].icon}
                size={20}
                color={COLORS.secondary.main}
              />
              <Text style={styles.stepText}>{steps[currentStep].text}</Text>
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
            <View style={styles.techStackContainer}>
              <Text style={styles.techStackTitle}>Powered by cutting-edge technology</Text>
              <View style={styles.techGridContainer}>
                {techStack.map((tech, index) => (
                  <Animated.View
                    key={index}
                    style={[styles.techGridItem, { opacity: index === currentTech ? 1 : 0.6 }]}
                  >
                    <View style={styles.techGridIconContainer}>
                      <AILogoIcon size="small" />
                    </View>
                    <Text style={styles.techGridName} numberOfLines={2} ellipsizeMode='tail'>
                      {tech.name}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.securityText}>
            Enterprise-grade analysis with encrypted data processing
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 0,
  },
  innerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background.paper,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  innerContainerVerySmall: {},
  scrollView: {
    width: '100%',
  },
  scrollContentContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  iconContainer: {
    marginBottom: SPACING.md,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  iconBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY_STYLES.h5,
    fontSize: 13,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 18,
    paddingHorizontal: SPACING.sm,
    flexShrink: 1,
    maxWidth: '80%',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    width: '100%',
    minHeight: 35,
  },
  stepText: {
    ...TYPOGRAPHY_STYLES.body2,
    fontSize: 11,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    flexShrink: 1,
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.round,
  },
  timeEstimateContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  timeEstimateText: {
    ...TYPOGRAPHY_STYLES.caption,
    fontSize: 9,
    color: COLORS.text.secondary,
  },
  techStackContainer: {
    marginTop: SPACING.md,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.md,
    alignItems: 'center',
  },
  techStackTitle: {
    ...TYPOGRAPHY_STYLES.caption,
    fontSize: 9,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  techGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: SPACING.xs,
  },
  techGridItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  techGridIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  techGridName: {
    ...TYPOGRAPHY_STYLES.caption,
    fontSize: 8,
    color: COLORS.text.primary,
    textAlign: 'center',
    minHeight: 24,
  },
  securityText: {
    ...TYPOGRAPHY_STYLES.caption,
    fontSize: 9,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ProcessingIndicator;
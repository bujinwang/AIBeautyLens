import React, { useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import Card from '../components/Card';
import Button from '../components/Button';
import GenderConfidenceDisplay from '../components/GenderConfidenceDisplay';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';
import { TREATMENTS } from '../constants/treatments';

type TreatmentScreenRouteProp = RouteProp<RootStackParamList, 'Treatment'>;
type TreatmentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Treatment'>;

type Props = {
  route: TreatmentScreenRouteProp;
  navigation: TreatmentScreenNavigationProp;
};

// Update RootStackParamList in ../App.tsx to include these parameters
interface TreatmentParams {
  analysisResult: {
    gender: string;
    genderConfidence?: number;
    estimatedAge: number;
    skinType: string;
    features: Array<any>;
    recommendations: Array<{
      treatmentId: string;
      reason: string;
    }>;
  };
  imageUri: string;
  base64Image: string;
  recommendedTreatments: string[];
  reasons: { [key: string]: string[] };
  benefits: { [key: string]: string[] };
  visitPurpose: string;
  appointmentLength?: string;
}

// Define a Treatment type to match the TREATMENTS structure
type Treatment = {
  id: string;
  name: string;
  category: string;
  area: string;
  description: string;
  price: number;
};

interface SimulationParams {
  selectedTreatments: string[]; // Keep original name for compatibility
  imageUri: string;
  base64Image: string;
  visitPurpose?: string;
  appointmentLength?: string;
}

const TreatmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const {
    analysisResult = {
      gender: "",
      estimatedAge: 0,
      skinType: "",
      features: [],
      recommendations: []
    },
    imageUri = "",
    base64Image = "",
    recommendedTreatments = [],
    reasons = {},
    benefits = {},
    visitPurpose = "",
    appointmentLength = ""
  } = route.params as TreatmentParams;
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [concernBasedTreatments, setConcernBasedTreatments] = useState<string[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Recommended Treatments',
      headerTintColor: '#FFFFFF',
      headerStyle: {
        backgroundColor: '#4A90E2',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
    });
  }, [navigation]);

  useEffect(() => {
    // Calculate total price whenever selectedTreatments changes
    const newTotal = selectedTreatments.reduce((sum, id) => {
      const treatment = TREATMENTS.find(t => t.id === id);
      return sum + (treatment?.price || 0);
    }, 0);
    setTotalPrice(newTotal);
  }, [selectedTreatments]);

  useEffect(() => {
    if (visitPurpose && visitPurpose.length > 0) {
      const treatments = getConcernBasedRecommendations();
      console.log('Treatments recommended based on visit purpose:', treatments);
      setConcernBasedTreatments(treatments);
    }
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedTreatments.length === 0) {
      return;
    }

    navigation.navigate('Report', {
      treatmentIds: selectedTreatments,
      beforeImage: base64Image,
    });
  }, [selectedTreatments, base64Image, navigation]);

  // Move this outside the render function using useMemo
  const uniqueTreatmentIds = useMemo(() => {
    return analysisResult && analysisResult.recommendations ?
      [...new Set(analysisResult.recommendations.map((rec) => rec.treatmentId))] :
      [];
  }, [analysisResult]);

  // Define treatment details with extended information
  const treatmentDetails: { [key: string]: any } = {
    'botox': {
      title: 'Botox Injection',
      description: 'Reduces the appearance of facial wrinkles by temporarily paralyzing muscles.',
      icon: 'healing',
      benefits: [
        'Reduces dynamic wrinkles and fine lines',
        'Prevents wrinkle formation',
        'Quick treatment with minimal downtime',
        'Results last 3-6 months'
      ]
    },
    'filler': {
      title: 'Dermal Filler',
      description: 'Soft tissue filler injected to restore volume and fullness to the skin.',
      icon: 'invert-colors',
      benefits: [
        'Restores lost volume in hollow areas',
        'Smooths deep lines and creases',
        'Enhances facial contours',
        'Results last 6-18 months depending on product'
      ]
    },
    'chemical_peel': {
      title: 'Chemical Peel',
      description: 'A solution applied to the skin that exfoliates and eventually peels off.',
      icon: 'bolt',
      benefits: [
        'Improves skin texture and tone',
        'Reduces sun damage and age spots',
        'Helps clear acne and reduce scarring',
        'Available in different strengths for customized treatment'
      ]
    },
    'microdermabrasion': {
      title: 'Microdermabrasion',
      description: 'A minimally invasive procedure that exfoliates and removes the superficial layer of skin.',
      icon: 'grain',
      benefits: [
        'Improves skin texture and tone',
        'Reduces the appearance of fine lines',
        'Minimizes pores and mild acne scars',
        'No downtime required after treatment'
      ]
    },
    'laser_therapy': {
      title: 'Laser Therapy',
      description: 'Using focused light therapy to treat skin concerns like pigmentation and scars.',
      icon: 'flare',
      benefits: [
        'Targets specific skin concerns without affecting surrounding tissue',
        'Stimulates collagen production',
        'Reduces hyperpigmentation and redness',
        'Improves overall skin appearance'
      ]
    },
    'head-spa': {
      title: 'Head Spa Machine',
      description: 'Deep cleansing and stimulating treatment for the scalp to promote hair health and relieve tension.',
      icon: 'spa',
      benefits: [
        'Improves scalp circulation and hair growth',
        'Relieves tension and stress',
        'Removes buildup of products and oils',
        'Enhances effectiveness of hair treatments'
      ]
    },
    'acupuncture': {
      title: 'Facial Acupuncture',
      description: 'Traditional therapy using fine needles to stimulate specific points on the face, promoting natural healing and wellness.',
      icon: 'touch-app',
      benefits: [
        'Stimulates collagen production naturally',
        'Improves facial muscle tone',
        'Reduces fine lines and wrinkles',
        'Promotes overall skin health and circulation'
      ]
    },
  };

  // Update the EnhancedTreatmentCard component to use both sources
  const EnhancedTreatmentCard = React.memo(({ treatmentId, treatment, isSelected, onToggle }: {
    treatmentId: string,
    treatment: any,
    isSelected: boolean,
    onToggle: () => void
  }) => {
    const details = treatmentDetails[treatmentId];
    const treatmentReasons = reasons[treatmentId] || [];

    return (
      <TouchableOpacity
        style={[styles.enhancedCardContainer, isSelected && styles.enhancedCardSelected]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.enhancedCardHeader}>
          <Text style={styles.enhancedTreatmentName}>
            {treatment.name}
          </Text>
          <Text style={styles.enhancedTreatmentPrice}>
            ${treatment.price}
          </Text>
        </View>

        <View style={styles.enhancedCardContent}>
          <Text style={styles.enhancedAreaLabel}>Area: {treatment.area}</Text>

          <Text style={styles.enhancedTreatmentDescription}>
            {treatment.description}
          </Text>

          {treatmentReasons.length > 0 && (
            <View style={styles.enhancedReasonSection}>
              <Text style={styles.enhancedReasonTitle}>Why it's recommended:</Text>
              <Text style={styles.enhancedReasonText}>{treatmentReasons[0]}</Text>
            </View>
          )}

          {details?.benefits && (
            <View style={styles.enhancedBenefitsSection}>
              <Text style={styles.enhancedBenefitsTitle}>Benefits:</Text>
              {details.benefits.map((benefit: string, index: number) => (
                <View key={index} style={styles.enhancedBenefitItem}>
                  <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.benefitIcon} />
                  <Text style={styles.enhancedBenefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.enhancedSelectionContainer}>
          <View style={[styles.enhancedCheckbox, isSelected && styles.enhancedCheckboxSelected]}>
            {isSelected && <MaterialIcons name="check" size={20} color="#FFFFFF" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  // 1. Create individual treatment handlers by treatmentId to avoid recreating functions
  const treatmentToggleHandlers = useMemo(() => {
    const handlers: { [key: string]: () => void } = {};

    // Pre-generate handlers for all possible treatments
    TREATMENTS.forEach(treatment => {
      handlers[treatment.id] = () => {
        setSelectedTreatments(prev => {
          if (prev.includes(treatment.id)) {
            return prev.filter(id => id !== treatment.id);
          } else {
            return [...prev, treatment.id];
          }
        });
      };
    });

    return handlers;
  }, []);  // Empty dependency array as we want this to be created only once

  // Update the treatmentCheckboxes useMemo to use the enhanced treatment card
  const treatmentCheckboxes = useMemo(() => {
    const treatments = recommendedTreatments && recommendedTreatments.length > 0
      ? recommendedTreatments
      : uniqueTreatmentIds;

    return treatments.map((treatmentId) => {
      const treatment = TREATMENTS.find(t => t.id === treatmentId);
      if (!treatment) return null;

      const isSelected = selectedTreatments.includes(treatmentId);
      return (
        <EnhancedTreatmentCard
          key={treatmentId}
          treatmentId={treatmentId}
          treatment={treatment}
          isSelected={isSelected}
          onToggle={treatmentToggleHandlers[treatmentId]}
        />
      );
    });
  }, [recommendedTreatments, uniqueTreatmentIds, selectedTreatments, treatmentToggleHandlers, concernBasedTreatments, reasons]);

  // 3. Add a performance enhancement to limit unnecessary renders
  // Add this useEffect to run when the component mounts and set style optimization flags
  useEffect(() => {
    // Performance enhancement: Batch up state updates for React Native
    if (global.performance && global.performance.mark) {
      global.performance.mark('TreatmentScreen:mounted');
    }

    // Return cleanup function
    return () => {
      if (global.performance && global.performance.measure) {
        global.performance.measure(
          'TreatmentScreen:lifetime',
          'TreatmentScreen:mounted'
        );
      }
    };
  }, []);

  // Add function to get treatments based on concerns
  const getConcernBasedRecommendations = () => {
    // This is a placeholder - in a real app, you would call an LLM API here
    // with the concerns and treatments data to get personalized recommendations

    const concernToTreatmentMap: { [key: string]: string[] } = {
      'wrinkles': ['botox', 'ha-filler', 'prp', 'thermage'],
      'acne': ['hydrofacial', 'chemical_peel', 'laser_therapy', 'microdermabrasion'],
      'pigmentation': ['pico-laser', 'fractional-laser', 'chemical_peel'],
      'dryness': ['hydrofacial', 'aqua-needle', 'prp'],
      'oiliness': ['hydrofacial', 'chemical_peel'],
      'redness': ['laser_therapy', 'prp'],
      'pores': ['fractional-laser', 'microdermabrasion', 'hydrofacial'],
      'texture': ['microdermabrasion', 'fractional-laser', 'chemical_peel'],
      'elasticity': ['thermage', 'tempsure-rf', 'ha-filler', 'prp'],
      'darkCircles': ['ha-filler', 'prp', 'aqua-needle']
    };

    // Get treatments based on selected concerns
    let recommendedTreatmentIds: string[] = [];

    // Since visitPurpose is now a string, we need to handle it differently
    // Check if there's a mapping for this visit purpose
    if (visitPurpose && concernToTreatmentMap[visitPurpose]) {
      recommendedTreatmentIds = [...concernToTreatmentMap[visitPurpose]];
    }

    // Remove duplicates
    return [...new Set(recommendedTreatmentIds)];
  };

  // Add a function to render visit information
  const renderVisitPurpose = () => {
    if (!visitPurpose && !appointmentLength) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visit Information</Text>
        {visitPurpose && (
          <View style={styles.visitInfoItem}>
            <Text style={styles.visitInfoLabel}>Purpose of Visit:</Text>
            <Text style={styles.purposeText}>{visitPurpose}</Text>
          </View>
        )}
        {appointmentLength && (
          <View style={styles.visitInfoItem}>
            <Text style={styles.visitInfoLabel}>Appointment Length:</Text>
            <Text style={styles.purposeText}>{appointmentLength}</Text>
          </View>
        )}
      </View>
    );
  };

  const AnalysisSummaryMemo = useMemo(() => (
    <Card
      variant="elevated"
      title="SkinMatrix™ Analysis Summary"
      icon="face-retouching-natural"
      style={styles.summaryCard}
    >
      <View style={styles.analysisSummary}>
        <View style={styles.summaryImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.summaryImage} />
        </View>
        <View style={styles.summaryDetails}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Age:</Text>
            <Text style={styles.summaryValue}>{analysisResult?.estimatedAge || "N/A"} {analysisResult?.estimatedAge ? "years" : ""}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gender:</Text>
            <View style={styles.summaryValueContainer}>
              {analysisResult?.gender ? (
                <GenderConfidenceDisplay
                  gender={analysisResult.gender}
                  confidence={analysisResult.genderConfidence || 0}
                  size="small"
                />
              ) : (
                <Text style={styles.summaryValue}>N/A</Text>
              )}
            </View>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Skin Type:</Text>
            <Text style={styles.summaryValue}>{analysisResult?.skinType || "N/A"}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Features:</Text>
            <Text style={styles.summaryValue}>{analysisResult?.features?.length || 0} identified</Text>
          </View>
        </View>
      </View>
    </Card>
  ), [analysisResult, imageUri]);

  // Enhanced footer component to match the design
  const FooterComponent = React.memo(() => {
    return (
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.selectedTreatmentsText}>
            Selected Treatments: {selectedTreatments.length}
          </Text>
          <Text style={styles.totalPriceText}>
            Total: <Text style={styles.totalPriceAmount}>${totalPrice}</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedTreatments.length === 0 && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={selectedTreatments.length === 0}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>View Report</Text>
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Recommended Treatments</Text>
          <Text style={styles.subheading}>
            Based on your facial analysis, the following treatments are recommended:
          </Text>
        </View>

        {AnalysisSummaryMemo}

        {renderVisitPurpose()}

        <Text style={styles.sectionTitle}>Select Treatments</Text>

        <View style={styles.treatmentsCheckboxContainer}>
          {treatmentCheckboxes}
        </View>
      </ScrollView>

      <FooterComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120, // Extra padding at bottom to account for footer
  },
  headingContainer: {
    marginBottom: SPACING.lg,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 17,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  summaryCard: {
    marginBottom: SPACING.xl,
  },
  analysisSummary: {
    flexDirection: 'row',
  },
  summaryImageContainer: {
    marginRight: SPACING.md,
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  summaryDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    width: 80,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  summaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  treatmentsCheckboxContainer: {
    paddingHorizontal: 0,
    flexDirection: 'column',
    marginBottom: SPACING.xxl,
  },
  treatmentCard: {
    marginBottom: SPACING.md,
  },
  selectedTreatmentCard: {
    borderColor: COLORS.primary.main,
  },
  treatmentDescription: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  selectedTreatmentDescription: {
    color: '#000000', // Pure black for maximum contrast
    fontWeight: '600',
  },
  selectedDescriptionContainer: {
    backgroundColor: '#FFFFFF', // White background for maximum contrast
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  benefitsSection: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.primary.light + '40',  // 40% opacity
    borderRadius: BORDER_RADIUS.sm,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.dark,
    marginBottom: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  benefitIcon: {
    marginRight: SPACING.xs,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary.dark,
  },
  recommendedForSection: {
    marginTop: SPACING.sm,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  reasonIcon: {
    marginRight: SPACING.xs,
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  selectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#6A11CB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkedCircle: {
    backgroundColor: '#6A11CB',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectText: {
    fontSize: 14,
    color: '#6A11CB',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTreatmentsText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  totalPriceText: {
    fontSize: 16,
    color: '#333333',
  },
  totalPriceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Premium treatment card styles
  premiumCardContainer: {
    flexDirection: 'column',
    padding: SPACING.lg,
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumCardSelected: {
    backgroundColor: '#F5F8FF',
    borderColor: COLORS.primary.main,
    borderWidth: 2,
    shadowColor: COLORS.primary.main,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary.main,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary.main,
    borderWidth: 2,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary.main,
  },
  premiumTreatmentName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.3,
  },
  premiumTreatmentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary.main,
  },
  premiumTreatmentDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    marginLeft: 36,
    marginRight: SPACING.md,
  },
  premiumRecommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginLeft: 36,
    paddingVertical: SPACING.xs,
  },
  premiumRecommendedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold.main,
    marginLeft: SPACING.xs,
  },
  priceTag: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.primary.light,
    borderRadius: BORDER_RADIUS.sm,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6A11CB',
  },
  concernsCard: {
    marginBottom: SPACING.md,
  },
  concernChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.xs,
  },
  concernChip: {
    backgroundColor: COLORS.primary.light + '30',
    borderRadius: 16,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    margin: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary.light,
  },
  concernChipText: {
    fontSize: 12,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  recommendedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.main,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200] + '80',
  },
  recommendedText: {
    fontSize: 11,
    color: COLORS.primary.main,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.md,
  },
  visitInfoItem: {
    marginBottom: SPACING.sm,
  },
  visitInfoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  purposeText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: COLORS.background.paper,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },

  // Enhanced treatment card styles
  enhancedCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  enhancedCardSelected: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    shadowColor: '#4A90E2',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  enhancedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  enhancedTreatmentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
  },
  enhancedTreatmentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
  },
  enhancedCardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  enhancedAreaLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  enhancedTreatmentDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    marginBottom: 12,
  },
  enhancedReasonSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  enhancedReasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  enhancedReasonText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  enhancedSelectionContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  enhancedCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhancedCheckboxSelected: {
    backgroundColor: '#4A90E2',
  },
  enhancedBenefitsSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  enhancedBenefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  enhancedBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  enhancedBenefitText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
});

export default TreatmentScreen;
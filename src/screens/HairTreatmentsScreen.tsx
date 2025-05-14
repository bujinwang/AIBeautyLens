import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import { getLocalizedTreatments } from '../constants/treatments';
import { Treatment } from '../constants/treatmentTypes';
import { useLocalization } from '../i18n/localizationContext';
import { HairScalpAnalysisResult } from '../types/hairScalpAnalysis';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

// Define ParamList type for this screen
type HairTreatmentsScreenRouteProp = RouteProp<RootStackParamList, 'HairTreatments'>;
type HairTreatmentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HairTreatments'>;

type Props = {
  route: HairTreatmentsScreenRouteProp;
  navigation: HairTreatmentsScreenNavigationProp;
};

// Define expected params
interface HairTreatmentParams {
  hairScalpAnalysisResult: HairScalpAnalysisResult;
  imageUris?: string[];
}

const HairTreatmentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useLocalization();
  const { hairScalpAnalysisResult, imageUris } = route.params as HairTreatmentParams;

  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);
  const [recommendedHairTreatments, setRecommendedHairTreatments] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load localized treatments
  useEffect(() => {
    const loadTreatments = async () => {
      setIsLoading(true);
      try {
        const localizedTreatments = await getLocalizedTreatments();
        setAllTreatments(localizedTreatments);
      } catch (error) {
        console.error('Error loading treatments:', error);
        Alert.alert(t('error'), t('failedToLoadTreatments'));
      } finally {
        setIsLoading(false);
      }
    };
    loadTreatments();
  }, [t]);

  // Filter treatments based on hair analysis diagnosis and recommendations
  useEffect(() => {
    if (allTreatments.length > 0 && hairScalpAnalysisResult) {
      // Extract relevant keywords from hair analysis
      const diagnosis = hairScalpAnalysisResult.preliminaryDiagnosis?.toLowerCase() || '';
      const condition = hairScalpAnalysisResult.scalpCondition?.toLowerCase() || '';
      const pattern = hairScalpAnalysisResult.hairLossPattern?.toLowerCase() || '';
      
      // Treatment recommendations specifically mentioned in analysis
      const treatmentRecommendations = hairScalpAnalysisResult.recommendations
        .filter(rec => rec.type === 'treatment')
        .map(rec => rec.description.toLowerCase());
      
      // Keywords to match against treatment descriptions
      const keywords = [
        ...treatmentRecommendations,
        'hair', 'scalp', 'follicle', 'thinning', 'loss', 'alopecia',
        'dandruff', 'seborrheic', 'psoriasis', 'folliculitis'
      ];
      
      // Add diagnosis-specific keywords
      if (diagnosis.includes('androgenetic')) keywords.push('hair-restoration', 'prp');
      if (diagnosis.includes('telogen')) keywords.push('hair-restoration', 'scalp-cleaning');
      if (condition.includes('dry') || condition.includes('flaky')) keywords.push('scalp-cleaning');
      if (condition.includes('oily')) keywords.push('scalp-cleaning');
      
      // Filter treatments
      const hairTreatments = allTreatments.filter(treatment => {
        // Direct area match
        const areaMatch = treatment.area?.toLowerCase().includes('scalp') || 
                        treatment.area?.toLowerCase().includes('hair');
        
        // Category match
        const categoryMatch = treatment.category?.toLowerCase().includes('hair') || 
                            treatment.category?.toLowerCase().includes('scalp');
        
        // Description match (check if any keywords appear in the description)
        const descriptionMatch = Boolean(treatment.description && keywords.some(keyword => 
          treatment.description.toLowerCase().includes(keyword)
        ));
        
        // ID match for specific treatments
        const idMatch = [
          'hair-restoration', 
          'scalp-cleaning', 
          'luxury-head-spa',
          'hairline-microblading',
          'prp-facial' // PRP can be used for hair loss
        ].includes(treatment.id);
        
        return areaMatch || categoryMatch || descriptionMatch || idMatch;
      });
      
      setRecommendedHairTreatments(hairTreatments);
    }
  }, [allTreatments, hairScalpAnalysisResult]);

  // Set up the header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('recommendedHairTreatments'),
      headerTintColor: COLORS.white,
      headerStyle: {
        backgroundColor: COLORS.primary.main,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
    });
  }, [navigation, t]);

  // Calculate total price
  useEffect(() => {
    const newTotal = selectedTreatments.reduce((sum, id) => {
      const treatment = recommendedHairTreatments.find(t => t.id === id);
      return sum + (treatment?.price || 0);
    }, 0);
    setTotalPrice(newTotal);
  }, [selectedTreatments, recommendedHairTreatments]);

  // Toggle treatment selection
  const toggleTreatmentSelection = (treatmentId: string) => {
    setSelectedTreatments(prev => {
      if (prev.includes(treatmentId)) {
        return prev.filter(id => id !== treatmentId);
      } else {
        return [...prev, treatmentId];
      }
    });
  };

  // Handle continue action
  const handleContinue = () => {
    navigation.navigate('Report', {
      analysisType: 'hairScalp',
      hairScalpAnalysisResult: hairScalpAnalysisResult,
      imageUris: imageUris,
      treatmentIds: selectedTreatments,
      // visitPurpose and appointmentLength are not passed to HairTreatmentsScreen
      // so they cannot be forwarded here unless added to its route params.
    });
  };

  // Render a treatment card
  const renderTreatmentCard = (treatment: Treatment) => {
    if (!treatment) return null;

    const isSelected = selectedTreatments.includes(treatment.id);
    const matchesToDiagnosis = treatmentMatchesDiagnosis(treatment);

    return (
      <TouchableOpacity
        key={treatment.id}
        style={[
          styles.treatmentCard, 
          isSelected && styles.selectedTreatmentCard,
          matchesToDiagnosis && styles.recommendedTreatmentCard
        ]}
        onPress={() => toggleTreatmentSelection(treatment.id)}
        activeOpacity={0.7}
      >
        <View style={styles.treatmentHeader}>
          <Text style={styles.treatmentName} numberOfLines={1}>{treatment.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.treatmentPrice}>${treatment.price}</Text>
            {isSelected && (
              <View style={styles.checkmarkBadge}>
                <MaterialIcons name="check" size={16} color={COLORS.white} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.treatmentContent}>
          <Text style={styles.areaLabel}>{t('area')}: {treatment.area}</Text>
          <Text style={styles.treatmentDescription}>
            {treatment.description}
          </Text>
          {matchesToDiagnosis && (
            <View style={styles.reasonSection}>
              <Text style={styles.reasonTitle}>{t('whyRecommended')}</Text>
              <Text style={styles.reasonText}>
                {getRecommendationReason(treatment)}
              </Text>
            </View>
          )}
          {treatment.contraindications && treatment.contraindications.length > 0 && (
            <View style={styles.contraindicationsContainer}>
              <Text style={styles.contraindicationsTitle}>{t('contraindications')}</Text>
              <Text style={styles.contraindicationsText}>
                {treatment.contraindications.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Helper function to determine if a treatment matches the diagnosis
  const treatmentMatchesDiagnosis = (treatment: Treatment): boolean => {
    if (!hairScalpAnalysisResult) return false;
    
    const diagnosis = hairScalpAnalysisResult.preliminaryDiagnosis?.toLowerCase() || '';
    const condition = hairScalpAnalysisResult.scalpCondition?.toLowerCase() || '';
    
    // Special treatments that are highly recommended for specific conditions
    if (diagnosis.includes('androgenetic') && 
        ['hair-restoration', 'prp-facial'].includes(treatment.id)) {
      return true;
    }
    
    if ((condition.includes('dry') || condition.includes('flaky') || condition.includes('dandruff')) && 
        ['scalp-cleaning', 'luxury-head-spa'].includes(treatment.id)) {
      return true;
    }
    
    if (diagnosis.includes('telogen') && 
        ['hair-restoration', 'scalp-cleaning'].includes(treatment.id)) {
      return true;
    }
    
    return false;
  };

  // Generate a recommendation reason based on the analysis
  const getRecommendationReason = (treatment: Treatment): string => {
    if (!hairScalpAnalysisResult) return '';
    
    const diagnosis = hairScalpAnalysisResult.preliminaryDiagnosis;
    const condition = hairScalpAnalysisResult.scalpCondition;
    
    // Custom reasons based on treatment ID and diagnosis
    if (treatment.id === 'hair-restoration' && diagnosis.toLowerCase().includes('androgenetic')) {
      return t('recommendedForAndrogenetic');
    }
    
    if (treatment.id === 'scalp-cleaning' && 
        (condition.toLowerCase().includes('dry') || condition.toLowerCase().includes('flaky'))) {
      return t('recommendedForDryScalp');
    }
    
    if (treatment.id === 'luxury-head-spa') {
      return t('recommendedForScalpHealth');
    }
    
    if (treatment.id === 'prp-facial' && diagnosis.toLowerCase().includes('androgenetic')) {
      return t('recommendedForHairLoss');
    }
    
    return t('recommendedBasedOnAnalysis');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>{t('recommendedHairTreatments')}</Text>
          <Text style={styles.subheading}>
            {t('basedOnYourHairAnalysis')}
          </Text>
          <Text style={styles.diagnosisText}>
            {t('diagnosis')}: {hairScalpAnalysisResult.preliminaryDiagnosis}
          </Text>
        </View>

        <View style={styles.treatmentsContainer}>
          {isLoading ? (
            <Text style={styles.loadingText}>{t('loadingTreatments')}</Text>
          ) : recommendedHairTreatments.length > 0 ? (
            recommendedHairTreatments.map(treatment => renderTreatmentCard(treatment))
          ) : (
            <Text style={styles.loadingText}>{t('noHairTreatmentsAvailable')}</Text>
          )}
        </View>
      </ScrollView>

      {/* Footer with total and continue button */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.selectedTreatmentsText}>
            {t('selectedTreatments')}: {selectedTreatments.length}
          </Text>
          <Text style={styles.totalPriceText}>
            {t('total')}: <Text style={styles.totalPriceAmount}>${totalPrice}</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{t('confirmSelection')}</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120, // Extra padding for footer
  },
  headingContainer: {
    marginBottom: SPACING.lg,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  diagnosisText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  treatmentsContainer: {
    marginTop: SPACING.md,
  },
  treatmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTreatmentCard: {
    borderColor: COLORS.primary.main,
    borderWidth: 2,
    shadowColor: COLORS.primary.main,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  recommendedTreatmentCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary.main,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  treatmentName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  treatmentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary.main,
  },
  checkmarkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  treatmentContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  areaLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  treatmentDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  reasonSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontStyle: 'italic',
  },
  reasonText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  contraindicationsContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  contraindicationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error.main,
    marginBottom: SPACING.xs,
  },
  contraindicationsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedTreatmentsText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  totalPriceText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  totalPriceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary.main,
  },
  continueButton: {
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
});

export default HairTreatmentsScreen; 
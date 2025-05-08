import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App'; // Assuming EyeTreatments will be added here
import { getLocalizedTreatments } from '../constants/treatments';
import { Treatment } from '../constants/treatmentTypes'; // Import Treatment type from correct file
import { useLocalization } from '../i18n/localizationContext';
import { EyeAreaAnalysisResult } from '../types/eyeAnalysis'; // Correct type name

// Define ParamList type for this screen
type EyeTreatmentsScreenRouteProp = RouteProp<RootStackParamList, 'EyeTreatments'>; // Add 'EyeTreatments' to RootStackParamList
type EyeTreatmentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EyeTreatments'>;

type Props = {
  route: EyeTreatmentsScreenRouteProp;
  navigation: EyeTreatmentsScreenNavigationProp;
};

// Define expected params
interface EyeTreatmentParams {
  eyeAnalysisResult: EyeAreaAnalysisResult; // Use correct type name
  imageUri?: string; // Optional image URI
  visitPurpose?: string;
  appointmentLength?: string;
}

const EyeTreatmentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useLocalization();
  const {
    eyeAnalysisResult,
    imageUri, // Keep if needed for display or next step
    visitPurpose,
    appointmentLength
  } = route.params as EyeTreatmentParams;

  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);
  const [recommendedEyeTreatments, setRecommendedEyeTreatments] = useState<Treatment[]>([]);

  // Load localized treatments
  useEffect(() => {
    const loadTreatments = async () => {
      const localizedTreatments = await getLocalizedTreatments();
      setAllTreatments(localizedTreatments);
    };
    loadTreatments();
  }, []);

  // Filter treatments based on eye analysis recommendations
  useEffect(() => {
    if (allTreatments.length > 0 && eyeAnalysisResult?.recommendations) {
       // Assuming eyeAnalysisResult.recommendations contains treatment IDs or similar identifiers
       // This logic might need adjustment based on the actual structure of eyeAnalysisResult.recommendations
       const recommendedIds = eyeAnalysisResult.recommendations.map((rec: any) => rec.treatmentId); // Adjust based on actual structure
       const filtered = allTreatments.filter(t => recommendedIds.includes(t.id) || t.area?.toLowerCase().includes('eye')); // Filter by ID or area
       setRecommendedEyeTreatments(filtered);
    } else if (allTreatments.length > 0) {
       // Fallback: Show all treatments applicable to the eye area if no specific recommendations
       const filtered = allTreatments.filter(t => t.area?.toLowerCase().includes('eye'));
       setRecommendedEyeTreatments(filtered);
    }
  }, [allTreatments, eyeAnalysisResult]);


  // Set up the header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('recommendedEyeTreatments'), // Add new i18n key
      headerTintColor: '#FFFFFF',
      headerStyle: {
        backgroundColor: '#4A90E2', // Match existing style
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
    });
  }, [navigation, t]);

  // Calculate total price whenever selectedTreatments or recommendedEyeTreatments changes
  useEffect(() => {
    const newTotal = selectedTreatments.reduce((sum, id) => {
      const treatment = recommendedEyeTreatments.find(t => t.id === id);
      return sum + (treatment?.price || 0);
    }, 0);
    setTotalPrice(newTotal);
  }, [selectedTreatments, recommendedEyeTreatments]);

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

  // Handle continue action (e.g., navigate to a final summary or back)
  const handleContinue = () => {
    // TODO: Define what happens next (e.g., navigate back, show summary)
    // For now, just go back to the report screen
     navigation.goBack();
    // Example: Navigate to a new summary screen if needed
    // navigation.navigate('EyeReportSummary', {
    //   selectedTreatmentIds: selectedTreatments,
    //   eyeAnalysisResult: eyeAnalysisResult,
    //   imageUri: imageUri
    // });
  };

  // Render a treatment card
  const renderTreatmentCard = (treatment: Treatment) => {
    if (!treatment) return null;

    const isSelected = selectedTreatments.includes(treatment.id);
    // Assuming reasons might come from eyeAnalysisResult if available
    const reasonsForTreatment = eyeAnalysisResult?.recommendations?.find((rec: any) => rec.treatmentId === treatment.id)?.reason || ''; // Adjust based on actual structure

    return (
      <TouchableOpacity
        key={treatment.id}
        style={[styles.treatmentCard, isSelected && styles.selectedTreatmentCard]}
        onPress={() => toggleTreatmentSelection(treatment.id)}
        activeOpacity={0.7}
      >
        <View style={styles.treatmentHeader}>
          <Text style={styles.treatmentName} numberOfLines={1}>{treatment.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.treatmentPrice}>${treatment.price}</Text>
            {isSelected && (
              <View style={styles.checkmarkBadge}>
                <MaterialIcons name="check" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.treatmentContent}>
          <Text style={styles.areaLabel}>{t('area')} {treatment.area}</Text>
          <Text style={styles.treatmentDescription}>
            {treatment.description}
          </Text>
          {reasonsForTreatment && (
            <View style={styles.reasonSection}>
              <Text style={styles.reasonTitle}>{t('whyRecommended')}</Text>
              <Text style={styles.reasonText}>{reasonsForTreatment}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>{t('recommendedEyeTreatments')}</Text>
          <Text style={styles.subheading}>
            {t('basedOnYourEyeAnalysis')} {/* Add new i18n key */}
          </Text>
        </View>

        <View style={styles.treatmentsContainer}>
          {recommendedEyeTreatments.length > 0 ? (
            recommendedEyeTreatments.map(treatment => renderTreatmentCard(treatment))
          ) : (
            <Text style={styles.loadingText}>{t('noTreatmentsAvailable')}</Text> // Add new i18n key
          )}
        </View>
      </ScrollView>

      {/* Footer with total and continue button */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.selectedTreatmentsText}>
            {t('selectedTreatments')} {selectedTreatments.length}
          </Text>
          <Text style={styles.totalPriceText}>
            {t('total')} <Text style={styles.totalPriceAmount}>${totalPrice}</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            // Optionally disable if needed based on selection
            // selectedTreatments.length === 0 && styles.disabledButton
          ]}
          onPress={handleContinue}
          // disabled={selectedTreatments.length === 0}
          activeOpacity={0.7}
        >
          <Text>{t('confirmSelection')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Use styles similar to RecommendedTreatmentsScreen, adjust as needed
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Extra padding for footer
  },
  headingContainer: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  treatmentsContainer: {
    marginTop: 16,
  },
  treatmentCard: {
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
  selectedTreatmentCard: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    shadowColor: '#4A90E2',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  treatmentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
    marginRight: 16,
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
    color: '#4A90E2',
  },
  checkmarkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  treatmentContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  areaLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  treatmentDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    marginBottom: 12,
  },
  reasonSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  reasonText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
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
  loadingText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default EyeTreatmentsScreen;

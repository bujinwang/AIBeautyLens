import React, { useState, useEffect } from 'react'; // Import useEffect
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Share, Platform, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
// Remove static import: import { TREATMENTS } from '../constants/treatments';
import { getLocalizedTreatments } from '../constants/treatments'; // Import the async function
import { Treatment } from '../constants/treatmentTypes'; // Import the Treatment type
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING } from '../constants/theme'; // Import theme constants
import { useLocalization } from '../i18n/localizationContext';
import EyeSkincareAdviceModal from '../components/EyeSkincareAdviceModal'; // Import the new modal
import HaircareAdviceModal from '../components/HaircareAdviceModal'; // Import the haircare modal
import { HairScalpAnalysisResult, HaircareRecommendationsResult } from '../types/hairScalpAnalysis';
import { getHaircareRecommendations } from '../services/geminiService';

type ReportScreenRouteProp = RouteProp<RootStackParamList, 'Report'>;
type ReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Report'>;

type Props = {
  route: {
    params: {
      analysisType?: 'eye' | 'fullFace' | 'beforeAfter' | 'hairScalp';
      imageUri?: string;
      eyeAnalysisResult?: any;
      analysisResult?: any;
      beforeAfterAnalysisResult?: any;
      treatmentIds?: string[];
      beforeImage?: string;
      afterImage?: string;
      visitPurpose?: string;
      appointmentLength?: number;
      imageUris?: string[];
      hairScalpAnalysisResult?: HairScalpAnalysisResult;
    };
  };
  navigation: ReportScreenNavigationProp;
};

const ReportScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t, currentLanguage } = useLocalization();
  // Destructure all potential params
  const {
    analysisType,
    imageUri,
    eyeAnalysisResult,
    analysisResult,
    treatmentIds = [],
    beforeImage,
    visitPurpose,
    appointmentLength,
    imageUris,
    hairScalpAnalysisResult,
  } = route.params;

  const [generating, setGenerating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEyeSkincareModalVisible, setEyeSkincareModalVisible] = useState(false); // State for the eye modal
  const [isHaircareModalVisible, setHaircareModalVisible] = useState(false); // State for the haircare modal
  const [haircareRecommendations, setHaircareRecommendations] = useState<HaircareRecommendationsResult | null>(null);
  const [isLoadingHaircare, setIsLoadingHaircare] = useState(false);
  const [localizedTreatments, setLocalizedTreatments] = useState<Treatment[]>([]); // State for localized treatments
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(true); // Loading state for treatments

  // Fetch localized treatments on mount
  useEffect(() => {
    const fetchTreatments = async () => {
      setIsLoadingTreatments(true);
      try {
        const treatments = await getLocalizedTreatments();
        setLocalizedTreatments(treatments);
      } catch (err) {
        console.error("Failed to load localized treatments:", err);
        // Optionally set an error state
      } finally {
        setIsLoadingTreatments(false);
      }
    };
    fetchTreatments();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Determine the primary image URI to display
  const displayImageUri = imageUri || beforeImage || '';

  // Format the base64 image with proper prefix if needed
  const getFormattedImageUri = (base64String: string) => {
    if (!base64String) {
      console.error('Empty image URI received in ReportScreen');
      return '';
    }

    // If it already has a data URI prefix or is a file URI, return as is
    if (base64String.startsWith('data:image') || base64String.startsWith('file://')) {
      return base64String;
    }

    // Detect image type from base64 prefix
    let mimeType = 'image/jpeg'; // default
    if (base64String.startsWith('/9j/')) {
      mimeType = 'image/jpeg';
    } else if (base64String.startsWith('iVBORw0KGgo')) {
      mimeType = 'image/png';
    }

    // Add the appropriate data URI prefix
    return `data:${mimeType};base64,${base64String}`;
  };

  // Add debug logging
  console.log('ReportScreen - displayImageUri:', displayImageUri?.substring(0, 50) + '...');
  const formattedImageUri = getFormattedImageUri(displayImageUri);
  console.log('ReportScreen - formatted image URI prefix:', formattedImageUri.substring(0, 50) + '...');

  // --- Logic for Treatment Report (Existing) ---
  // Use localizedTreatments state instead of static TREATMENTS
  const selectedTreatments = treatmentIds
    .map(id => localizedTreatments.find(t => t.id === id))
    .filter((t): t is Treatment => t !== undefined); // Type guard for filtering
  const totalPrice = selectedTreatments.reduce((sum, treatment) => sum + (treatment?.price || 0), 0);
  // --- End of Treatment Report Logic ---

  const handleImageError = () => {
    console.error('Failed to load image. Original:', beforeImage?.substring(0, 50));
    console.error('Failed to load image. Formatted:', formattedImageUri.substring(0, 50));
    setImageError(true);
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    try {
      setGenerating(true);
      // In a real app, this would generate a PDF and share it
      // For MVP, we'll just share a text summary

      const treatmentsList = selectedTreatments.map(t => `- ${t.name}: $${t.price}`).join('\n');
      const totalPrice = selectedTreatments.reduce((sum, item) => sum + (item.price || 0), 0);
      
      const getReportTitle = () => {
        if (analysisType === 'eye') return t('eyeAnalysisReport');
        if (analysisType === 'hairScalp') return t('hairScalpAnalysisReport');
        if (analysisType === 'beforeAfter') return t('beforeAfterAnalysisReport');
        if (analysisType === 'fullFace') return t('facialAnalysisReport');
        return t('treatmentReport');
      };
      
      const reportTitle = getReportTitle();
      
      const message = `\nAIBeautyLens ${reportTitle}\n${t('date')} ${formatDate()}\n\n${t('selectedTreatments')}\n${treatmentsList}\n\n${t('total')} $${totalPrice}\n\n*${t('disclaimer')}\n`;

      await Share.share({
        message,
        title: `AIBeautyLens ${reportTitle}`,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartOver = () => {
    navigation.popToTop();
  };

  // --- Navigation Handlers for Eye Report Buttons ---
  const handleViewDetailedEyeReport = () => {
    if (eyeAnalysisResult) {
      navigation.navigate('EyeAnalysis', {
        imageUri: displayImageUri,
        base64Image: '', // Assuming EyeAnalysisScreen doesn't need base64 directly
        eyeAnalysisResult: eyeAnalysisResult,
        visitPurpose: visitPurpose || '',
        appointmentLength: appointmentLength !== undefined ? String(appointmentLength) : '',
      });
    }
  };

  const handleViewEyeSkincare = () => {
    if (eyeAnalysisResult?.skincareRecommendations) {
      setEyeSkincareModalVisible(true); // Open the modal
    } else {
      Alert.alert(t('error'), t('noRecommendationsAvailable')); // Or a more specific eye message
    }
  };

  const handleViewEyeTreatments = () => {
    if (eyeAnalysisResult) {
      navigation.navigate('EyeTreatments', {
        eyeAnalysisResult: eyeAnalysisResult,
        imageUri: displayImageUri, // Pass image if needed by EyeTreatmentsScreen
        visitPurpose: visitPurpose || '',
        appointmentLength: appointmentLength !== undefined ? String(appointmentLength) : '',
      });
    } else {
       Alert.alert(t('error'), t('noAnalysisDataAvailable')); // Add new i18n key if needed
    }
  };
  // --- End of Navigation Handlers ---

  // Handler for the haircare button
  const handleViewHaircare = async () => {
    if (hairScalpAnalysisResult) {
      try {
        setIsLoadingHaircare(true);
        
        // getHaircareRecommendations handles both cases:
        // 1. When haircareRecommendations exist in the original analysis result
        // 2. When they don't, it creates fallback recommendations from the existing analysis
        // It doesn't make a new Gemini API call either way
        const recommendations = await getHaircareRecommendations(hairScalpAnalysisResult, currentLanguage);
        setHaircareRecommendations(recommendations);
        setHaircareModalVisible(true);
      } catch (error: any) {
        console.error('Error fetching haircare recommendations:', error);
        Alert.alert(t('error'), error?.message || t('noRecommendationsAvailable'));
      } finally {
        setIsLoadingHaircare(false);
      }
    } else {
      Alert.alert(t('error'), t('noAnalysisDataAvailable'));
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          {/* Conditional Title */}
          <Text style={styles.title}>
            {analysisType === 'eye' 
              ? t('eyeAnalysisReport') 
              : analysisType === 'hairScalp'
                ? t('hairScalpAnalysisReport')
                : analysisType === 'beforeAfter'
                  ? t('beforeAfterAnalysisReport')
                  : analysisType === 'fullFace'
                    ? t('facialAnalysisReport')
                    : t('treatmentReport')
            }
          </Text>
          <Text style={styles.date}>{t('date')} {formatDate()}</Text>
        </View>

        <View style={styles.imageContainer}>
          {formattedImageUri ? (
            <Image
              source={{ uri: formattedImageUri }}
              style={styles.image}
              resizeMode="contain"
              onError={handleImageError}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>
                {t('noImageAvailable')}
              </Text>
            </View>
          )}
          {imageError && (
            <Text style={styles.imageErrorText}>
              {t('failedToLoadImage')}
            </Text>
          )}
        </View>

        {/* --- Conditional Content Area --- */}
        {analysisType === 'hairScalp' && hairScalpAnalysisResult ? (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>{t('hairScalpAnalysis')}</Text>
            <Text style={styles.summaryText}>{hairScalpAnalysisResult.overallCondition}</Text>
            <Text style={styles.summaryText}>{t('assessmentDate')}: {hairScalpAnalysisResult.assessmentDate}</Text>
            <Text style={styles.summaryText}>{t('hairLossPattern')}: {hairScalpAnalysisResult.hairLossPattern}</Text>
            <Text style={styles.summaryText}>{t('hairQuality')}: {hairScalpAnalysisResult.hairQuality}</Text>
            <Text style={styles.summaryText}>{t('scalpCondition')}: {hairScalpAnalysisResult.scalpCondition}</Text>
            <Text style={styles.summaryText}>{t('preliminaryDiagnosis')}: {hairScalpAnalysisResult.preliminaryDiagnosis}</Text>
          </View>
        ) : analysisType === 'eye' && eyeAnalysisResult ? (
          // --- Eye Analysis Summary ---
          <View style={styles.summaryContainer}>
             <Text style={styles.sectionTitle}>{t('eyeAnalysisSummaryTitle')}</Text>
             {/* Display Top Concerns */}
             {eyeAnalysisResult.eyeFeatures?.slice(0, 3).map((feature: any, index: number) => (
               <View key={index} style={styles.featureRow}>
                 <Text style={styles.featureName}>{feature.description}</Text>
                 {/* Basic Severity Dots - Consider using FeatureSeverityRating component if available */}
                 <View style={styles.severityDots}>
                   {[...Array(5)].map((_, i) => (
                     <View key={i} style={[styles.severityDot, i < feature.severity ? styles.severityDotActive : styles.severityDotInactive]} />
                   ))}
                 </View>
                 <Text style={styles.severityScore}>{feature.severity}/5</Text>
               </View>
             ))}
             <Text style={styles.summaryText}>{eyeAnalysisResult.overallCondition}</Text>
             {/* Add warning if eye health concerns were noted */}
             {eyeAnalysisResult.eyeHealthConcerns && eyeAnalysisResult.eyeHealthConcerns.length > 0 && (
               <Text style={styles.healthWarningText}>{t('eyeHealthWarningNote')}</Text> // Add new i18n key
             )}
          </View>
        ) : (
          // --- Treatment Summary (Existing) ---
          <View style={styles.treatmentsContainer}>
            <Text style={styles.sectionTitle}>{t('recommendedTreatments')}</Text>
            {isLoadingTreatments ? (
              <Text style={styles.loadingText}>{t('loading')}...</Text> // Show loading indicator
            ) : selectedTreatments.length > 0 ? selectedTreatments.map(treatment => (
              <View key={treatment.id} style={styles.treatmentItem}>
                <Text style={styles.treatmentName}>{treatment.name}</Text>
                <Text style={styles.treatmentArea}>{t('area')} {treatment?.area}</Text>
                <Text style={styles.treatmentDescription}>{treatment?.description}</Text>
                <Text style={styles.treatmentPrice}>${treatment?.price}</Text>
              </View>
            )) : <Text style={styles.noTreatmentsText}>{t('noTreatmentsSelected')}</Text>}
            {selectedTreatments.length > 0 && (
               <View style={styles.totalContainer}>
                 <Text style={styles.totalLabel}>{t('totalEstimatedCost')}</Text>
                 <Text style={styles.totalPrice}>${totalPrice}</Text>
               </View>
            )}
          </View>
        )}
        {/* --- End Conditional Content Area --- */}

        {/* --- Conditional Buttons --- */}
        <View style={styles.buttonsContainer}>
          {analysisType === 'hairScalp' && hairScalpAnalysisResult ? (
            <>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.halfButton, styles.primaryButton]}
                  onPress={() => navigation.navigate('HairScalpAnalysis', {
                    imageUris: imageUris || [],
                    hairScalpAnalysisResult,
                  })}
                >
                  <Text style={styles.buttonText}>{t('viewDetailedReport')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.halfButton, styles.secondaryPurpleButton]}
                  onPress={handleViewHaircare}
                  disabled={isLoadingHaircare}
                >
                  <Text style={styles.secondaryPurpleButtonText}>
                    {isLoadingHaircare ? t('loading') : t('viewHaircare')}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => navigation.navigate('HairTreatments', {
                  hairScalpAnalysisResult,
                  imageUris: imageUris || []
                })}
              >
                <Text style={styles.buttonText}>{t('viewHairTreatments')}</Text>
              </TouchableOpacity>
            </>
          ) : analysisType === 'eye' ? (
            <>
              {/* Row for first two buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.halfButton, styles.primaryButton]} // Use halfButton style
                  onPress={handleViewDetailedEyeReport}
                >
                  <Text style={styles.buttonText}>{t('viewDetailedEyeReport')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.halfButton, styles.secondaryPurpleButton]} // Use halfButton and new purple style
                  onPress={handleViewEyeSkincare}
                >
                  <Text style={styles.secondaryPurpleButtonText}>{t('viewEyeSkincare')}</Text>
                </TouchableOpacity>
              </View>
              {/* Full width button below */}
               <TouchableOpacity
                style={[styles.button, styles.primaryButton]} // Full width primary button
                onPress={handleViewEyeTreatments}
              >
                <Text style={styles.buttonText}>{t('viewEyeTreatments')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Existing Treatment Report Buttons */}
              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={handleShare}
                disabled={generating}
              >
                <Text style={styles.buttonText}>
                  {generating ? t('generating') : t('shareReport')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.startOverButton]}
                onPress={handleStartOver}
              >
                <Text style={styles.startOverButtonText}>{t('startOver')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Disclaimer moved to bottom */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerTitle}>{t('importantInformation')}</Text>
          <Text style={styles.disclaimerText}>
            {t('disclaimer')}
          </Text>
        </View>
      </ScrollView>

      {/* Render the Hair Skincare Modal */}
      {haircareRecommendations && (
        <HaircareAdviceModal
          visible={isHaircareModalVisible}
          onClose={() => setHaircareModalVisible(false)}
          recommendations={haircareRecommendations.recommendations}
          overallRecommendation={haircareRecommendations.overallRecommendation}
          careRoutine={haircareRecommendations.careRoutine}
          notes={haircareRecommendations.notes}
        />
      )}

      {/* Render the Eye Skincare Modal */}
      {eyeAnalysisResult?.skincareRecommendations && (
        <EyeSkincareAdviceModal
          visible={isEyeSkincareModalVisible}
          onClose={() => setEyeSkincareModalVisible(false)}
          recommendations={eyeAnalysisResult.skincareRecommendations}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    minHeight: 320,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  summaryContainer: { // Style for eye analysis summary
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryText: { // Style for eye analysis summary text
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
// Styles for Eye Analysis Summary Features
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  featureName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  severityDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  severityDotActive: {
    backgroundColor: COLORS.warning.main, // Or another appropriate color
  },
  severityDotInactive: {
    backgroundColor: COLORS.gray[300],
  },
  severityScore: {
    fontSize: 14,
    color: '#666',
    minWidth: 30, // Ensure alignment
    textAlign: 'right',
 },
 loadingText: { // Style for loading indicator
   textAlign: 'center',
   paddingVertical: SPACING.lg,
   color: COLORS.text.secondary,
   fontSize: 16,
 },
 noTreatmentsText: { // Style for when no treatments are selected
     textAlign: 'center',
     color: '#666',
     marginTop: 10,
     marginBottom: 10,
     fontStyle: 'italic',
  },
  healthWarningText: { // Style for the warning note on the report summary
    fontSize: 13,
    color: COLORS.warning.dark, // Use warning color
    marginTop: SPACING.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  treatmentsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  treatmentItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  treatmentArea: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    lineHeight: 20,
  },
  treatmentPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4361ee',
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  disclaimerContainer: {
    backgroundColor: '#fff8e1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd54f',
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 12,
    letterSpacing: 0.25,
  },
  disclaimerText: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  buttonsContainer: {
    padding: 16,
    gap: 12,
  },
  buttonRow: { // Container for side-by-side buttons
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, // Add gap between buttons in the row
    marginBottom: 12, // Add space below the row
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  halfButton: { // Style for buttons taking half width
    flex: 1, // Make buttons share space equally
  },
  primaryButton: { // Style for primary action buttons (like View Detailed Report)
    backgroundColor: '#4361ee', // Match shareButton
  },
  secondaryButton: { // Style for secondary action buttons
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryPurpleButton: { // Style for the purple secondary button
    backgroundColor: '#EDE7F6', // Light purple background
    borderWidth: 1,
    borderColor: '#7E57C2', // Purple border
  },
  secondaryPurpleButtonText: { // Style for text in purple secondary button
     color: '#5E35B1', // Darker purple text
     fontSize: 16,
     fontWeight: '600',
  },
  secondaryButtonText: { // Style for text in standard secondary buttons
     color: '#333',
     fontSize: 16,
     fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#4361ee',
  },
  startOverButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  startOverButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  imageErrorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ReportScreen;

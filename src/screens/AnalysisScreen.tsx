import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Linking, Platform, TextInput } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import { AnalysisResult } from '../types';
import { analyzeFacialImage } from '../services/geminiService';
import GenderConfidenceDisplay from '../components/GenderConfidenceDisplay';
import FeatureSeverityRating from '../components/FeatureSeverityRating';
import SkinMatrixHeader from '../components/SkinMatrixHeader';
import AILogoIcon from '../components/AILogoIcon';
import ProcessingIndicator from '../components/ProcessingIndicator';
import Button from '../components/Button';
import Card from '../components/Card';
import ShowDiagnosisButton from '../components/ShowDiagnosisButton';
import ShowSkincareButton from '../components/ShowSkincareButton';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { TREATMENTS } from '../constants/treatments';

type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;

type Props = {
  route: AnalysisScreenRouteProp;
  navigation: AnalysisScreenNavigationProp;
};

const AnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUri, base64Image, visitPurpose: routeVisitPurpose, appointmentLength } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [isIpadError, setIsIpadError] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [visitPurpose, setVisitPurpose] = useState<string>(routeVisitPurpose || '');
  const isIPad = Platform.OS === 'ios' && Platform.isPad;

  // Replace SKIN_CONCERNS and toggleConcern with update function for visitPurpose
  const updateVisitPurpose = (text: string) => {
    setVisitPurpose(text);
  };

  useEffect(() => {
    // Set up navigation options
    navigation.setOptions({
      headerStyle: {
        backgroundColor: COLORS.primary.main,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: COLORS.white,
      headerTitle: 'ClinicalLens™ Analysis',
      headerTitleStyle: {
        fontWeight: '600',
      },
    });

    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsQuotaError(false);
      setIsIpadError(false);
      const result = await analyzeFacialImage(base64Image, visitPurpose, appointmentLength);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error in analysis:', error);
      if (error instanceof Error) {
        if (error.message.includes('API_QUOTA_EXCEEDED')) {
          setIsQuotaError(true);
          setError('You have reached your API quota limit.');
        } else if (isIPad && (
          error.message.includes('iPad') ||
          error.message.includes('timeout') ||
          error.message.includes('large') ||
          error.message.includes('too large') ||
          error.message.includes('reduce'))) {
          setIsIpadError(true);
          setError(error.message);
        } else {
          setError('Failed to analyze image. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigate to the new RecommendedTreatmentsScreen
  const handleNext = () => {
    if (analysisResult) {
      // Map Gemini treatment IDs to match our TREATMENTS array IDs
      const mapTreatmentId = (geminiId: string): string => {
        // Create a comprehensive mapping table for all potential mismatches
        const treatmentIdMap: Record<string, string> = {
          // Common spelling/formatting differences
          'hydrofacial': 'hydrafacial',
          'pico-laser': 'picoway',
          'ha-filler': 'dermal-facial-fillers',
          'botulinum-toxin': 'botox',
          'botulinum': 'botox',
          'fractional-laser': 'fotona-deep',
          'prp': 'prp-facial',
          'tempsure': 'thermage',
          'tempsure-rf': 'thermage',
          'microneedling': 'beauty-booster',
          'chemical': 'chemical-peel',
          'chemical-peel': 'chemical-peel',
          'led-therapy': 'm22-stellar',
          'ipl': 'm22-stellar',
          'lip-filler': 'dermal-lip-fillers',
          'laser-hair-removal': 'splendor-x',
          'fat-dissolution': 'belkyra',
          'aqua-needle': 'skin-booster',
        };
        
        // Try direct mapping first
        if (treatmentIdMap[geminiId]) {
          return treatmentIdMap[geminiId];
        }
        
        // If no direct match, try case-insensitive partial matching
        const normalizedGeminiId = geminiId.toLowerCase().replace(/[-_\s]/g, '');
        
        // Check if any treatment ID in our TREATMENTS array is similar
        const matchingTreatment = TREATMENTS.find(treatment => {
          const normalizedId = treatment.id.toLowerCase().replace(/[-_\s]/g, '');
          return normalizedId.includes(normalizedGeminiId) || normalizedGeminiId.includes(normalizedId);
        });
        
        return matchingTreatment ? matchingTreatment.id : geminiId;
      };

      // Extract recommended treatments and reasons from analysis result with ID mapping
      const recommendedTreatments = analysisResult.recommendations
        .map(rec => mapTreatmentId(rec.treatmentId))
        .filter(id => TREATMENTS.some(t => t.id === id)); // Filter out any IDs that still don't exist
      
      // Create a reasons object mapping treatmentId to reason (with ID mapping)
      const reasons: { [key: string]: string[] } = {};
      analysisResult.recommendations.forEach(rec => {
        const mappedId = mapTreatmentId(rec.treatmentId);
        // Only add reasons for treatments that exist in our TREATMENTS array
        if (TREATMENTS.some(t => t.id === mappedId)) {
          if (!reasons[mappedId]) {
            reasons[mappedId] = [];
          }
          reasons[mappedId].push(rec.reason);
        }
      });

      navigation.navigate('RecommendedTreatments', {
        imageUri,
        base64Image,
        recommendedTreatments,
        reasons,
        visitPurpose,
        appointmentLength,
      });
    }
  };

  const renderErrorContent = () => {
    if (isQuotaError) {
      return (
        <Card variant="elevated" style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <MaterialIcons name="error-outline" size={40} color={COLORS.error.main} />
            <Text style={styles.errorTitle}>Analysis Temporarily Unavailable</Text>
            <Text style={styles.errorText}>
              Our facial analysis service is currently unavailable due to high demand.
              {isIPad ? " iPad devices may experience additional limitations with this service." : ""}
              Your skin health is important to us, and we apologize for the inconvenience.
            </Text>
            <View style={styles.quotaErrorActions}>
              <Button
                title="Try Again Later"
                icon="schedule"
                onPress={analyzeImage}
                variant="outline"
                style={styles.actionButton}
              />
              {isIPad ? (
                <Button
                  title="Try Different Device"
                  icon="devices"
                  onPress={() => navigation.goBack()}
                  variant="primary"
                  style={styles.actionButton}
                />
              ) : (
                <Button
                  title="Contact Clinic"
                  icon="call"
                  onPress={() => Linking.openURL('tel:+15551234567')}
                  variant="primary"
                  style={styles.actionButton}
                />
              )}
            </View>
          </View>
        </Card>
      );
    }

    if (isIpadError) {
      return (
        <Card variant="elevated" style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <MaterialIcons name="tablet-mac" size={40} color={COLORS.warning.main} />
            <Text style={styles.errorTitle}>iPad Compatibility Issue</Text>
            <Text style={styles.errorText}>
              {error || "We've encountered an issue processing your request on iPad. This might be due to image size or API limitations on tablet devices."}
            </Text>
            <View style={styles.tipSection}>
              <Text style={styles.tipTitle}>Try these solutions:</Text>
              <View style={styles.tipItem}>
                <MaterialIcons name="photo-size-select-small" size={18} color={COLORS.info.main} />
                <Text style={styles.tipText}>Take a photo with less background - focus closer on the face</Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="wb-sunny" size={18} color={COLORS.info.main} />
                <Text style={styles.tipText}>Ensure good lighting conditions</Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="smartphone" size={18} color={COLORS.info.main} />
                <Text style={styles.tipText}>Use a phone instead of an iPad if available</Text>
              </View>
            </View>
            <View style={styles.quotaErrorActions}>
              <Button
                title="Try Again"
                icon="refresh"
                onPress={analyzeImage}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Take New Photo"
                icon="photo-camera"
                onPress={() => navigation.navigate('Camera')}
                variant="primary"
                style={styles.actionButton}
              />
            </View>
          </View>
        </Card>
      );
    }

    return (
      <Card variant="elevated" style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <MaterialIcons name="error-outline" size={40} color={COLORS.error.main} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry Analysis"
            icon="refresh"
            onPress={analyzeImage}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      </Card>
    );
  };

  // Display the visit purpose and appointment length as read-only information
  const renderVisitInfoSection = () => {
    if (!visitPurpose && !appointmentLength) return null;

    return (
      <Card
        variant="elevated"
        style={styles.visitPurposeCard}
        title="Visit Information"
        subtitle="Details for this consultation"
        icon="assignment"
      >
        <View style={styles.visitInfoContainer}>
          {visitPurpose ? (
            <View style={styles.visitInfoItem}>
              <Text style={styles.visitInfoLabel}>Purpose of Visit:</Text>
              <Text style={styles.visitInfoValue}>{visitPurpose}</Text>
            </View>
          ) : null}

          {appointmentLength ? (
            <View style={styles.visitInfoItem}>
              <Text style={styles.visitInfoLabel}>Appointment Length:</Text>
              <Text style={styles.visitInfoValue}>{appointmentLength}</Text>
            </View>
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {error ? (
          renderErrorContent()
        ) : analysisResult ? (
          <>
            <Card variant="elevated" style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  style={styles.imageGradient}
                />
                <View style={styles.badgeContainer}>
                  <View style={styles.premiumBadge}>
                    <MaterialIcons name="verified" size={14} color={COLORS.gold.main} style={styles.badgeIcon} />
                    <Text style={styles.badgeText}>AI-Enhanced</Text>
                  </View>
                </View>
              </View>
            </Card>

            <Card variant="elevated" style={styles.resultCard}>
              <SkinMatrixHeader
                title="SkinMatrix™ Analysis Results"
                subtitle="Powered by AesthetiScan™ technology"
                icon={<AILogoIcon size="small" />}
              />
              <View style={styles.resultContent}>
                <View style={styles.resultRow}>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Estimated Age</Text>
                    <Text style={styles.resultValue}>{analysisResult.estimatedAge}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Skin Type</Text>
                    <Text style={styles.resultValue}>{analysisResult.skinType}</Text>
                  </View>
                </View>

                <View style={styles.genderContainer}>
                  <Text style={styles.resultLabel}>Gender</Text>
                  <View style={styles.genderRow}>
                    <GenderConfidenceDisplay
                      gender={analysisResult.gender}
                      confidence={analysisResult.genderConfidence}
                      size="medium"
                    />
                  </View>
                </View>
              </View>
            </Card>

            <Card variant="elevated" style={styles.featuresCard}>
              <View style={styles.featureHeaderContainer}>
                <AILogoIcon size="medium" style={styles.featureHeaderLogo} />
                <View style={styles.featureHeaderTextContainer}>
                  <Text style={styles.featureHeaderTitle}>Facial Feature Analysis</Text>
                  <Text style={styles.featureHeaderSubtitle}>Professional-grade skin analysis in your pocket</Text>
                </View>
                <TouchableOpacity style={styles.infoButton}>
                  <MaterialIcons name="info-outline" size={24} color={COLORS.primary.main} />
                </TouchableOpacity>
              </View>
              <View style={styles.featuresContent}>
                {analysisResult.features.map((feature, index) => {
                  // Extract location if present in the description
                  const locationMatch = feature.description.match(/on ([\w\s]+)/i);
                  const location = locationMatch ? locationMatch[1] : '';

                  // Clean up the description to get just the condition name
                  let conditionName = feature.description;
                  if (location) {
                    conditionName = feature.description.replace(`on ${location}`, '').trim();
                  }

                  return (
                    <View key={index} style={styles.featureItem}>
                      <View style={styles.featureInfo}>
                        <Text style={styles.featureText}>{conditionName}</Text>
                        {location && (
                          <Text style={styles.featureLocation}>on {location}</Text>
                        )}
                      </View>
                      <View style={styles.featureRatingContainer}>
                        <FeatureSeverityRating
                          severity={feature.severity}
                          maxSeverity={5}
                          colorScheme="inverted"
                          size="medium"
                          showText={true}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>

            {renderVisitInfoSection()}

            <View style={styles.buttonContainer}>
              <View style={styles.reportButtonsRow}>
                <ShowDiagnosisButton style={styles.reportButton} analysisResult={analysisResult} />
                <ShowSkincareButton style={styles.reportButton} analysisResult={analysisResult} />
              </View>
              <Button
                title="View Treatment Plan"
                icon="healing"
                onPress={handleNext}
                variant="primary"
                style={styles.nextButton}
              />
            </View>

            <View style={styles.footnoteContainer}>
              <Text style={styles.footnote}>
                Analysis performed with DermaPrecision™ Technology, trained on data from thousands of clinical assessments.
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      {loading && (
        <ProcessingIndicator
          isAnalyzing={true}
          processingText="Your skin is being analyzed with our HydraDerm™ Multi-Spectrum Technology..."
          showDetailedSteps={true}
          showTechStack={true}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 0,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: BORDER_RADIUS.lg,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  badgeContainer: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    zIndex: 2,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
  },
  badgeIcon: {
    marginRight: SPACING.xs,
  },
  badgeText: {
    color: COLORS.gold.main,
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    marginVertical: SPACING.xl,
  },
  errorContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.error.main,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error.main,
    marginVertical: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.md,
  },
  resultContainer: {
    marginTop: SPACING.md,
  },
  analysisCard: {
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  featuresCard: {
    marginBottom: SPACING.md,
  },
  featuresContent: {
    padding: SPACING.md,
  },
  featureHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  featureHeaderLogo: {
    marginRight: SPACING.md,
  },
  featureHeaderTextContainer: {
    flex: 1,
  },
  featureHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  featureHeaderSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  featureRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'flex-end',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  severityText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary.dark,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  insightText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontStyle: 'italic',
  },
  nextButton: {
    marginBottom: SPACING.sm,
  },
  quotaErrorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  resultCard: {
    marginBottom: SPACING.md,
  },
  resultContent: {
    padding: SPACING.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginRight: SPACING.md,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  genderContainer: {
    marginBottom: SPACING.md,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginRight: SPACING.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  featureLocation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  severityFraction: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  footnoteContainer: {
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  footnote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginRight: 4,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  confidenceIcon: {
    marginRight: 2,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  tipSection: {
    marginBottom: SPACING.md,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  visitPurposeCard: {
    marginBottom: SPACING.md,
  },
  visitInfoContainer: {
    padding: SPACING.md,
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
  visitInfoValue: {
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.paper,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  buttonContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reportButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  reportButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  diagnosisButton: {
    marginBottom: SPACING.md,
  },
});

export default AnalysisScreen;
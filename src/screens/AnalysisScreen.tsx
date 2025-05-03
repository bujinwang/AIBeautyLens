import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Linking, Platform, TextInput, Dimensions, ViewStyle, StyleProp, TextStyle, ViewProps, TextProps } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons, Feather } from '@expo/vector-icons';
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
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { TREATMENTS } from '../constants/treatments';
import { useLocalization } from '../i18n/localizationContext';

type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;

type Props = {
  route: AnalysisScreenRouteProp;
  navigation: AnalysisScreenNavigationProp;
};

const AnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useLocalization();
  const { imageUri, base64Image = '', visitPurpose: routeVisitPurpose, appointmentLength } = route.params;
  const [loading, setLoading] = useState(true);

  // Log loading state changes
  useEffect(() => {
    console.log(`AnalysisScreen: Loading state changed to: ${loading}`);
  }, [loading]);

  const [error, setError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [isIpadError, setIsIpadError] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [visitPurpose, setVisitPurpose] = useState<string>(routeVisitPurpose || '');
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const isIPad = Platform.OS === 'ios' && Platform.isPad;
  const isLargeScreen = SCREEN_WIDTH >= 768; // iPad mini width is 768pt

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
      headerTitle: t('clinicalLensAnalysis'),
      headerTitleStyle: {
        fontWeight: '600',
      },
    });

    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      // Ensure loading is true at the start
      if (!loading) {
        console.log('AnalysisScreen: Setting loading to true for analyzeImage');
        setLoading(true);
      }
      setError(null);
      setIsQuotaError(false);
      setIsIpadError(false);
      const result = await analyzeFacialImage(imageUri, visitPurpose, appointmentLength);
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
      console.log('AnalysisScreen: Setting loading to false in finally block');
      setLoading(false);
    }
  };

  // Navigate to the new ReportScreen
  const handleReport = () => {
    navigation.navigate('Report', {
      treatmentIds: analysisResult?.recommendations.map(rec => rec.treatmentId) || [],
      beforeImage: imageUri,
    });
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
            <Text style={styles.errorTitle}>{t('analysisUnavailable')}</Text>
            <Text style={styles.errorText}>
              {t('highDemandMessage')}
              {isIPad ? t('ipadLimitation') : ""}
              {t('skinHealthImportant')}
            </Text>
            <View style={styles.quotaErrorActions}>
              <Button
                title={t('tryAgainLater')}
                icon="schedule"
                onPress={analyzeImage}
                variant="outline"
                style={styles.actionButton}
              />
              {isIPad ? (
                <Button
                  title={t('tryDifferentDevice')}
                  icon="devices"
                  onPress={() => navigation.goBack()}
                  variant="primary"
                  style={styles.actionButton}
                />
              ) : (
                <Button
                  title={t('contactClinic')}
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
            <Text style={styles.errorTitle}>{t('ipadCompatibilityIssue')}</Text>
            <Text style={styles.errorText}>
              {error || "We've encountered an issue processing your request on iPad. This might be due to image size or API limitations on tablet devices."}
            </Text>
            <View style={styles.tipSection}>
              <Text style={styles.tipTitle}>{t('trySolutions')}</Text>
              <View style={styles.tipItem}>
                <MaterialIcons name="photo-size-select-small" size={18} color={COLORS.info.main} />
                <Text style={styles.tipText}>{t('lessFaceBackground')}</Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="wb-sunny" size={18} color={COLORS.info.main} />
                <Text style={styles.tipText}>{t('goodLighting')}</Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="smartphone" size={18} color={COLORS.info.main} />
                <Text style={styles.tipText}>{t('usePhone')}</Text>
              </View>
            </View>
            <View style={styles.quotaErrorActions}>
              <Button
                title={t('tryAgain')}
                icon="refresh"
                onPress={analyzeImage}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title={t('takeNewPhoto')}
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
            title={t('retryAnalysis')}
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
        title={t('visitInformation')}
        subtitle={t('detailsForConsultation')}
        icon="assignment"
      >
        <View style={styles.visitInfoContainer}>
          {visitPurpose ? (
            <View style={styles.visitInfoItem}>
              <Text style={styles.visitInfoLabel}>{t('purposeOfVisitLabel')}</Text>
              <Text style={styles.visitInfoValue}>{visitPurpose}</Text>
            </View>
          ) : null}

          {appointmentLength ? (
            <View style={styles.visitInfoItem}>
              <Text style={styles.visitInfoLabel}>{t('appointmentLengthLabel')}</Text>
              <Text style={styles.visitInfoValue}>{appointmentLength}</Text>
            </View>
          ) : null}
        </View>
      </Card>
    );
  };

  // Helper function for gender confidence level
  const getConfidenceLevel = (confidence: number): string => {
    if (confidence >= 90) return t('highConfidence'); // Assuming 'highConfidence' key exists
    if (confidence >= 70) return t('mediumConfidence'); // Assuming 'mediumConfidence' key exists
    return t('lowConfidence'); // Assuming 'lowConfidence' key exists
  };

  return (
    <>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && styles.scrollContentLarge
        ]}
      >
        {error ? (
          renderErrorContent()
        ) : analysisResult ? (
          <>
            <View style={[
              styles.contentWrapper,
              isLargeScreen && styles.contentWrapperLarge
            ] as StyleProp<ViewStyle>}>
              <View style={[
                styles.imageWrapper,
                isLargeScreen ? styles.imageWrapperLarge : null
              ]}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.badgeContainer}>
                  <Feather name="check-circle" size={16} color={COLORS.success.main} style={styles.badgeIcon} />
                  <Text style={styles.badgeText}>{t('aiEnhanced')}</Text>
                </View>
              </View>

              <View style={[
                styles.resultsWrapper,
                isLargeScreen ? styles.resultsWrapperLarge : null
              ]}>
                <Card
                  variant="elevated"
                  style={{
                    ...styles.resultCard,
                    ...(isLargeScreen ? styles.resultCardLarge : {}),
                  }}
                >
                  <View style={styles.skinMatrixHeader}>
                    <AILogoIcon size="medium" />
                    <View style={styles.skinMatrixTitleContainer}>
                      <Text style={styles.skinMatrixTitle}>{t('skinMatrixResults')}</Text>
                      <Text style={styles.skinMatrixSubtitle}>{t('poweredByAesthetiScan')}</Text>
                    </View>
                    <AILogoIcon size="medium" />
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.resultContent}>
                    <View style={styles.resultRow}>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>{t('estimatedAge')}</Text>
                        <Text style={styles.resultValue}>{analysisResult.estimatedAge}</Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>{t('skinType')}</Text>
                        <Text style={[styles.resultValue, styles.resultValueBold]}>{analysisResult.skinType}</Text>
                      </View>
                    </View>

                    <View style={styles.genderContainer}>
                      <Text style={styles.resultLabel}>{t('gender')}</Text>
                      <View style={styles.genderValueContainer}>
                        <Text style={styles.genderValueText}>{analysisResult.gender}</Text>
                        <View style={styles.genderConfidenceContainer}>
                           <View style={[styles.confidenceDot, { backgroundColor: COLORS.success.main }]} />
                          <Text style={styles.genderConfidenceText}>
                            {analysisResult.genderConfidence}% ({getConfidenceLevel(analysisResult.genderConfidence)})
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card>

                <Card 
                  variant="elevated" 
                  style={([
                    styles.featuresCard,
                    isLargeScreen ? styles.featuresCardLarge : null
                  ].filter(Boolean) as import('react-native').StyleProp<import('react-native').ViewStyle>)}
                >
                  <View style={styles.featureHeaderContainer}>
                    <AILogoIcon size="medium" style={styles.featureHeaderLogo} />
                    <View style={styles.featureHeaderTextContainer}>
                      <Text style={styles.featureHeaderTitle}>{t('facialFeatureAnalysis')}</Text>
                      <Text style={styles.featureHeaderSubtitle}>{t('professionalGradeAnalysis')}</Text>
                    </View>
                    <TouchableOpacity style={styles.infoButton}>
                      <MaterialIcons name="info-outline" size={24} color={COLORS.primary.main} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.featuresContent}>
                    {(analysisResult.features
                      ? [...analysisResult.features].sort((a, b) => b.severity - a.severity)
                      : []).map((feature, index) => {
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
              </View>
            </View>

            <View style={[
              styles.buttonContainer,
              isLargeScreen ? styles.buttonContainerLarge : null
            ]}>
              <View style={styles.reportButtonsRow}>
                <ShowDiagnosisButton
                  style={styles.reportButton}
                  analysisResult={analysisResult}
                  imageUri={imageUri}
                />
                <ShowSkincareButton style={styles.reportButton} analysisResult={analysisResult} />
              </View>
              <Button
                title={t('viewTreatmentPlan')}
                icon="healing"
                onPress={handleNext}
                variant="primary"
                style={styles.nextButton}
              />
            </View>

            <View style={[
              styles.footnoteContainer,
              isLargeScreen ? styles.footnoteContainerLarge : null
            ]}>
              <Text style={[
                styles.footnote,
                isLargeScreen ? styles.footnoteLarge : null
              ]}>
                {t('analysisFootnote')}
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      {loading && (
        <ProcessingIndicator
          isAnalyzing={true}
          processingText={t('analyzing')}
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
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  scrollContentLarge: {
    paddingHorizontal: SPACING.xl,
    maxWidth: 1024,
    alignSelf: 'center',
    width: '100%',
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: SPACING.md,
  },
  contentWrapperLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.xl,
    maxWidth: 1024,
    alignSelf: 'center',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    position: 'relative',
    backgroundColor: COLORS.gray[200],
  },
  imageWrapperLarge: {
    width: '48%',
    marginRight: '4%',
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
  },
  badgeIcon: {
    marginRight: SPACING.xs,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  resultsWrapper: {
    width: '100%',
  },
  resultsWrapperLarge: {
    width: '48%',
  },
  resultCard: {
    marginBottom: SPACING.md,
    padding: 0,
  },
  resultCardLarge: {
    marginBottom: SPACING.md,
  },
  skinMatrixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skinMatrixTitleContainer: {
    flex: 1,
    marginHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  skinMatrixTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.h3.fontWeight as TextStyle['fontWeight'],
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  skinMatrixSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  resultContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  resultItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  resultLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs, 
  },
  resultValue: {
    ...TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.h4.fontWeight as TextStyle['fontWeight'],
    color: COLORS.text.primary,
    flexWrap: 'wrap',
  },
  resultValueBold: {
    fontWeight: '600',
  },
  genderContainer: {
    alignItems: 'flex-start',
  },
  genderValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  genderValueText: {
    ...TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.h4.fontWeight as TextStyle['fontWeight'],
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  genderConfidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
   confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  genderConfidenceText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  featuresCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  featuresCardLarge: {
    marginHorizontal: 0,
  },
  featureHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  featureHeaderLogo: {
    marginRight: SPACING.sm,
  },
  featureHeaderTextContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  featureHeaderTitle: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    fontWeight: '600',
    color: COLORS.text.primary,
    flexWrap: 'wrap',
  },
  featureHeaderSubtitle: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    color: COLORS.text.secondary,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  infoButton: {
    padding: SPACING.xs,
  },
  featuresContent: {
    padding: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    flexWrap: 'wrap',
  },
  featureInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  featureText: {
    fontSize: Platform.select({ ios: 16, android: 15 }),
    color: COLORS.text.primary,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  featureLocation: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    color: COLORS.text.secondary,
    flexWrap: 'wrap',
  },
  featureRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'flex-end',
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
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  buttonContainerLarge: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  reportButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  reportButton: {
    flex: 1,
    minWidth: '48%',
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  diagnosisButton: {
    marginBottom: SPACING.md,
  },
  footnoteContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  footnoteContainerLarge: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  footnote: {
    fontSize: Platform.select({ ios: 13, android: 12 }),
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: Platform.select({ ios: 18, android: 16 }),
    flexWrap: 'wrap',
  },
  footnoteLarge: {
    fontSize: Platform.select({ ios: 14, android: 13 }),
    lineHeight: Platform.select({ ios: 20, android: 18 }),
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
  errorContainer: {
    marginVertical: SPACING.xl,
    marginHorizontal: SPACING.md,
    maxWidth: 600,
    width: '90%',
    alignSelf: 'center',
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
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error.dark, // Adjusted color slightly from original if needed
    marginVertical: SPACING.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: SPACING.md,
    minWidth: '60%',
  },
});

export default AnalysisScreen;
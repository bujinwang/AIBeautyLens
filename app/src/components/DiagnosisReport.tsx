import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import SkinMatrixHeader from './SkinMatrixHeader';
import FeatureSeverityRating from './FeatureSeverityRating';
import { AnalysisResult } from '../types';
import { useLocalization } from '../i18n/localizationContext';
import { LinearGradient } from 'expo-linear-gradient';
import ClinicalEvaluationSection from './ClinicalEvaluationSection';

interface DiagnosisReportProps {
  onClose: () => void;
  analysisResult: AnalysisResult;
  imageUri?: string; // Optional patient image URI
}

const DiagnosisReport: React.FC<DiagnosisReportProps> = ({ onClose, analysisResult, imageUri }) => {
  // Get screen dimensions for responsive layout
  const screenWidth = Dimensions.get('window').width;
  const { t } = useLocalization();
  const getTechnologyIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'hyperpigmentation':
      case 'melasma':
        return 'tonality';
      case 'acne':
      case 'breakout':
        return 'face';
      case 'wrinkle':
      case 'fine line':
        return 'waves';
      case 'texture':
      case 'pore':
        return 'grain';
      case 'redness':
      case 'inflammation':
        return 'whatshot';
      case 'dryness':
      case 'dehydration':
        return 'water-drop';
      case 'oil':
      case 'sebum':
        return 'opacity';
      default:
        return 'analytics';
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'active':
      case t('active').toLowerCase():
        return COLORS.error.main;
      case 'healing':
      case t('healing').toLowerCase():
        return COLORS.warning.main;
      case 'chronic':
      case t('chronic').toLowerCase():
        return COLORS.info.main;
      default:
        return COLORS.text.secondary;
    }
  };

  // Function to translate status
  const translateStatus = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active') return t('active');
    if (lowerStatus === 'healing') return t('healing');
    if (lowerStatus === 'chronic') return t('chronic');
    if (lowerStatus === 'mild') return t('mild');
    if (lowerStatus === 'moderate') return t('moderate');
    if (lowerStatus === 'severe') return t('severe');
    return status;
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1:
        return t('immediateAttention');
      case 2:
        return t('highPriority');
      case 3:
        return t('moderatePriority');
      case 4:
        return t('lowPriority');
      case 5:
        return t('maintenance');
      default:
        return t('notSpecified');
    }
  };

  return (
    <View style={styles.container}>
      <SkinMatrixHeader
        title={t('diagnosisReport')}
        subtitle="Powered by HydraDerm™ Multi-Spectrum Technology"
      />

      <ScrollView style={styles.scrollContainer}>
        {/* Overview section with photo on right, profile on left */}
        <View style={styles.topContainer}>
          <View style={styles.topContainerHeader}>
            <MaterialIcons name="person" size={24} color={COLORS.primary.main} />
            <Text style={[TYPOGRAPHY.h5, { color: COLORS.text.primary, marginLeft: SPACING.sm, flexShrink: 1 }]}>
              {t('profileAnalysis')}
            </Text>
          </View>
          <View style={styles.topContainerContent}>
            {/* Left column - Profile Analysis */}
            <View style={styles.leftColumn}>
              <View style={styles.profileSection}>
                <View style={styles.profileGrid}>
                  <View style={styles.profileRow}>
                    <View style={styles.profileItem}>
                      <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginBottom: 4 }]}>{t('estimatedAge')}</Text>
                      <Text style={[TYPOGRAPHY.subtitle1, { color: COLORS.text.primary, marginTop: 2 }]}>{analysisResult.estimatedAge}</Text>
                    </View>
                    <View style={styles.profileItem}>
                      <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginBottom: 4 }]}>{t('skinType')}</Text>
                      <Text style={[TYPOGRAPHY.subtitle1, { color: COLORS.text.primary, marginTop: 2 }]}>{analysisResult.skinType}</Text>
                    </View>
                  </View>
                  <View style={styles.profileRow}>
                    <View style={styles.profileItem}>
                      <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginBottom: 4 }]}>{t('undertone')}</Text>
                      <Text style={[TYPOGRAPHY.subtitle1, { color: COLORS.text.primary, marginTop: 2 }]}>{analysisResult.skinUndertone}</Text>
                    </View>
                    <View style={styles.profileItem}>
                      <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginBottom: 4 }]}>{t('gender')}</Text>
                      <Text style={[TYPOGRAPHY.subtitle1, { color: COLORS.text.primary, marginTop: 2 }]}>
                        {analysisResult.gender}
                        <Text style={[TYPOGRAPHY.caption, { color: COLORS.text.secondary, marginLeft: 4 }]}>
                          {` (${Math.round(analysisResult.genderConfidence * 100)}% ${t('confidence')})`}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Right column - Patient Photo */}
            {imageUri && (
              <View style={styles.photoContainer}>
                <View style={styles.photoWrapper}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.patientPhoto}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={styles.photoGradient}
                  />
                  <View style={styles.photoBadge}>
                    <MaterialIcons name="verified" size={14} color={COLORS.gold.main} />
                    <Text style={styles.photoBadgeText}>AI-Enhanced</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.fullWidthContent}>
          {/* Overall Skin Health - Full width */}
          <View style={styles.overallSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="health-and-safety" size={24} color={COLORS.primary.main} />
              <Text style={[TYPOGRAPHY.h5, { color: COLORS.text.primary, marginBottom: SPACING.sm }]}>
                {t('overallSkinHealth')}
              </Text>
            </View>
            <Text style={styles.overallCondition}>{analysisResult.overallCondition}</Text>
          </View>
          {/* Clinical Assessment - Full width */}
          <View style={styles.analysisSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="assessment" size={24} color={COLORS.primary.main} />
              <Text style={[TYPOGRAPHY.h5, { color: COLORS.text.primary, marginBottom: SPACING.sm }]}>
                {t('clinicalAssessment')}
              </Text>
            </View>

            {[...analysisResult.features]
              .sort((a, b) => b.severity - a.severity)
              .map((item, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureHeader}>
                  <MaterialIcons
                    name={getTechnologyIcon(item.description)}
                    size={20}
                    color={COLORS.primary.main}
                  />
                  <Text style={[TYPOGRAPHY.subtitle1, { color: COLORS.text.primary, marginLeft: SPACING.sm, flex: 1, flexWrap: 'wrap' }]}>
                    {item.description}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{translateStatus(item.status)}</Text>
                  </View>
                </View>

                <View style={styles.featureContent}>
                  <View style={styles.locationContainer}>
                    <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginRight: SPACING.sm, width: 80 }]}>{t('location')}</Text>
                    <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.primary, flex: 1, flexWrap: 'wrap' }]}>{item.location}</Text>
                  </View>

                  <View style={styles.severityContainer}>
                    <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginBottom: SPACING.xs }]}>{t('severityLevel')}</Text>
                    <FeatureSeverityRating
                      severity={item.severity}
                      maxSeverity={5}
                      colorScheme="inverted"
                      size="medium"
                      showText={true}
                      style={styles.severityRating}
                    />
                  </View>

                  <View style={styles.causesContainer}>
                    <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginBottom: SPACING.xs }]}>{t('probableCauses')}</Text>
                    {item.causes.map((cause, causeIndex) => (
                      <Text key={causeIndex} style={[TYPOGRAPHY.body2, { color: COLORS.text.primary, marginLeft: SPACING.md, marginBottom: 2 }]}>• {cause}</Text>
                    ))}
                  </View>

                  <View style={styles.characteristicsContainer}>
                    <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginBottom: SPACING.xs }]}>{t('characteristics')}</Text>
                    {item.characteristics.map((char, charIndex) => (
                      <Text key={charIndex} style={[TYPOGRAPHY.body2, { color: COLORS.text.primary, marginLeft: SPACING.md, marginBottom: 2 }]}>• {char}</Text>
                    ))}
                  </View>

                  <View style={styles.priorityContainer}>
                    <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginRight: SPACING.sm }]}>{t('treatmentPriority')}</Text>
                    <Text style={[TYPOGRAPHY.body2, { fontWeight: '500', color: COLORS.primary.main }]}>{getPriorityLabel(item.priority)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Clinical Evaluation - Full width */}
          <ClinicalEvaluationSection
            analysisType="fullFace"
            sessionId={analysisResult?.id || new Date().toISOString()}
          />

          <View style={styles.disclaimer}>
            <View style={styles.disclaimerHeader}>
              <MaterialIcons name="info" size={20} color={COLORS.primary.main} />
              <Text style={[TYPOGRAPHY.h5, { color: COLORS.text.primary, marginLeft: SPACING.xs }]}>
                {t('analysisInformation')}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.body2, { color: COLORS.text.secondary, marginBottom: SPACING.sm }]}>
              This analysis is generated using our proprietary DermaGraph™ AI technology,
              incorporating HydraDerm™ Multi-Spectrum imaging and BeautyMatrix™ assessment algorithms.
              Results are derived from analysis of over 100,000 clinical cases and validated by board-certified dermatologists.
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: COLORS.text.secondary, marginBottom: SPACING.sm }]}>
              {t('disclaimerNote')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollContainer: {
    flex: 1,
  },
  topContainer: {
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.lg,
    margin: SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  topContainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  topContainerTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.primary.main,
    marginLeft: SPACING.sm,
    flexShrink: 1,
  } as TextStyle,
  topContainerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    flexWrap: 'wrap',
  },
  leftColumn: {
    width: '58%',
    minWidth: 280,
    flexShrink: 1,
  },
  fullWidthContent: {
    padding: SPACING.sm,
    width: '100%',
  },
  profileSection: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginLeft: SPACING.sm,
  },
  profileGrid: {
    width: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  profileItem: {
    width: '48%',
    minWidth: 130,
    backgroundColor: COLORS.gray[50],
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  profileLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 4,
  } as TextStyle,
  profileValue: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
    marginTop: 2,
  } as TextStyle,
  confidenceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  } as TextStyle,
  overallSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info.main,
    width: '100%',
  },
  overallCondition: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
    marginTop: SPACING.sm,
  },
  analysisSection: {
    width: '100%',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginLeft: SPACING.sm,
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.main,
    borderTopRightRadius: BORDER_RADIUS.lg,
    width: '100%',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  featureTitle: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    flex: 1,
    flexWrap: 'wrap',
  } as TextStyle,
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '500',
  },
  featureContent: {
    marginLeft: SPACING.xl,
    width: '95%',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  locationLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
    width: 80,
  },
  locationText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    flex: 1,
    flexWrap: 'wrap',
  },
  severityContainer: {
    marginBottom: SPACING.sm,
  },
  severityLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  severityRating: {
    marginTop: SPACING.xs,
  },
  causesContainer: {
    marginBottom: SPACING.sm,
  },
  causesLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  causeText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
    marginBottom: 2,
  },
  characteristicsContainer: {
    marginBottom: SPACING.sm,
  },
  characteristicsLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  characteristicText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
    marginBottom: 2,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  priorityLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary.main,
  },
  clinicalEvaluation: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.dark,
  },
  evaluationText: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
    marginTop: SPACING.sm,
  },
  disclaimer: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold.main,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginLeft: SPACING.xs,
  },
  disclaimerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  disclaimerNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  // Patient photo styles
  photoContainer: {
    width: '38%', // Right column takes 38% of the width
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  photoWrapper: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
    position: 'relative',
  },
  patientPhoto: {
    width: '100%',
    height: '100%',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  photoBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  visitInfoLabel: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.secondary,
    marginBottom: 4,
  } as TextStyle,
  visitInfoValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.paper,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  } as TextStyle,
  footnote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,
  confidenceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginRight: 4,
  } as TextStyle,
  confidenceValue: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600' as const,
    color: 'white',
  } as TextStyle,
  tipTitle: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  } as TextStyle,
  tipText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
    flex: 1,
  } as TextStyle,
});

export default DiagnosisReport;

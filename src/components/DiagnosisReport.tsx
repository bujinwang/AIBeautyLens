import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import SkinMatrixHeader from './SkinMatrixHeader';
import FeatureSeverityRating from './FeatureSeverityRating';
import { AnalysisResult } from '../types';
import { useLocalization } from '../i18n/localizationContext';
import { LinearGradient } from 'expo-linear-gradient';

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
            <Text style={styles.topContainerTitle}>{t('profileAnalysis')}</Text>
          </View>
          <View style={styles.topContainerContent}>
            {/* Left column - Profile Analysis */}
            <View style={styles.leftColumn}>
              <View style={styles.profileSection}>
                <View style={styles.profileGrid}>
                  <View style={styles.profileRow}>
                    <View style={styles.profileItem}>
                      <Text style={styles.profileLabel}>{t('estimatedAge')}</Text>
                      <Text style={styles.profileValue}>{analysisResult.estimatedAge}</Text>
                    </View>
                    <View style={styles.profileItem}>
                      <Text style={styles.profileLabel}>{t('skinType')}</Text>
                      <Text style={styles.profileValue}>{analysisResult.skinType}</Text>
                    </View>
                  </View>
                  <View style={styles.profileRow}>
                    <View style={styles.profileItem}>
                      <Text style={styles.profileLabel}>{t('undertone')}</Text>
                      <Text style={styles.profileValue}>{analysisResult.skinUndertone}</Text>
                    </View>
                    <View style={styles.profileItem}>
                      <Text style={styles.profileLabel}>{t('gender')}</Text>
                      <Text style={styles.profileValue}>
                        {analysisResult.gender}
                        <Text style={styles.confidenceText}>
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
              <Text style={styles.sectionTitle}>{t('overallSkinHealth')}</Text>
            </View>
            <Text style={styles.overallCondition}>{analysisResult.overallCondition}</Text>
          </View>
          {/* Clinical Assessment - Full width */}
          <View style={styles.analysisSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="assessment" size={24} color={COLORS.primary.main} />
              <Text style={styles.sectionTitle}>{t('clinicalAssessment')}</Text>
            </View>

            {analysisResult.features.map((item, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureHeader}>
                  <MaterialIcons
                    name={getTechnologyIcon(item.description)}
                    size={20}
                    color={COLORS.primary.main}
                  />
                  <Text style={styles.featureTitle}>{item.description}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{translateStatus(item.status)}</Text>
                  </View>
                </View>

                <View style={styles.featureContent}>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>{t('location')}</Text>
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>

                  <View style={styles.severityContainer}>
                    <Text style={styles.severityLabel}>{t('severityLevel')}</Text>
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
                    <Text style={styles.causesLabel}>{t('probableCauses')}</Text>
                    {item.causes.map((cause, causeIndex) => (
                      <Text key={causeIndex} style={styles.causeText}>• {cause}</Text>
                    ))}
                  </View>

                  <View style={styles.characteristicsContainer}>
                    <Text style={styles.characteristicsLabel}>{t('characteristics')}</Text>
                    {item.characteristics.map((char, charIndex) => (
                      <Text key={charIndex} style={styles.characteristicText}>• {char}</Text>
                    ))}
                  </View>

                  <View style={styles.priorityContainer}>
                    <Text style={styles.priorityLabel}>{t('treatmentPriority')}</Text>
                    <Text style={styles.priorityText}>{getPriorityLabel(item.priority)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Clinical Evaluation - Full width */}
          <View style={styles.clinicalEvaluation}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="medical-services" size={24} color={COLORS.primary.main} />
              <Text style={styles.sectionTitle}>{t('clinicalEvaluation')}</Text>
            </View>
            <Text style={styles.evaluationText}>{t('evaluationText')}</Text>
          </View>

          <View style={styles.disclaimer}>
            <View style={styles.disclaimerHeader}>
              <MaterialIcons name="info" size={20} color={COLORS.primary.main} />
              <Text style={styles.disclaimerTitle}>{t('analysisInformation')}</Text>
            </View>
            <Text style={styles.disclaimerText}>
              This analysis is generated using our proprietary DermaGraph™ AI technology,
              incorporating HydraDerm™ Multi-Spectrum imaging and BeautyMatrix™ assessment algorithms.
              Results are derived from analysis of over 100,000 clinical cases and validated by board-certified dermatologists.
            </Text>
            <Text style={styles.disclaimerNote}>
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
    backgroundColor: COLORS.background.paper,
  },
  scrollContainer: {
    flex: 1,
  },
  topContainer: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  topContainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    paddingBottom: SPACING.sm,
    width: '100%',
  },
  topContainerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginLeft: SPACING.sm,
  },
  topContainerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  leftColumn: {
    width: '58%',
  },
  fullWidthContent: {
    padding: SPACING.md,
    width: '100%',
  },
  profileSection: {
    width: '100%',
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.sm,
  },
  profileItem: {
    width: '48%',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  profileLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 2,
  },
  confidenceText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '400',
  },
  overallSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.md,
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
    padding: SPACING.lg,
    marginBottom: SPACING.md,
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
  },
  featureTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  featureContent: {
    marginLeft: SPACING.xl,
    width: '95%',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
    width: 80,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  severityContainer: {
    marginBottom: SPACING.sm,
  },
  severityLabel: {
    fontSize: 14,
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
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
    marginBottom: 2,
  },
  characteristicsContainer: {
    marginBottom: SPACING.sm,
  },
  characteristicsLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  characteristicText: {
    fontSize: 14,
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
    fontSize: 14,
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
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.md,
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

});

export default DiagnosisReport;

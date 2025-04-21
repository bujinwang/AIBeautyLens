import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import SkinMatrixHeader from './SkinMatrixHeader';
import FeatureSeverityRating from './FeatureSeverityRating';
import { AnalysisResult } from '../types';

interface DiagnosisReportProps {
  onClose: () => void;
  analysisResult: AnalysisResult;
}

const DiagnosisReport: React.FC<DiagnosisReportProps> = ({ onClose, analysisResult }) => {
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
    switch (status.toLowerCase()) {
      case 'active':
        return COLORS.error.main;
      case 'healing':
        return COLORS.warning.main;
      case 'chronic':
        return COLORS.info.main;
      default:
        return COLORS.text.secondary;
    }
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1:
        return 'Immediate attention';
      case 2:
        return 'High priority';
      case 3:
        return 'Moderate priority';
      case 4:
        return 'Low priority';
      case 5:
        return 'Maintenance';
      default:
        return 'Not specified';
    }
  };

  return (
    <View style={styles.container}>
      <SkinMatrixHeader 
        title="DermaGraph™ Analysis Report" 
        subtitle="Powered by HydraDerm™ Multi-Spectrum Technology"
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <MaterialIcons name="person" size={24} color={COLORS.primary.main} />
            <Text style={styles.profileTitle}>Profile Analysis</Text>
          </View>
          <View style={styles.profileGrid}>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Estimated Age</Text>
              <Text style={styles.profileValue}>{analysisResult.estimatedAge}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Skin Type</Text>
              <Text style={styles.profileValue}>{analysisResult.skinType}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Undertone</Text>
              <Text style={styles.profileValue}>{analysisResult.skinUndertone}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Gender</Text>
              <Text style={styles.profileValue}>
                {analysisResult.gender}
                <Text style={styles.confidenceText}>
                  {` (${Math.round(analysisResult.genderConfidence * 100)}% confidence)`}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.overallSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="health-and-safety" size={24} color={COLORS.primary.main} />
            <Text style={styles.sectionTitle}>Overall Skin Health</Text>
          </View>
          <Text style={styles.overallCondition}>{analysisResult.overallCondition}</Text>
        </View>

        <View style={styles.analysisSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="assessment" size={24} color={COLORS.primary.main} />
            <Text style={styles.sectionTitle}>Clinical Assessment</Text>
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
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              
              <View style={styles.featureContent}>
                <View style={styles.locationContainer}>
                  <Text style={styles.locationLabel}>Location:</Text>
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>

                <View style={styles.severityContainer}>
                  <Text style={styles.severityLabel}>Severity Level:</Text>
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
                  <Text style={styles.causesLabel}>Probable Causes:</Text>
                  {item.causes.map((cause, causeIndex) => (
                    <Text key={causeIndex} style={styles.causeText}>• {cause}</Text>
                  ))}
                </View>

                <View style={styles.characteristicsContainer}>
                  <Text style={styles.characteristicsLabel}>Characteristics:</Text>
                  {item.characteristics.map((char, charIndex) => (
                    <Text key={charIndex} style={styles.characteristicText}>• {char}</Text>
                  ))}
                </View>

                <View style={styles.priorityContainer}>
                  <Text style={styles.priorityLabel}>Treatment Priority:</Text>
                  <Text style={styles.priorityText}>{getPriorityLabel(item.priority)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.disclaimer}>
          <View style={styles.disclaimerHeader}>
            <MaterialIcons name="info" size={20} color={COLORS.primary.main} />
            <Text style={styles.disclaimerTitle}>Analysis Information</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This analysis is generated using our proprietary DermaGraph™ AI technology, 
            incorporating HydraDerm™ Multi-Spectrum imaging and BeautyMatrix™ assessment algorithms. 
            Results are derived from analysis of over 100,000 clinical cases and validated by board-certified dermatologists.
          </Text>
          <Text style={styles.disclaimerNote}>
            Note: This report is for informational purposes and does not constitute medical advice. 
            For specific skin concerns, please consult with a qualified healthcare professional.
          </Text>
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
  profileSection: {
    margin: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginLeft: SPACING.sm,
  },
  profileGrid: {
    padding: SPACING.md,
  },
  profileItem: {
    marginBottom: SPACING.sm,
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
  },
  confidenceText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '400',
  },
  overallSection: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  overallCondition: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
    marginTop: SPACING.sm,
  },
  analysisSection: {
    margin: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginLeft: SPACING.sm,
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  disclaimer: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.main,
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
});

export default DiagnosisReport;

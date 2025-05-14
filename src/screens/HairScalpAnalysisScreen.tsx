import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { useLocalization } from '../i18n/localizationContext';
import { HairScalpAnalysisResult, HairScalpRecommendation } from '../types/hairScalpAnalysis';
import SkinMatrixHeader from '../components/SkinMatrixHeader';

// Navigation types
export type HairScalpAnalysisScreenRouteProp = RouteProp<RootStackParamList, 'HairScalpAnalysis'>;
export type HairScalpAnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HairScalpAnalysis'>;

// Props type
interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'HairScalpAnalysis'>;
  route: RouteProp<RootStackParamList, 'HairScalpAnalysis'>;
}

const HairScalpAnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useLocalization();
  // Type guard for params
  const imageUris: string[] = Array.isArray(route.params?.imageUris) ? route.params.imageUris : [];
  const hairScalpAnalysisResult: HairScalpAnalysisResult | undefined = route.params?.hairScalpAnalysisResult;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('hairScalpAnalysis'),
      headerTintColor: '#FFFFFF',
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

  if (!hairScalpAnalysisResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('noAnalysisResults')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SkinMatrixHeader
        title={t('hairScalpAnalysis')}
        subtitle={t('hairScalpSubtitle')}
      />
      <ScrollView style={styles.scrollContainer}>
        {/* Images */}
        {imageUris.length > 0 && (
          <ScrollView horizontal style={styles.imagesRow}>
            {imageUris.map((uri: string, idx: number) => (
              <Image key={idx} source={{ uri }} style={styles.analysisImage} resizeMode="cover" />
            ))}
          </ScrollView>
        )}
        {/* Assessment Date */}
        <Text style={styles.dateText}>{t('assessmentDate')}: {hairScalpAnalysisResult.assessmentDate}</Text>
        {/* Overall Condition */}
        <View style={[styles.sectionContainer, { borderLeftColor: COLORS.info.main }]}> 
          <View style={styles.sectionHeader}>
            <MaterialIcons name="analytics" size={24} color={COLORS.primary.main} />
            <Text style={styles.sectionTitle}>{t('overallCondition')}</Text>
          </View>
          <Text style={styles.sectionText}>{hairScalpAnalysisResult.overallCondition}</Text>
        </View>
        {/* Hair Loss Pattern */}
        <View style={[styles.sectionContainer, { borderLeftColor: COLORS.primary.main }]}> 
          <View style={styles.sectionHeader}>
            <MaterialIcons name="timeline" size={24} color={COLORS.primary.main} />
            <Text style={styles.sectionTitle}>{t('hairLossPattern')}</Text>
          </View>
          <Text style={styles.sectionText}>{hairScalpAnalysisResult.hairLossPattern}</Text>
        </View>
        {/* Hair Quality */}
        <View style={[styles.sectionContainer, { borderLeftColor: COLORS.secondary.main }]}> 
          <View style={styles.sectionHeader}>
            <MaterialIcons name="texture" size={24} color={COLORS.secondary.main} />
            <Text style={styles.sectionTitle}>{t('hairQuality')}</Text>
          </View>
          <Text style={styles.sectionText}>{hairScalpAnalysisResult.hairQuality}</Text>
        </View>
        {/* Scalp Condition */}
        <View style={[styles.sectionContainer, { borderLeftColor: COLORS.gold.main }]}> 
          <View style={styles.sectionHeader}>
            <MaterialIcons name="spa" size={24} color={COLORS.gold.main} />
            <Text style={styles.sectionTitle}>{t('scalpCondition')}</Text>
          </View>
          <Text style={styles.sectionText}>{hairScalpAnalysisResult.scalpCondition}</Text>
        </View>
        {/* Preliminary Diagnosis */}
        <View style={[styles.sectionContainer, { borderLeftColor: COLORS.error.main }]}> 
          <View style={styles.sectionHeader}>
            <MaterialIcons name="medical-services" size={24} color={COLORS.error.main} />
            <Text style={styles.sectionTitle}>{t('preliminaryDiagnosis')}</Text>
          </View>
          <Text style={styles.sectionText}>{hairScalpAnalysisResult.preliminaryDiagnosis}</Text>
          <Text style={styles.sectionText}>{hairScalpAnalysisResult.rationale}</Text>
        </View>
        {/* Recommendations */}
        <View style={[styles.sectionContainer, { borderLeftColor: COLORS.success.main }]}> 
          <View style={styles.sectionHeader}>
            <MaterialIcons name="recommend" size={24} color={COLORS.success.main} />
            <Text style={styles.sectionTitle}>{t('recommendations')}</Text>
          </View>
          {hairScalpAnalysisResult.recommendations.map((rec: HairScalpRecommendation, idx: number) => (
            <View key={idx} style={styles.recommendationCard}>
              <Text style={styles.recommendationType}>{t(rec.type)}</Text>
              <Text style={styles.sectionText}>{rec.description}</Text>
              {rec.details && <Text style={styles.sectionText}>{rec.details}</Text>}
            </View>
          ))}
        </View>
        {/* Notes */}
        <View style={[styles.sectionContainer, { borderLeftColor: COLORS.warning.main }]}> 
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info" size={24} color={COLORS.warning.main} />
            <Text style={styles.sectionTitle}>{t('importantNotes')}</Text>
          </View>
          <Text style={styles.sectionText}>{hairScalpAnalysisResult.notes}</Text>
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
  errorText: {
    textAlign: 'center',
    marginTop: SPACING.xl,
    fontSize: 16,
    color: COLORS.text.primary,
    padding: SPACING.md,
  },
  imagesRow: {
    flexDirection: 'row',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  analysisImage: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.gray[200],
  },
  dateText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionContainer: {
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
    padding: SPACING.md,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h5.fontSize,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginLeft: SPACING.sm,
    flexShrink: 1,
  },
  sectionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    lineHeight: 22,
    marginBottom: 4,
  },
  recommendationCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success.light,
  },
  recommendationType: {
    fontWeight: 'bold',
    color: COLORS.success.dark,
    marginBottom: 2,
  },
});

export default HairScalpAnalysisScreen; 
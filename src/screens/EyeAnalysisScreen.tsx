import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme'; // Import theme constants
import { useLocalization } from '../i18n/localizationContext';
import { EyeAreaAnalysisResult, EyeFeature } from '../types/eyeAnalysis'; // Use eye-specific types
import SkinMatrixHeader from '../components/SkinMatrixHeader'; // Re-use header if applicable
// FeatureSeverityRating is temporarily removed for debugging
// import FeatureSeverityRating from '../components/FeatureSeverityRating'; 

type EyeAnalysisScreenRouteProp = RouteProp<RootStackParamList, 'EyeAnalysis'>;
type EyeAnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EyeAnalysis'>;

type Props = {
  route: EyeAnalysisScreenRouteProp;
  navigation: EyeAnalysisScreenNavigationProp;
};

const EyeAnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useLocalization();
  const {
    imageUri = "",
    eyeAnalysisResult = null,
  } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('eyeAreaAnalysis'),
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

  if (!eyeAnalysisResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('noAnalysisResults')}</Text>
      </View>
    );
  }

  // Helper functions are not needed for the simplified debugging version
  // const getStatusColor = ...
  // const translateStatus = ...
  // const getPriorityLabel = ...

  return (
    <View style={styles.container}>
      <SkinMatrixHeader
        title={t('eyeAreaAnalysis')}
        subtitle="Detailed Eye Area Assessment"
      />

      <ScrollView style={styles.scrollContainer}>
        {imageUri && (
          <View style={styles.imageOuterContainer}>
            <View style={styles.imageInnerContainer}>
              <Image source={{ uri: imageUri }} style={styles.analysisImage} resizeMode="cover" />
            </View>
          </View>
        )}

        {/* Overall Eye Area Health */}
        <View style={[styles.sectionContainer, { borderLeftColor: COLORS.info.main }]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="visibility" size={24} color={COLORS.primary.main} />
            <Text style={styles.sectionTitle}>{t('eyeAreaOverview')}</Text>
          </View>
          <Text style={styles.overallConditionText}>{eyeAnalysisResult.overallCondition}</Text>
        </View>

        {/* Clinical Assessment of Eye Features (Full Details) */}
        <View style={[styles.sectionContainer, { borderLeftColor: COLORS.primary.main }]}> 
          <View style={styles.sectionHeader}>
            <MaterialIcons name="assessment" size={24} color={COLORS.primary.main} />
            <Text style={styles.sectionTitle}>{t('eyeAreaConditions')}</Text>
          </View>

          {Array.isArray(eyeAnalysisResult.eyeFeatures) && eyeAnalysisResult.eyeFeatures.map((item: EyeFeature, index: number) => (
            <View key={index} style={styles.featureCard}>
              <Text style={{fontWeight: 'bold', marginBottom: 4}}>{t('feature')} {index + 1}: {item.description}</Text>
              <Text><Text style={{fontWeight: '600'}}>{t('severity')}:</Text> {item.severity}</Text>
              <Text><Text style={{fontWeight: '600'}}>{t('location')}:</Text> {item.location}</Text>
              <Text><Text style={{fontWeight: '600'}}>{t('causes')}:</Text> {item.causes && item.causes.length > 0 ? item.causes.join(', ') : '-'}</Text>
              <Text><Text style={{fontWeight: '600'}}>{t('status')}:</Text> {item.status}</Text>
              <Text><Text style={{fontWeight: '600'}}>{t('characteristics')}:</Text> {item.characteristics && item.characteristics.length > 0 ? item.characteristics.join(', ') : '-'}</Text>
              <Text><Text style={{fontWeight: '600'}}>{t('priority')}:</Text> {item.priority}</Text>
            </View>
          ))}
        </View>

        {/* Eye Health Observations */}
        {eyeAnalysisResult.eyeHealthConcerns && eyeAnalysisResult.eyeHealthConcerns.length > 0 && (
          <View style={[styles.sectionContainer, styles.healthWarningSection]}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="warning" size={24} color={COLORS.warning.dark} />
              <Text style={[styles.sectionTitle, styles.warningTitle]}>{t('eyeHealthObservations')}</Text>
            </View>
            <Text style={styles.healthWarningIntro}>{t('eyeHealthWarningIntro')}</Text>
            {eyeAnalysisResult.eyeHealthConcerns.map((concern: string, index: number) => (
              <Text key={index} style={styles.healthConcernItem}>• {concern}</Text>
            ))}
            <Text style={styles.healthDisclaimerText}>{t('eyeHealthDisclaimer')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Styles adapted from DiagnosisReport.tsx and EyeAnalysisScreen.tsx
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
   imageOuterContainer: {
      padding: SPACING.sm,
   },
    imageInnerContainer: {
      borderRadius: BORDER_RADIUS.lg,
      overflow: 'hidden',
      ...SHADOWS.medium,
    },
    analysisImage: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: BORDER_RADIUS.lg,
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
   overallConditionText: {
     ...TYPOGRAPHY.body1,
     color: COLORS.text.primary,
     lineHeight: 24,
   },
   featureCard: { // Simplified style for debugging
     backgroundColor: COLORS.white,
     borderRadius: BORDER_RADIUS.md,
     padding: SPACING.md,
     marginBottom: SPACING.sm,
     borderLeftWidth: 4,
     borderLeftColor: COLORS.primary.light,
   },
   // Health Warning Styles
   healthWarningSection: {
      borderLeftColor: COLORS.warning.main,
   },
   warningTitle: {
      color: COLORS.warning.dark,
   },
   healthWarningIntro: {
      ...TYPOGRAPHY.body2,
      fontWeight: '600',
      color: COLORS.warning.dark,
      marginBottom: SPACING.sm,
   },
   healthConcernItem: {
      ...TYPOGRAPHY.body2,
      color: COLORS.text.primary,
      marginBottom: SPACING.xs,
      marginLeft: SPACING.md,
   },
   healthDisclaimerText: {
      ...TYPOGRAPHY.caption,
      color: COLORS.text.secondary,
      marginTop: SPACING.sm,
      fontStyle: 'italic',
   },
});

export default EyeAnalysisScreen;

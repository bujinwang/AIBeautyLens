import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { HaircareRecommendation } from '../types/hairScalpAnalysis'; // Use hair-specific type
import SkinMatrixHeader from './SkinMatrixHeader';
import { useLocalization } from '../i18n/localizationContext';

interface HaircareAdviceModalProps {
  visible: boolean;
  onClose: () => void;
  recommendations: HaircareRecommendation[]; 
  overallRecommendation: string;
  careRoutine: string;
  notes: string;
}

const HaircareAdviceModal: React.FC<HaircareAdviceModalProps> = ({
  visible,
  onClose,
  recommendations = [],
  overallRecommendation = '',
  careRoutine = '',
  notes = ''
}) => {
  const { t } = useLocalization();

  const getCategoryIcon = (category: string) => {
    // Hair & scalp specific icons
    switch (category?.toLowerCase()) {
      case 'shampoo':
        return 'spa';
      case 'conditioner':
        return 'air';
      case 'scalp treatment':
      case 'treatment':
        return 'opacity';
      case 'hair mask':
      case 'mask':
        return 'masks';
      case 'hair oil':
      case 'oil':
        return 'opacity';
      case 'hair serum':
      case 'serum':
        return 'opacity';
      default:
        return 'spa';
    }
  };

  // Don't render anything if not visible
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <SkinMatrixHeader
            title={t('recommendedHaircare')}
            subtitle={t('personalizedHaircareAdvice')}
          />

          <ScrollView style={styles.scrollContainer}>
            {overallRecommendation && (
              <View style={styles.introContainer}>
                <Text style={styles.introTitle}>{t('overallRecommendation')}</Text>
                <Text style={styles.introText}>{overallRecommendation}</Text>
              </View>
            )}

            <View style={styles.recommendationsContainer}>
              {recommendations && recommendations.length > 0 ?
                recommendations.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.recommendationCard,
                    index % 2 === 0 ? styles.evenCard : styles.oddCard
                  ]}
                >
                  <View style={styles.recommendationHeader}>
                    <View style={styles.recommendationIconContainer}>
                      <MaterialIcons
                        name={getCategoryIcon(item.productType)}
                        size={24}
                        color={COLORS.primary.main}
                      />
                    </View>
                    <View style={styles.productHeaderText}>
                      <Text style={styles.productTypeText}>{item.productType}</Text>
                    </View>
                  </View>

                  <View style={styles.recommendationDetails}>
                    {item.brandRecommendation && (
                      <View style={styles.recommendationRow}>
                        <Text style={styles.recommendationLabel}>{t('recommendedProduct')}</Text>
                        <Text style={styles.recommendationValue}>{item.brandRecommendation}</Text>
                      </View>
                    )}
                    
                    <View style={styles.recommendationRow}>
                      <Text style={styles.recommendationLabel}>{t('keyIngredients')}</Text>
                      <Text style={styles.recommendationValue}>{item.recommendedIngredients}</Text>
                    </View>

                    <View style={styles.recommendationRow}>
                      <Text style={styles.recommendationLabel}>{t('usage')}</Text>
                      <Text style={styles.recommendationValue}>{item.recommendedUsage}</Text>
                    </View>

                    {item.reason && (
                      <View style={styles.recommendationRow}>
                        <Text style={styles.recommendationLabel}>{t('why')}</Text>
                        <Text style={styles.reasonValue}>{item.reason}</Text>
                      </View>
                    )}
                     {item.targetConcerns && item.targetConcerns.length > 0 && (
                       <View style={styles.recommendationRow}>
                         <Text style={styles.recommendationLabel}>{t('targetedConcerns')}</Text>
                         <Text style={styles.recommendationValue}>{item.targetConcerns.join(', ')}</Text>
                       </View>
                     )}
                     {item.precautions && (
                       <View style={styles.recommendationRow}>
                         <Text style={styles.recommendationLabel}>{t('precautions')}</Text>
                         <Text style={styles.recommendationValue}>{item.precautions}</Text>
                       </View>
                     )}
                  </View>
                </View>
              )) : (
                <View style={styles.noProductsContainer}>
                  <Text style={styles.noProductsText}>{t('noRecommendationsAvailable')}</Text>
                </View>
              )}
            </View>

            {careRoutine && (
              <View style={styles.routineContainer}>
                <Text style={styles.sectionTitle}>{t('recommendedHaircareRoutine')}</Text>
                <Text style={styles.routineText}>{careRoutine}</Text>
              </View>
            )}

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerTitle}>{t('importantNotes')}</Text>
              <Text style={styles.disclaimerText}>
                {t('hairPatchTest')}{'\n'}
                {t('hairIntroduceNewProducts')}{'\n'}
                {t('hairConsistencyIsKey')}{'\n'}
                {t('hairNotSubstitute')}{'\n'}
                {t('hairDiscontinueUse')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Styles similar to EyeSkincareAdviceModal
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.paper,
  },
  content: {
    flex: 1,
    marginTop: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    elevation: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  introContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  introText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  recommendationsContainer: {
    padding: SPACING.md,
  },
  recommendationCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  evenCard: {
    backgroundColor: COLORS.background.default,
  },
  oddCard: {
    backgroundColor: COLORS.white,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  recommendationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  productHeaderText: {
    flex: 1,
  },
  productTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  recommendationDetails: {
    padding: SPACING.md,
  },
  recommendationRow: {
    marginBottom: SPACING.sm,
  },
  recommendationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  recommendationValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  reasonValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  routineContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary.light,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  routineText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  noProductsContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  disclaimer: {
    backgroundColor: COLORS.info.light,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info.main,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  disclaimerText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});

export default HaircareAdviceModal; 
import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { EyeSkincareRecommendation } from '../types/eyeAnalysis'; // Use eye-specific type
import SkinMatrixHeader from './SkinMatrixHeader';
import { useLocalization } from '../i18n/localizationContext';

interface EyeSkincareAdviceModalProps {
  visible: boolean;
  onClose: () => void;
  recommendations: EyeSkincareRecommendation[]; // Accept eye recommendations directly
}

const EyeSkincareAdviceModal: React.FC<EyeSkincareAdviceModalProps> = ({
  visible,
  onClose,
  recommendations = [] // Default to empty array
}) => {
  const { t } = useLocalization();

  const getCategoryIcon = (category: string) => {
    // Keep or adapt icon logic as needed for eye products
    switch (category?.toLowerCase()) {
      case 'eye cream':
        return 'visibility';
      case 'hydrating eye serum':
      case 'eye serum':
        return 'water-drop'; // Example icon
      case 'eye mask':
        return 'masks'; // Example icon
      default:
        return 'spa'; // Default eye care icon
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
            title={t('recommendedEyeCare')} // Use eye-specific title key
            subtitle={t('personalizedEyeCareAdvice')} // Add new i18n key if needed
          />

          <ScrollView style={styles.scrollContainer}>
            <View style={styles.introContainer}>
              {/* Optional: Add intro text specific to eye care */}
            </View>

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
                      {/* If specific product names are available, display them */}
                      {/* <Text style={styles.productNameText}>{item.productName}</Text> */}
                    </View>
                  </View>

                  <View style={styles.recommendationDetails}>
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
                  {/* Removed renderProductRecommendations call as specific products aren't fetched here */}
                </View>
              )) : (
                <View style={styles.noProductsContainer}>
                  <Text style={styles.noProductsText}>{t('noRecommendationsAvailable')}</Text>
                </View>
              )}
            </View>

            {/* Removed Concerns section */}

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerTitle}>{t('importantNotes')}</Text>
              <Text style={styles.disclaimerText}>
                {t('eyePatchTest')}{'\n'}
                {t('eyeIntroduceNewProducts')}{'\n'}
                {t('eyeConsistencyIsKey')}{'\n'}
                {t('eyeNotSubstitute')}{'\n'}
                {t('eyeDiscontinueUse')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Use similar styles as SkincareAdviceModal, potentially adjusting names or values
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.paper,
  },
  content: {
    flex: 1,
    marginTop: 60, // Adjust as needed if header height differs
  },
  closeButton: {
    position: 'absolute',
    top: 40, // Adjust based on status bar height
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
  productNameText: { // Style for potential product name display
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
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
  reasonValue: { // Specific style for reason if needed
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    fontStyle: 'italic',
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
    margin: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background.default,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning.main,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  disclaimerText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  // Add any other styles needed from SkincareAdviceModal or new ones
});

export default EyeSkincareAdviceModal;

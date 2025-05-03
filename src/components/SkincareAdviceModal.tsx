import React, { useState, useEffect, useMemo } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { AnalysisResult } from '../types';
import SkinMatrixHeader from './SkinMatrixHeader';
import { getProductsForConcerns, SkincareProduct } from '../constants/skincareProducts';
import { getGeminiProductRecommendations, getSingleProductRecommendations } from '../services/geminiService';
import { useLocalization } from '../i18n/localizationContext';

interface SkincareAdviceModalProps {
  visible: boolean;
  onClose: () => void;
  analysisResult: AnalysisResult;
}

const SkincareAdviceModal: React.FC<SkincareAdviceModalProps> = ({
  visible,
  onClose,
  analysisResult
}) => {
  const { t, currentLanguage } = useLocalization();
  // Extract concerns from features using useMemo to prevent recreation on every render
  const concerns = useMemo(() =>
    analysisResult.features.map(feature => feature.description.toLowerCase()),
    [analysisResult.features]
  );

  // Memoize the language to prevent unnecessary renders
  const language = useMemo(() => currentLanguage, [currentLanguage]);

  // State to store recommended products by category
  const [productsByCategory, setProductsByCategory] = useState<{[key: string]: SkincareProduct[]}>({});

  // Add state for Gemini recommendations
  const [geminiProducts, setGeminiProducts] = useState<SkincareProduct[]>([]);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);

  // Memoize the skin type to prevent unnecessary renders
  const skinType = useMemo(() => analysisResult.skinType, [analysisResult.skinType]);

  // Use useMemo for the product recommendations to avoid recalculations
  const recommendedProducts = useMemo(() => {
    // Make sure concerns is an array before passing it to getProductsForConcerns
    const concernsArray = Array.isArray(concerns) ? concerns : [];
    // Pass empty string as productType since we're not filtering by product type initially
    return getProductsForConcerns('', concernsArray, skinType);
  }, [concerns, skinType]);

  // Only run this effect when the recommendedProducts change
  useEffect(() => {
    if (!visible) return; // Don't process if modal isn't visible

    // Group products by category
    const groupedProducts: {[key: string]: SkincareProduct[]} = {};
    recommendedProducts.forEach(product => {
      if (!groupedProducts[product.category]) {
        groupedProducts[product.category] = [];
      }
      groupedProducts[product.category].push(product);
    });

    setProductsByCategory(groupedProducts);
  }, [recommendedProducts, visible]);

  // Add effect to fetch Gemini recommendations when visible
  useEffect(() => {
    if (!visible) return;

    const fetchGeminiRecommendations = async () => {
      setIsLoadingGemini(true);
      try {
        console.log("Fetching product recommendations for:", {
          skinType,
          concerns,
          recommendationsCount: analysisResult.skincareRecommendations?.length || 0
        });

        // Use the new function to get one product per category
        const products = await getSingleProductRecommendations({
          skinType,
          concerns,
          existingRecommendations: analysisResult.skincareRecommendations,
          language: currentLanguage
        });

        console.log("Received products:", products.length, products);
        setGeminiProducts(products);

        // Also organize products by category for consistency
        const groupedGeminiProducts: {[key: string]: SkincareProduct[]} = {};
        products.forEach(product => {
          if (!groupedGeminiProducts[product.category]) {
            groupedGeminiProducts[product.category] = [];
          }
          groupedGeminiProducts[product.category].push(product);
        });

        console.log("Grouped Gemini products by category:", Object.keys(groupedGeminiProducts));

        // Always update with Gemini recommendations
        setProductsByCategory(groupedGeminiProducts);
      } catch (error) {
        console.error('Error fetching Gemini recommendations:', error);
      } finally {
        setIsLoadingGemini(false);
      }
    };

    fetchGeminiRecommendations();
  }, [visible, skinType, concerns]);

  const getCategoryIcon = (category: string) => {
    if (!category) return 'science'; // Default icon if category is undefined

    switch (category.toLowerCase()) {
      case 'cleanser':
      case 'gentle cleanser':
        return 'wash';
      case 'toner':
        return 'opacity';
      case 'hydrator':
      case 'moisturizer':
      case 'lightweight moisturizer':
        return 'water';
      case 'sunscreen':
        return 'wb-sunny';
      case 'serum':
      case 'hydrating & calming serum':
      case 'targeted treatment':
      case 'targeted acne treatment':
        return 'science';
      case 'exfoliator':
        return 'spa';
      case 'masks':
        return 'face';
      case 'eye care':
        return 'visibility';
      default:
        return 'science';
    }
  };

  // Add this before the renderProductRecommendations function
  const [shownProductIds] = useState(new Set<string>());

  // Function to render product recommendations for a specific category
  const renderProductRecommendations = (productType: string) => {
    if (!productType) {
      console.log('No product type provided to renderProductRecommendations');
      return (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>{t('noProductsFound')}</Text>
        </View>
      );
    }
    console.log(`Rendering products for ${productType}`);

    // Map from generalized product type to specific category names in our product database
    const categoryMapping: {[key: string]: string[]} = {
      // English categories
      'Cleanser': ['Cleanser', 'Gentle Cleanser'],
      'Gentle Cleanser': ['Cleanser', 'Gentle Cleanser'],
      'Moisturizer': ['Moisturizer', 'Hydrator', 'Hydrating Moisturizer'],
      'Treatment Serum (Anti-inflammatory/PIH)': ['Serum', 'Targeted Treatment', 'Hydrating & Calming Serum'],
      'Treatment Serum (Acne/Texture - Use cautiously)': ['Targeted Treatment', 'Targeted Acne Treatment', 'Acne Treatment Serum/Spot Treatment'],
      'Sunscreen': ['Sunscreen'],
      'Hydrating Serum': ['Serum', 'Hydrating & Calming Serum', 'Targeted Treatment'],
      'Lightweight Moisturizer': ['Moisturizer', 'Hydrator', 'Hydrating Moisturizer'],
      'Hydrating Moisturizer': ['Moisturizer', 'Hydrator', 'Hydrating Moisturizer'],

      // Chinese categories
      '洁面乳': ['Cleanser', 'Gentle Cleanser'],
      '温和洁面乳': ['Cleanser', 'Gentle Cleanser'],
      '洗面奶': ['Cleanser', 'Gentle Cleanser'],
      '洁面': ['Cleanser', 'Gentle Cleanser'],
      '保湿霜': ['Moisturizer', 'Hydrator', 'Hydrating Moisturizer'],
      '保湿面霜': ['Moisturizer', 'Hydrator', 'Hydrating Moisturizer'],
      '轻盈保湿霜': ['Moisturizer', 'Hydrator', 'Hydrating Moisturizer'],
      '面霜': ['Moisturizer', 'Hydrator', 'Hydrating Moisturizer'],
      '乳液': ['Moisturizer', 'Hydrator', 'Hydrating Moisturizer'],
      '精华': ['Serum', 'Targeted Treatment', 'Hydrating & Calming Serum'],
      '精华液': ['Serum', 'Targeted Treatment', 'Hydrating & Calming Serum'],
      '精华 (抗炎/色素沉着后炎症)': ['Serum', 'Targeted Treatment', 'Hydrating & Calming Serum'],
      '抗炎精华': ['Serum', 'Targeted Treatment', 'Hydrating & Calming Serum'],
      '祛斑精华': ['Serum', 'Targeted Treatment', 'Hydrating & Calming Serum'],
      '美白精华': ['Serum', 'Targeted Treatment', 'Hydrating & Calming Serum'],
      '精华 (痘痘/质地 - 谨慎使用)': ['Targeted Treatment', 'Targeted Acne Treatment', 'Acne Treatment Serum/Spot Treatment'],
      '祛痘精华': ['Targeted Treatment', 'Targeted Acne Treatment', 'Acne Treatment Serum/Spot Treatment'],
      '痘痘精华': ['Targeted Treatment', 'Targeted Acne Treatment', 'Acne Treatment Serum/Spot Treatment'],
      '抗痘精华': ['Targeted Treatment', 'Targeted Acne Treatment', 'Acne Treatment Serum/Spot Treatment'],
      '防晒霜': ['Sunscreen'],
      '防晒': ['Sunscreen'],
      '防晒乳': ['Sunscreen'],
      '保湿精华': ['Serum', 'Hydrating & Calming Serum', 'Targeted Treatment'],
      '补水精华': ['Serum', 'Hydrating & Calming Serum', 'Targeted Treatment'],
      '精华 (日间)': ['Serum', 'Hydrating & Calming Serum', 'Targeted Treatment'],
      '日间精华': ['Serum', 'Hydrating & Calming Serum', 'Targeted Treatment'],
      '精华 (夜间 - 交替使用)': ['Serum', 'Targeted Treatment', 'Hydrating & Calming Serum'],
      '夜间精华': ['Serum', 'Targeted Treatment', 'Hydrating & Calming Serum'],
      '爽肤水': ['Toner'],
      '化妆水': ['Toner'],
      '柔肤水': ['Toner'],
      '去角质产品': ['Exfoliator'],
      '磨砂膏': ['Exfoliator'],
      '去角质': ['Exfoliator'],
      '面膜': ['Masks', 'Mask'],
      '眼霜': ['Eye Care', 'Eye Cream'],
      '眼部护理': ['Eye Care', 'Eye Cream']
    };

    // Find the matching categories from our mapping
    const possibleCategories = categoryMapping[productType] || [productType];
    console.log(`Possible categories for ${productType}:`, possibleCategories);

    // Get products matching any of the possible categories
    let products: SkincareProduct[] = [];
    possibleCategories.forEach(category => {
      const matchingProducts = Object.values(productsByCategory)
        .flat()
        .filter(product => {
          const productCategoryLower = product.category.toLowerCase();
          const categoryLower = category.toLowerCase();

          // Check for exact match or partial match
          const isMatch = productCategoryLower === categoryLower ||
                 productCategoryLower.includes(categoryLower) ||
                 categoryLower.includes(productCategoryLower);

          // Also check if product is suitable for the skin type
          const skinTypes = skinType.toLowerCase().split('/').map(type => type.trim());
          const matchesSkinType = product.skinType.some(type =>
            skinTypes.includes(type.toLowerCase()) || type.toLowerCase() === 'all'
          );

          return isMatch && matchesSkinType;
        });

      console.log(`Found ${matchingProducts.length} products for category ${category}`);
      products = [...products, ...matchingProducts];
    });

    // Remove duplicates
    products = Array.from(new Set(products));

    console.log(`Total products found for ${productType}: ${products.length}`);

    // Filter products based on skin type and ingredients matching the recommendations
    if (skinType) {
      products = products.filter(product => {
        // Check if product is suitable for this skin type
        const matchesSkinType = product.skinType.some(type =>
          type.toLowerCase() === skinType.toLowerCase() ||
          type.toLowerCase() === 'all'
        );

        // For cleansers, check for ceramides, glycerin, or salicylic acid
        const cleanserTypes = ['Gentle Cleanser', 'Cleanser', '洁面乳', '温和洁面乳', '洗面奶', '洁面'];
        if (cleanserTypes.some(type => productType.includes(type) || type.includes(productType))) {
          return matchesSkinType && product.ingredients &&
            (product.ingredients.toLowerCase().includes('ceramide') ||
             product.ingredients.toLowerCase().includes('glycerin') ||
             product.ingredients.toLowerCase().includes('salicylic acid'));
        }

        // For acne treatments, check for salicylic acid, benzoyl peroxide, or adapalene
        const acneTreatmentTypes = ['Acne Treatment Serum/Spot Treatment', 'Targeted Acne Treatment', '精华 (痘痘/质地 - 谨慎使用)', '祛痘精华', '痘痘精华', '抗痘精华'];
        if (acneTreatmentTypes.some(type => productType.includes(type) || type.includes(productType))) {
          return matchesSkinType && product.ingredients &&
            (product.ingredients.toLowerCase().includes('salicylic acid') ||
             product.ingredients.toLowerCase().includes('benzoyl peroxide') ||
             product.ingredients.toLowerCase().includes('adapalene'));
        }

        // For moisturizers, check for hyaluronic acid, glycerin, ceramides
        const moisturizerTypes = ['Hydrating Moisturizer', 'Moisturizer', 'Hydrator', '保湿霜', '保湿面霜', '轻盈保湿霜', '面霜', '乳液'];
        if (moisturizerTypes.some(type => productType.includes(type) || type.includes(productType))) {
          return matchesSkinType && product.ingredients &&
            (product.ingredients.toLowerCase().includes('hyaluronic acid') ||
             product.ingredients.toLowerCase().includes('glycerin') ||
             product.ingredients.toLowerCase().includes('ceramide'));
        }

        return matchesSkinType;
      });
    }

    // Sort products by price
    products.sort((a, b) => a.price - b.price);

    // Take only the first product for each category
    products = products.slice(0, 1);

    // If loading Gemini recommendations and no products yet, show loading indicator
    if (products.length === 0 && isLoadingGemini) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary.main} />
          <Text style={styles.loadingText}>{t('gettingAIRecommendations')}</Text>
        </View>
      );
    }

    // If no products found, return the "No specific products found" message
    if (products.length === 0) {
      return (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>{t('noProductsFound')}</Text>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.productsSection}>
          {products.map((product, index) => (
            <View key={index} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name={getCategoryIcon(product.category)}
                    size={18}
                    color={COLORS.white}
                  />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.brandName}>{product.brand}</Text>
                  <Text style={styles.productName}>
                    {product.name}{product.size ? ` (${product.size})` : ''}
                  </Text>
                </View>
                <Text style={styles.productPrice}>
                  ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                </Text>
              </View>

              <Text style={styles.productDescription}>
                {product.description ||
                 (product.category ?
                  `Specially formulated ${product.category.toLowerCase()} for ${skinType} skin` :
                  `Specially formulated product for ${skinType} skin`)}
              </Text>

              {product.ingredients && (
                <View style={styles.ingredientsContainer}>
                  <Text style={styles.ingredientsLabel}>{t('keyIngredients')}</Text>
                  <Text style={styles.ingredientsText}>{product.ingredients}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
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
            title={t('personalizedSkincareAdvice')}
            subtitle={`${t('recommendedRegimen')} ${skinType} skin`}
          />

          {isLoadingGemini && (
            <View style={styles.loadingIndicatorContainer}>
              <ActivityIndicator size="small" color={COLORS.primary.main} />
              <Text style={styles.loadingIndicatorText}>{t('loadingRecommendations')}</Text>
            </View>
          )}

          <ScrollView style={styles.scrollContainer}>
            <View style={styles.introContainer}>
              <Text style={styles.introTitle}>{t('skincareProductRecommendations')}</Text>
              <Text style={styles.introText}>
                {t('tailoredRecommendations')} {skinType} {t('skinTypeAndConcerns')}
              </Text>
            </View>

            <View style={styles.recommendationsContainer}>
              {analysisResult.skincareRecommendations && Array.isArray(analysisResult.skincareRecommendations) ?
                analysisResult.skincareRecommendations.map((item, index) => (
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
                      <Text style={styles.productNameText}>
                        {item.productName}
                      </Text>
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
                  </View>

                  {renderProductRecommendations(item.productType)}
                </View>
              )) : (
                <View style={styles.noProductsContainer}>
                  <Text style={styles.noProductsText}>{t('noRecommendationsAvailable')}</Text>
                </View>
              )}
            </View>

            <View style={styles.concernsContainer}>
              <Text style={styles.concernsTitle}>{t('targetedConcerns')}</Text>
              {analysisResult.features && Array.isArray(analysisResult.features) ?
                [...analysisResult.features]
                  .sort((a, b) => b.severity - a.severity)
                  .map((feature, index) => (
                <Text key={index} style={styles.concernText}>
                  • {feature.description} ({t('severity')} {feature.severity}/5)
                </Text>
              )) : (
                <Text style={styles.noProductsText}>{t('noFeaturesDetected')}</Text>
              )}
            </View>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerTitle}>{t('importantNotes')}</Text>
              <Text style={styles.disclaimerText}>
                • Patch test new products before applying to your entire face{'\n'}
                • Introduce new products one at a time, with 1-2 weeks between additions{'\n'}
                • Consistency is key - results typically take 4-6 weeks to become visible{'\n'}
                • These recommendations are based on AI analysis and not a substitute for dermatologist advice{'\n'}
                • Discontinue use of any product that causes irritation or discomfort
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  loadingIndicatorText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  scrollContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  introContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.primary.light + '15',
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.main,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginBottom: SPACING.sm,
  },
  introText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  recommendationsContainer: {
    marginBottom: SPACING.lg,
  },
  recommendationCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  evenCard: {
    backgroundColor: COLORS.white,
  },
  oddCard: {
    backgroundColor: COLORS.gray[50],
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  recommendationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  productHeaderText: {
    flex: 1,
  },
  productTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  productNameText: {
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
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  recommendationValue: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  reasonValue: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  productsSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper + '80',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  productsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginBottom: SPACING.sm,
  },
  productCard: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  productInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  productIngredients: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  ingredientsContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  ingredientsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  ingredientsText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  concernsContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
  },
  concernsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  concernText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  disclaimer: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary.main,
  },
  disclaimerTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: SPACING.xs,
    color: COLORS.secondary.main,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  loadingContainer: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  noProductsContainer: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noProductsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  }
});

export default SkincareAdviceModal;

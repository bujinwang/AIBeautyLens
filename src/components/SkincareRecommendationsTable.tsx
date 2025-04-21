import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { SkincareRecommendation } from '../types';

interface SkincareRecommendationsTableProps {
  recommendations: SkincareRecommendation[];
}

const SkincareRecommendationsTable: React.FC<SkincareRecommendationsTableProps> = ({ recommendations }) => {
  const getProductIcon = (productType: string) => {
    switch (productType.toLowerCase()) {
      case 'cleanser':
        return 'wash';
      case 'toner':
        return 'opacity';
      case 'moisturizer':
        return 'water';
      case 'sunscreen':
        return 'wb-sunny';
      case 'serum':
        return 'science';
      case 'exfoliant':
        return 'spa';
      case 'mask':
        return 'face';
      case 'eye cream':
        return 'visibility';
      case 'spot treatment':
        return 'local-pharmacy';
      case 'topical treatment':
        return 'medical-services';
      default:
        return 'science';
    }
  };

  const getUsageIcon = (usage: string) => {
    switch (usage.toLowerCase()) {
      case 'morning':
        return 'wb-sunny';
      case 'evening':
        return 'bedtime';
      case 'twice daily':
        return 'update';
      case 'weekly':
        return 'event';
      case 'as needed':
        return 'access-time';
      default:
        return 'schedule';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Skincare Product Recommendations</Text>
        <Text style={styles.subtitle}>
          The following recommendations are tailored to your skin type and specific concerns identified in your analysis. Incorporate these products gradually into your routine for best results.
        </Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Product Type</Text>
        <Text style={styles.headerText}>Recommended Ingredients</Text>
        <Text style={styles.headerText}>Recommended Usage</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {recommendations.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.row,
              index % 2 === 0 ? styles.evenRow : styles.oddRow
            ]}
          >
            <View style={styles.productColumn}>
              <View style={styles.productInfo}>
                <MaterialIcons 
                  name={getProductIcon(item.productType)} 
                  size={20} 
                  color={COLORS.primary.main} 
                  style={styles.icon}
                />
                <View style={styles.productTextContainer}>
                  <Text style={styles.productText}>{item.productType}</Text>
                  {item.reason && (
                    <Text style={styles.reasonText}>{item.reason}</Text>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.ingredientsColumn}>
              <Text style={styles.ingredientText}>{item.recommendedIngredients}</Text>
            </View>

            <View style={styles.usageColumn}>
              <View style={styles.usageInfo}>
                <MaterialIcons 
                  name={getUsageIcon(item.recommendedUsage)} 
                  size={16} 
                  color={COLORS.text.secondary} 
                  style={styles.icon}
                />
                <Text style={styles.usageText}>{item.recommendedUsage}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  titleContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary.main,
    padding: SPACING.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    padding: SPACING.md,
  },
  evenRow: {
    backgroundColor: COLORS.white,
  },
  oddRow: {
    backgroundColor: COLORS.gray[50],
  },
  productColumn: {
    flex: 1,
  },
  ingredientsColumn: {
    flex: 1.5,
  },
  usageColumn: {
    flex: 1,
  },
  headerText: {
    flex: 1,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'left',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productTextContainer: {
    flex: 1,
  },
  icon: {
    marginRight: SPACING.xs,
    marginTop: 2,
  },
  productText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  ingredientText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  usageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usageText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
});

export default SkincareRecommendationsTable; 
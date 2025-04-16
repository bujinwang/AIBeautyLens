import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';
import SkinMatrixHeader from './SkinMatrixHeader';

interface SkincareAdviceProps {
  onClose: () => void;
}

const SkincareAdvice: React.FC<SkincareAdviceProps> = ({ onClose }) => {
  // Sample skincare advice data - in a real app, this would come from the analysis results
  const skincareData = [
    {
      productType: 'Cleanser',
      recommendedIngredients: 'Amino acid-based gentle cleanser',
      recommendedUsage: 'Morning and evening'
    },
    {
      productType: 'Serum',
      recommendedIngredients: 'Niacinamide / Tranexamic Acid',
      recommendedUsage: 'Daytime'
    },
    {
      productType: 'Night Repair',
      recommendedIngredients: 'Hyaluronic Acid Serum / Almond Acid',
      recommendedUsage: 'Evening (2-3 times per week)'
    },
    {
      productType: 'Sunscreen',
      recommendedIngredients: 'Physical SPF 30+ with zinc oxide',
      recommendedUsage: 'Daytime'
    },
    {
      productType: 'Moisturizer',
      recommendedIngredients: 'Ceramide-based, non-comedogenic formula',
      recommendedUsage: 'Morning and evening'
    },
    {
      productType: 'Exfoliant',
      recommendedIngredients: 'BHA (Salicylic Acid) 1-2%',
      recommendedUsage: 'Evening (1-2 times per week)'
    },
    {
      productType: 'Spot Treatment',
      recommendedIngredients: 'Benzoyl Peroxide 2.5%',
      recommendedUsage: 'As needed on active breakouts'
    },
    {
      productType: 'Mask',
      recommendedIngredients: 'Clay-based purifying mask',
      recommendedUsage: 'Once per week'
    }
  ];

  return (
    <View style={styles.container}>
      <SkinMatrixHeader 
        title="Personalized Skincare Advice" 
        subtitle="Recommended product regimen based on your analysis"
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Skincare Product Recommendations (Optional)</Text>
          <Text style={styles.introText}>
            The following recommendations are tailored to your specific skin condition and concerns.
            Incorporate these products gradually into your routine for best results.
          </Text>
        </View>
        
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.productColumn]}>Product Type</Text>
            <Text style={[styles.headerCell, styles.ingredientsColumn]}>Recommended Ingredients</Text>
            <Text style={[styles.headerCell, styles.usageColumn]}>Recommended Usage</Text>
          </View>
          
          {skincareData.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow, 
                index % 2 === 0 ? styles.evenRow : styles.oddRow
              ]}
            >
              <Text style={[styles.cell, styles.productColumn, styles.productText]}>{item.productType}</Text>
              <Text style={[styles.cell, styles.ingredientsColumn]}>{item.recommendedIngredients}</Text>
              <Text style={[styles.cell, styles.usageColumn]}>{item.recommendedUsage}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Important Notes:</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.paper,
  },
  scrollContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  introContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.primary.light + '15', // Light version of primary color with opacity
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
  tableContainer: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginBottom: SPACING.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  headerCell: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
    paddingHorizontal: SPACING.xs,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  evenRow: {
    backgroundColor: COLORS.gray[50],
  },
  oddRow: {
    backgroundColor: COLORS.white,
  },
  cell: {
    paddingHorizontal: SPACING.xs,
    fontSize: 13,
    color: COLORS.text.primary,
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
  productText: {
    fontWeight: '600',
    color: COLORS.primary.main,
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
});

export default SkincareAdvice;

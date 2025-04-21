import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';
import { AnalysisResult } from '../types';
import SkinMatrixHeader from './SkinMatrixHeader';

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
            title="Personalized Skincare Advice" 
            subtitle={`Recommended regimen for ${analysisResult.skinType} skin`}
          />
          
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.introContainer}>
              <Text style={styles.introTitle}>Skincare Product Recommendations</Text>
              <Text style={styles.introText}>
                The following recommendations are tailored to your {analysisResult.skinType} skin type
                and specific concerns identified in your analysis. Incorporate these products
                gradually into your routine for best results.
              </Text>
            </View>
            
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.productColumn]}>Product Type</Text>
                <Text style={[styles.headerCell, styles.ingredientsColumn]}>Recommended Ingredients</Text>
                <Text style={[styles.headerCell, styles.usageColumn]}>Recommended Usage</Text>
              </View>
              
              {analysisResult.skincareRecommendations.map((item, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tableRow, 
                    index % 2 === 0 ? styles.evenRow : styles.oddRow
                  ]}
                >
                  <View style={styles.productCell}>
                    <Text style={[styles.cell, styles.productColumn, styles.productText]}>
                      {item.productType}
                    </Text>
                    {item.reason && (
                      <Text style={styles.reasonText}>{item.reason}</Text>
                    )}
                  </View>
                  <Text style={[styles.cell, styles.ingredientsColumn]}>{item.recommendedIngredients}</Text>
                  <Text style={[styles.cell, styles.usageColumn]}>{item.recommendedUsage}</Text>
                </View>
              ))}
            </View>

            <View style={styles.concernsContainer}>
              <Text style={styles.concernsTitle}>Targeted Concerns:</Text>
              {analysisResult.features.map((feature, index) => (
                <Text key={index} style={styles.concernText}>
                  • {feature.description} (Severity: {feature.severity}/5)
                </Text>
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
  productCell: {
    flex: 1,
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
  reasonText: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    marginTop: 2,
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
});

export default SkincareAdviceModal;

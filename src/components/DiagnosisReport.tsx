import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';
import SkinMatrixHeader from './SkinMatrixHeader';

interface DiagnosisReportProps {
  onClose: () => void;
}

const DiagnosisReport: React.FC<DiagnosisReportProps> = ({ onClose }) => {
  // Sample diagnosis data - in a real app, this would come from the analysis results
  const diagnosisData = [
    {
      category: 'Age Estimation',
      result: '22-26 years',
      explanation: 'Young adult skin, active sebum production period'
    },
    {
      category: 'Skin Type',
      result: 'Combination Oily (T-zone oily, cheeks dry)',
      explanation: 'Characterized by enlarged T-zone pores, blackheads, and occasional breakouts'
    },
    {
      category: 'Primary Concerns',
      result: 'Acne scars (red marks and mild hyperpigmentation), blackheads, localized dryness',
      explanation: 'Mild to moderate post-inflammatory phase, with accompanying microinflammation and uneven texture'
    },
    {
      category: 'Pore Condition',
      result: 'Enlarged pores in T-zone and nose area',
      explanation: 'Related to sebum overproduction and moderate acne history'
    },
    {
      category: 'Overall Assessment',
      result: 'No severe active inflammation, mild to moderate skin concerns',
      explanation: 'Suitable for targeted treatments, cosmetic procedures, and maintenance regimen'
    },
    {
      category: 'Hydration Level',
      result: 'Moderate dehydration (65%)',
      explanation: 'Transepidermal water loss detected, barrier function slightly compromised'
    },
    {
      category: 'Sensitivity Level',
      result: 'Low sensitivity (2/10)',
      explanation: 'Minimal reaction to environmental stressors, suitable for most active ingredients'
    },
    {
      category: 'UV Damage',
      result: 'Minimal (Grade 1)',
      explanation: 'Early signs of photoaging, preventative measures recommended'
    }
  ];

  return (
    <View style={styles.container}>
      <SkinMatrixHeader 
        title="Skin Diagnosis Analysis" 
        subtitle="Comprehensive clinical assessment"
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.categoryColumn]}>Category</Text>
            <Text style={[styles.headerCell, styles.resultColumn]}>Diagnosis</Text>
            <Text style={[styles.headerCell, styles.explanationColumn]}>Explanation</Text>
          </View>
          
          {diagnosisData.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow, 
                index % 2 === 0 ? styles.evenRow : styles.oddRow
              ]}
            >
              <Text style={[styles.cell, styles.categoryColumn, styles.categoryText]}>{item.category}</Text>
              <Text style={[styles.cell, styles.resultColumn]}>{item.result}</Text>
              <Text style={[styles.cell, styles.explanationColumn]}>{item.explanation}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Analysis Notes:</Text>
          <Text style={styles.disclaimerText}>
            This analysis is generated using AI-powered dermatological imaging technology. 
            Results are for informational purposes and do not constitute medical advice. 
            For specific skin concerns, please consult with a dermatologist.
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
  categoryColumn: {
    flex: 1,
  },
  resultColumn: {
    flex: 1.2,
  },
  explanationColumn: {
    flex: 1.8,
  },
  categoryText: {
    fontWeight: '600',
    color: COLORS.primary.main,
  },
  disclaimer: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.main,
  },
  disclaimerTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: SPACING.xs,
    color: COLORS.primary.main,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});

export default DiagnosisReport;

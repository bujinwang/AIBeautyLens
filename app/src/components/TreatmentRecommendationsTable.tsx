import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface Treatment {
  name: string;
  area: string;
  description: string;
  reason: string;
  price: string;
}

interface TreatmentRecommendationsTableProps {
  treatments: Treatment[];
}

const TreatmentRecommendationsTable: React.FC<TreatmentRecommendationsTableProps> = ({ treatments }) => {
  const [iconError, setIconError] = useState<string | null>(null);

  const getTreatmentIcon = (name: string) => {
    const treatmentName = name.toLowerCase();
    console.log('Getting icon for treatment:', treatmentName);
    
    let iconName: keyof typeof Ionicons.glyphMap = 'person-outline';
    switch (treatmentName) {
      case 'picosecond laser':
        iconName = 'flash-outline';
        break;
      case 'hydrofacial':
        iconName = 'water-outline';
        break;
      case 'prp':
        iconName = 'medical-outline';
        break;
      default:
        iconName = 'person-outline';
    }
    
    console.log('Selected icon name:', iconName);
    return iconName;
  };

  const renderIcon = (iconName: keyof typeof Ionicons.glyphMap) => {
    try {
      return (
        <Ionicons 
          name={iconName}
          size={24}
          color={COLORS.primary.main}
          style={styles.icon}
          onError={(error: Error) => {
            console.error('Icon loading error:', error);
            setIconError(`Failed to load icon: ${iconName}`);
          }}
        />
      );
    } catch (error) {
      console.error('Icon rendering error:', error);
      setIconError(`Failed to render icon: ${iconName}`);
      return null;
    }
  };

  if (iconError) {
    console.warn('Icon loading error:', iconError);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Treatments</Text>
      <Text style={styles.subtitle}>
        Based on your facial analysis, the following treatments are recommended:
      </Text>

      <ScrollView style={styles.scrollContainer}>
        {treatments.map((treatment, index) => {
          const iconName = getTreatmentIcon(treatment.name);
          console.log(`Treatment ${index}:`, treatment.name, 'Icon:', iconName);
          
          return (
            <View key={index} style={styles.treatmentCard}>
              <View style={styles.headerRow}>
                <View style={styles.titleSection}>
                  {renderIcon(iconName)}
                  <View>
                    <Text style={styles.treatmentName}>{treatment.name}</Text>
                    <Text style={styles.areaText}>Area: {treatment.area}</Text>
                  </View>
                </View>
                <Text style={styles.priceText}>{treatment.price}</Text>
              </View>

              <Text style={styles.descriptionText}>{treatment.description}</Text>
              
              <View style={styles.reasonSection}>
                <Text style={styles.reasonLabel}>Why it's recommended:</Text>
                <Text style={styles.reasonText}>{treatment.reason}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    marginHorizontal: SPACING.md,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  scrollContainer: {
    flex: 1,
  },
  treatmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  areaText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.main,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  reasonSection: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default TreatmentRecommendationsTable; 
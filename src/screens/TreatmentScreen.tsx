import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import Card from '../components/Card';
import Button from '../components/Button';
import GenderConfidenceDisplay from '../components/GenderConfidenceDisplay';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';

type TreatmentScreenRouteProp = RouteProp<RootStackParamList, 'Treatment'>;
type TreatmentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Treatment'>;

type Props = {
  route: TreatmentScreenRouteProp;
  navigation: TreatmentScreenNavigationProp;
};

// Update RootStackParamList in ../App.tsx to include these parameters
interface TreatmentParams {
  analysisResult: {
    gender: string;
    genderConfidence?: number;
    estimatedAge: number;
    skinType: string;
    features: Array<any>;
    recommendations: Array<{
      treatmentId: string;
      reason: string;
    }>;
  };
  imageUri: string;
  base64Image: string;
}

interface SimulationParams {
  analysisResult: TreatmentParams['analysisResult'];
  selectedTreatments: string[];
  imageUri: string;
  base64Image: string;
}

const TreatmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { analysisResult, imageUri, base64Image } = route.params as TreatmentParams;
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);

  useEffect(() => {
    // Set up navigation options
    navigation.setOptions({
      headerStyle: {
        backgroundColor: COLORS.primary.main,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: COLORS.white,
      headerTitle: `Treatment Recommendations (${analysisResult.gender} · ${analysisResult.estimatedAge} yrs)`,
      headerTitleStyle: {
        fontWeight: '600',
      },
      // Note: headerSubtitle is removed as it's not a valid property
    });
  }, []);

  const handleTreatmentSelect = (treatmentId: string) => {
    setSelectedTreatment(treatmentId);
  };

  const handleNext = () => {
    if (selectedTreatment) {
      navigation.navigate('Simulation', {
        analysisResult,
        selectedTreatments: [selectedTreatment],
        imageUri,
        base64Image,
      } as SimulationParams);
    }
  };

  // Find unique treatment IDs to avoid duplicates
  const uniqueTreatmentIds = [...new Set(analysisResult.recommendations.map((rec) => rec.treatmentId))];
  
  // Treatment data mapping
  const treatmentData: { [key: string]: { title: string; description: string; icon: string; benefits: string[] } } = {
    'botox': {
      title: 'Botox Injection',
      description: 'Reduces the appearance of facial wrinkles by temporarily paralyzing muscles.',
      icon: 'healing',
      benefits: [
        'Minimizes fine lines and wrinkles',
        'Non-surgical procedure with minimal downtime',
        'Results last 3-4 months',
        'Can prevent wrinkles from deepening over time'
      ]
    },
    'filler': {
      title: 'Dermal Filler',
      description: 'Soft tissue filler injected to restore volume and fullness to the skin.',
      icon: 'invert-colors',
      benefits: [
        'Restores lost volume in hollow areas',
        'Smooths deep lines and creases',
        'Enhances facial contours',
        'Results last 6-18 months depending on product'
      ]
    },
    'chemical_peel': {
      title: 'Chemical Peel',
      description: 'A solution applied to the skin that exfoliates and eventually peels off.',
      icon: 'bolt',
      benefits: [
        'Improves skin texture and tone',
        'Reduces sun damage and age spots',
        'Helps clear acne and reduce scarring',
        'Available in different strengths for customized treatment'
      ]
    },
    'microdermabrasion': {
      title: 'Microdermabrasion',
      description: 'A minimally invasive procedure that exfoliates and removes the superficial layer of skin.',
      icon: 'grain',
      benefits: [
        'Improves skin texture and tone',
        'Reduces the appearance of fine lines',
        'Minimizes pores and mild acne scars',
        'No downtime required after treatment'
      ]
    },
    'laser_therapy': {
      title: 'Laser Therapy',
      description: 'Using focused light therapy to treat skin concerns like pigmentation and scars.',
      icon: 'flare',
      benefits: [
        'Targets specific skin concerns without affecting surrounding tissue',
        'Stimulates collagen production',
        'Reduces hyperpigmentation and redness',
        'Improves overall skin appearance'
      ]
    },
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Recommended Treatments</Text>
          <Text style={styles.subheading}>
            Based on your {analysisResult.gender.toLowerCase()} facial analysis, age {analysisResult.estimatedAge}, {analysisResult.skinType.toLowerCase()} skin
          </Text>
        </View>

        <Card
          variant="elevated"
          title="Your Analysis Summary"
          icon="face-retouching-natural"
          style={styles.summaryCard}
        >
          <View style={styles.analysisSummary}>
            <View style={styles.summaryImageContainer}>
              <Image source={{ uri: imageUri }} style={styles.summaryImage} />
            </View>
            <View style={styles.summaryDetails}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Age:</Text>
                <Text style={styles.summaryValue}>{analysisResult.estimatedAge} years</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Gender:</Text>
                <View style={styles.summaryValueContainer}>
                  <GenderConfidenceDisplay 
                    gender={analysisResult.gender}
                    confidence={analysisResult.genderConfidence || 0}
                    size="small"
                  />
                </View>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Skin Type:</Text>
                <Text style={styles.summaryValue}>{analysisResult.skinType}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Features:</Text>
                <Text style={styles.summaryValue}>{analysisResult.features.length} identified</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Select a Treatment</Text>
        
        {uniqueTreatmentIds.map((treatmentId) => {
          const treatment = treatmentData[treatmentId as keyof typeof treatmentData] || {
            title: treatmentId,
            description: 'No description available',
            icon: 'help-outline',
            benefits: []
          };
          
          // Find all reasons for this treatment
          const reasons = analysisResult.recommendations
            .filter((rec) => rec.treatmentId === treatmentId)
            .map((rec) => rec.reason);
          
          return (
            <Card
              key={treatmentId}
              variant={selectedTreatment === treatmentId ? "premium" : "outlined"}
              elevation={selectedTreatment === treatmentId ? "medium" : "small"}
              title={treatment.title}
              icon={treatment.icon}
              bordered={selectedTreatment === treatmentId}
              style={selectedTreatment === treatmentId ? 
                { ...styles.treatmentCard, ...styles.selectedTreatmentCard } : 
                styles.treatmentCard
              }
              onPress={() => handleTreatmentSelect(treatmentId)}
            >
              <Text style={styles.treatmentDescription}>{treatment.description}</Text>
              
              <View style={styles.recommendedForSection}>
                <Text style={styles.reasonTitle}>Recommended for you because:</Text>
                {reasons.map((reason, index) => (
                  <View key={index} style={styles.reasonItem}>
                    <MaterialIcons 
                      name="check-circle" 
                      size={18} 
                      color={COLORS.success.main} 
                      style={styles.reasonIcon} 
                    />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
              
              {selectedTreatment === treatmentId && (
                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsTitle}>Key Benefits:</Text>
                  {treatment.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <MaterialIcons 
                        name="star" 
                        size={16} 
                        color={COLORS.gold.main} 
                        style={styles.benefitIcon} 
                      />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
        
        <Button
          title="Generate Before/After Simulation"
          variant="primary"
          size="large"
          icon="auto-fix-high"
          disabled={!selectedTreatment}
          onPress={handleNext}
          style={styles.nextButton}
          fullWidth={true}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  headingContainer: {
    marginBottom: SPACING.lg,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  summaryCard: {
    marginBottom: SPACING.xl,
  },
  analysisSummary: {
    flexDirection: 'row',
  },
  summaryImageContainer: {
    marginRight: SPACING.md,
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  summaryDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    width: 80,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  summaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  treatmentCard: {
    marginBottom: SPACING.md,
  },
  selectedTreatmentCard: {
    borderColor: COLORS.primary.main,
  },
  treatmentDescription: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  recommendedForSection: {
    marginTop: SPACING.sm,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  reasonIcon: {
    marginRight: SPACING.xs,
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  benefitsSection: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.primary.light,
    borderRadius: BORDER_RADIUS.sm,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.dark,
    marginBottom: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  benefitIcon: {
    marginRight: SPACING.xs,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary.dark,
  },
  nextButton: {
    marginVertical: SPACING.xl,
  },
});

export default TreatmentScreen; 
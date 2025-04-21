import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import { TREATMENTS } from '../constants/treatments';

type RecommendedTreatmentsScreenRouteProp = RouteProp<RootStackParamList, 'RecommendedTreatments'>;
type RecommendedTreatmentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecommendedTreatments'>;

type Props = {
  route: RecommendedTreatmentsScreenRouteProp;
  navigation: RecommendedTreatmentsScreenNavigationProp;
};

interface TreatmentParams {
  imageUri: string;
  base64Image: string;
  recommendedTreatments: string[];
  reasons: { [key: string]: string[] };
  visitPurpose?: string;
  appointmentLength?: string;
}

interface SimulationParams {
  selectedTreatments: string[];
  imageUri: string;
  base64Image: string;
  visitPurpose?: string;
  appointmentLength?: string;
}

const RecommendedTreatmentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const {
    imageUri = "",
    base64Image = "",
    recommendedTreatments = [],
    reasons = {},
    visitPurpose,
    appointmentLength
  } = route.params as TreatmentParams;

  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Set up the header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Recommended Treatments',
      headerTintColor: '#FFFFFF',
      headerStyle: {
        backgroundColor: '#4A90E2',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
    });
  }, [navigation]);

  // Calculate total price whenever selectedTreatments changes
  useEffect(() => {
    const newTotal = selectedTreatments.reduce((sum, id) => {
      const treatment = TREATMENTS.find(t => t.id === id);
      return sum + (treatment?.price || 0);
    }, 0);
    setTotalPrice(newTotal);
  }, [selectedTreatments]);

  // Toggle treatment selection
  const toggleTreatmentSelection = (treatmentId: string) => {
    setSelectedTreatments(prev => {
      if (prev.includes(treatmentId)) {
        return prev.filter(id => id !== treatmentId);
      } else {
        return [...prev, treatmentId];
      }
    });
  };

  // Handle continue to report
  const handleContinue = () => {
    if (selectedTreatments.length === 0) {
      return;
    }

    navigation.navigate('Report', {
      treatmentIds: selectedTreatments,
      beforeImage: base64Image,
    });
  };

  // Render a treatment card
  const renderTreatmentCard = (treatmentId: string) => {
    const treatment = TREATMENTS.find(t => t.id === treatmentId);
    if (!treatment) return null;

    const isSelected = selectedTreatments.includes(treatmentId);
    const reasonsForTreatment = reasons[treatmentId] || [];

    return (
      <TouchableOpacity
        key={treatmentId}
        style={[styles.treatmentCard, isSelected && styles.selectedTreatmentCard]}
        onPress={() => toggleTreatmentSelection(treatmentId)}
        activeOpacity={0.7}
      >
        <View style={styles.treatmentHeader}>
          <Text style={styles.treatmentName} numberOfLines={1}>{treatment.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.treatmentPrice}>${treatment.price}</Text>
            {isSelected && (
              <View style={styles.checkmarkBadge}>
                <MaterialIcons name="check" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.treatmentContent}>
          <Text style={styles.areaLabel}>Area: {treatment.area}</Text>

          <Text style={styles.treatmentDescription}>
            {treatment.description}
          </Text>

          {reasonsForTreatment.length > 0 && (
            <View style={styles.reasonSection}>
              <Text style={styles.reasonTitle}>Why it's recommended:</Text>
              <Text style={styles.reasonText}>{reasonsForTreatment[0]}</Text>
            </View>
          )}
        </View>


      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Recommended Treatments</Text>
          <Text style={styles.subheading}>
            Based on your facial analysis, the following treatments are recommended:
          </Text>
        </View>

        <View style={styles.treatmentsContainer}>
          {recommendedTreatments.map(treatmentId => renderTreatmentCard(treatmentId))}
        </View>
      </ScrollView>

      {/* Footer with total and continue button */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.selectedTreatmentsText}>
            Selected Treatments: {selectedTreatments.length}
          </Text>
          <Text style={styles.totalPriceText}>
            Total: <Text style={styles.totalPriceAmount}>${totalPrice}</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedTreatments.length === 0 && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={selectedTreatments.length === 0}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>View Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Extra padding for footer
  },
  headingContainer: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  treatmentsContainer: {
    marginTop: 16,
  },
  treatmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  selectedTreatmentCard: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    shadowColor: '#4A90E2',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  treatmentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
    marginRight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  treatmentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
  },
  checkmarkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  treatmentContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  areaLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  treatmentDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    marginBottom: 12,
  },
  reasonSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  reasonText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTreatmentsText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  totalPriceText: {
    fontSize: 16,
    color: '#333333',
  },
  totalPriceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RecommendedTreatmentsScreen;

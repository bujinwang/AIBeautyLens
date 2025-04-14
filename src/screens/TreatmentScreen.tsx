import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { TREATMENTS } from '../constants/treatments';

type TreatmentScreenRouteProp = RouteProp<RootStackParamList, 'Treatment'>;
type TreatmentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Treatment'>;

type Props = {
  route: TreatmentScreenRouteProp;
  navigation: TreatmentScreenNavigationProp;
};

const TreatmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { analysisResult, imageUri } = route.params;
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [recommendedTreatments, setRecommendedTreatments] = useState<any[]>([]);

  useEffect(() => {
    // Map recommended treatment IDs to full treatment objects
    const treatments = analysisResult.recommendations.map((rec: { treatmentId: string; reason: string }) => {
      const treatment = TREATMENTS.find(t => t.id === rec.treatmentId);
      return {
        ...treatment,
        reason: rec.reason
      };
    }).filter(Boolean);
    
    setRecommendedTreatments(treatments);
  }, []);

  const toggleTreatment = (treatmentId: string) => {
    setSelectedTreatments(prev => 
      prev.includes(treatmentId)
        ? prev.filter(id => id !== treatmentId)
        : [...prev, treatmentId]
    );
  };

  const handleContinue = async () => {
    if (selectedTreatments.length === 0) {
      alert('Please select at least one treatment');
      return;
    }

    // Get base64 image from imageUri if needed
    // In a real app, you might need to convert imageUri to base64 here
    // For now, assuming we have it available from previous screen
    // For simplicity, we'll pass a string description of treatments

    const treatmentDescriptions = selectedTreatments
      .map(id => {
        const treatment = TREATMENTS.find(t => t.id === id);
        return treatment ? treatment.name : '';
      })
      .filter(Boolean)
      .join(', ');

    // Pass on to simulation screen
    navigation.navigate('Simulation', {
      selectedTreatments,
      imageUri,
      base64Image: '', // You would need to fill this from the previous screen
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Recommended Treatments</Text>
          <Text style={styles.subtitle}>
            Based on your facial analysis, the following treatments are recommended:
          </Text>
        </View>

        <View style={styles.treatmentsContainer}>
          {recommendedTreatments.map((treatment) => (
            <TouchableOpacity
              key={treatment.id}
              style={[
                styles.treatmentCard,
                selectedTreatments.includes(treatment.id) && styles.selectedCard
              ]}
              onPress={() => toggleTreatment(treatment.id)}
            >
              <View style={styles.treatmentContent}>
                <View style={styles.treatmentHeader}>
                  <Text style={styles.treatmentName}>{treatment.name}</Text>
                  <Text style={styles.treatmentPrice}>${treatment.price}</Text>
                </View>
                <Text style={styles.treatmentArea}>Area: {treatment.area}</Text>
                <Text style={styles.treatmentDescription}>{treatment.description}</Text>
                <Text style={styles.recommendationReason}>Why it's recommended: {treatment.reason}</Text>
              </View>

              <View style={styles.checkboxContainer}>
                <View 
                  style={[
                    styles.checkbox,
                    selectedTreatments.includes(treatment.id) && styles.checkboxSelected
                  ]}
                >
                  {selectedTreatments.includes(treatment.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>
            Selected Treatments: {selectedTreatments.length}
          </Text>
          <Text style={styles.summaryTotal}>
            Total: ${selectedTreatments.reduce((total, id) => {
              const treatment = TREATMENTS.find(t => t.id === id);
              return total + (treatment ? treatment.price : 0);
            }, 0)}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            Continue to Simulation
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  treatmentsContainer: {
    padding: 16,
  },
  treatmentCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#4361ee',
    borderWidth: 2,
  },
  treatmentContent: {
    flex: 1,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  treatmentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  treatmentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  treatmentArea: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendationReason: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  checkboxContainer: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4361ee',
    borderColor: '#4361ee',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
  },
  summaryContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#4361ee',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TreatmentScreen; 
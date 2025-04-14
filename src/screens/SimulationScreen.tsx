import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { TREATMENTS } from '../constants/treatments';
import { generateTreatmentSimulation } from '../services/deepseekImageService';
import * as FileSystem from 'expo-file-system';

type SimulationScreenRouteProp = RouteProp<RootStackParamList, 'Simulation'>;
type SimulationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Simulation'>;

type Props = {
  route: SimulationScreenRouteProp;
  navigation: SimulationScreenNavigationProp;
};

const SimulationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { selectedTreatments, imageUri, base64Image } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationImage, setSimulationImage] = useState<string | null>(null);
  
  useEffect(() => {
    generateSimulation();
  }, []);

  const generateSimulation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get descriptions for selected treatments
      const treatmentDescriptions = selectedTreatments
        .map(id => {
          const treatment = TREATMENTS.find(t => t.id === id);
          return treatment ? treatment.name : '';
        })
        .filter(Boolean)
        .join(', ');

      // Get base64 image if not provided
      let base64ImageData = base64Image;
      if (!base64ImageData && imageUri) {
        base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Generate simulation using DeepSeek AI
      const imageUrl = await generateTreatmentSimulation(base64ImageData, treatmentDescriptions);
      setSimulationImage(imageUrl);
    } catch (error) {
      console.error('Error in simulation:', error);
      setError('Failed to generate simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = () => {
    if (simulationImage) {
      navigation.navigate('Report', {
        treatmentIds: selectedTreatments,
        beforeImage: imageUri,
        afterImage: simulationImage,
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Treatment Simulation</Text>
        <Text style={styles.subtitle}>
          See the potential results of your selected treatments
        </Text>
      </View>

      <View style={styles.comparisonContainer}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Before</Text>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
        
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>After (Simulated)</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4361ee" />
              <Text style={styles.loadingText}>Generating simulation...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={generateSimulation}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : simulationImage ? (
            <Image source={{ uri: simulationImage }} style={styles.image} />
          ) : null}
        </View>
      </View>

      <View style={styles.selectedTreatmentsContainer}>
        <Text style={styles.sectionTitle}>Selected Treatments</Text>
        {selectedTreatments.map(id => {
          const treatment = TREATMENTS.find(t => t.id === id);
          if (!treatment) return null;
          
          return (
            <View key={id} style={styles.treatmentItem}>
              <Text style={styles.treatmentName}>{treatment.name}</Text>
              <Text style={styles.treatmentPrice}>${treatment.price}</Text>
            </View>
          );
        })}
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            ${selectedTreatments.reduce((total, id) => {
              const treatment = TREATMENTS.find(t => t.id === id);
              return total + (treatment ? treatment.price : 0);
            }, 0)}
          </Text>
        </View>
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          Note: This is a computer-generated simulation for reference only. 
          Actual results may vary based on individual factors. 
          Please consult with a qualified specialist for personalized advice.
        </Text>
      </View>

      <TouchableOpacity 
        style={[
          styles.reportButton,
          (loading || !simulationImage) && styles.disabledButton
        ]} 
        onPress={handleViewReport}
        disabled={loading || !simulationImage}
      >
        <Text style={styles.reportButtonText}>
          View Treatment Report
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  imageContainer: {
    width: '48%',
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  loadingContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  errorContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#d00',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
  },
  selectedTreatmentsContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  treatmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  treatmentName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    paddingRight: 8,
  },
  treatmentPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  disclaimerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reportButton: {
    backgroundColor: '#4361ee',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b3bae3',
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SimulationScreen; 
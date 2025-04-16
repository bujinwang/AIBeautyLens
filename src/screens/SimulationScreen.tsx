import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TREATMENTS } from '../constants/treatments';
import { RootStackParamList } from '../App';
import { generateSimulation, SimulationResult } from '../services/simulationService';
import { FontAwesome } from '@expo/vector-icons';
import Button from '../components/Button';
import { isUsingOAuth } from '../config/api';

type SimulationScreenRouteProp = RouteProp<RootStackParamList, 'Simulation'>;
type SimulationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Simulation'>;

type Props = {
  route: SimulationScreenRouteProp;
  navigation: SimulationScreenNavigationProp;
};

interface Treatment {
  id: string;
  name: string;
  price: number;
  description: string;
}

const SimulationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { base64Image, selectedTreatments, imageUri } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsOAuth, setNeedsOAuth] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null); // Ref to hold the AbortController

  // Get treatment objects from the selected treatment IDs
  const selectedTreatmentObjects = selectedTreatments.map((id: string) =>
    TREATMENTS.find(t => t.id === id)
  ).filter((t): t is typeof TREATMENTS[0] => t !== undefined);

  // Get treatment names from the selected treatments array
  const treatmentNames = selectedTreatmentObjects.map(treatment => treatment.name);

  // Calculate total price
  const totalPrice = selectedTreatmentObjects.reduce((sum, treatment) => sum + (treatment?.price || 0), 0);

  // Initialize AbortController on component mount
  useEffect(() => {
    // Create a new AbortController for this effect instance
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Set initial state - not loading
    setIsLoading(false);
    setError(null);
    setSimulationResult(null);

    // Check OAuth configuration
    const checkOAuth = async () => {
      const usingOAuth = await isUsingOAuth();
      if (!usingOAuth) {
        setError('OAuth authentication required. Please set up OAuth in Settings before generating simulations.');
        setNeedsOAuth(true);
      }
    };

    checkOAuth();

    // Cleanup function
    return () => {
      controller.abort();
      abortControllerRef.current = null;
    };
  }, []);

  // Function to start simulation when user explicitly requests it
  const startSimulation = async () => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }

    const controller = abortControllerRef.current;
    let isMounted = true;

    try {
      setIsLoading(true);
      setError(null);
      setSimulationResult(null);

      // Check OAuth configuration before proceeding
      const usingOAuth = await isUsingOAuth();
      if (!usingOAuth) {
        setError('OAuth authentication required. Please set up OAuth in Settings before generating simulations.');
        setNeedsOAuth(true);
        setIsLoading(false);
        return;
      }

      // Check if already aborted
      if (controller.signal.aborted) {
        console.log('Request was already aborted');
        return;
      }

      // Pass the array of treatment names and AbortSignal to generateSimulation
      const result = await generateSimulation(base64Image, treatmentNames, controller.signal);

      // Check if not aborted before updating state
      if (!controller.signal.aborted && result) {
        setSimulationResult(result);
        setError(null);
      }
    } catch (err) {
      // Only handle errors if not aborted
      if (controller.signal.aborted) return;

      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log('Simulation error:', errorMessage);

      if (errorMessage.includes('OAuth') || errorMessage.includes('authentication')) {
        setError('OAuth authentication required. Please set up OAuth in Settings before generating simulations.');
        setNeedsOAuth(true);
      } else if (errorMessage.toLowerCase().includes('abort') || errorMessage.toLowerCase().includes('cancel')) {
        // Clear states for abort/cancel
        setSimulationResult(null);
        setError(null);
      } else {
        console.error('Simulation error:', err);
        setError('Failed to generate simulation. Please try again.');
        setSimulationResult(null);
      }
    } finally {
      // Only update loading state if not in the process of aborting
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const handleProceed = () => {
    if (!simulationResult) return;

    navigation.navigate('Report', {
      beforeImage: base64Image,
      afterImage: simulationResult.simulatedImageBase64,
      treatmentIds: selectedTreatments
    });
  };

  const handleBack = () => {
    // Cancel any ongoing operations
    if (abortControllerRef.current) {
      console.log('Aborting simulation request...');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear all states immediately
    setIsLoading(false);
    setError(null);
    setSimulationResult(null);

    // Navigate back immediately
    navigation.goBack();
  };

  // Add a button to start the simulation
  const handleStartSimulation = () => {
    startSimulation();
  };

  const handleGoToOAuthSetup = () => {
    navigation.navigate('OAuthSetup');
  };

  return (
    <View style={styles.container}>
      {/* Full-screen loading overlay */}
      {isLoading && (
        <View style={styles.fullScreenLoadingOverlay}>
          <View style={styles.loadingContentContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.fullScreenLoadingText}>
              {abortControllerRef.current?.signal.aborted
                ? 'Cancelling...'
                : 'Generating simulation...'}
            </Text>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        <Text style={styles.heading}>Treatment Simulation</Text>

        {/* OAuth Configuration Alert */}
        {needsOAuth && (
          <TouchableOpacity
            style={styles.oauthAlertContainer}
            onPress={handleGoToOAuthSetup}
          >
            <FontAwesome name="google" size={20} color="#FFFFFF" style={styles.oauthAlertIcon} />
            <View style={styles.oauthAlertContent}>
              <Text style={styles.oauthAlertTitle}>
                Google Cloud Authentication Required
              </Text>
              <Text style={styles.oauthAlertText}>
                Set up OAuth credentials to enable image generation with Vertex AI
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#FFFFFF" style={styles.oauthAlertArrow} />
          </TouchableOpacity>
        )}

        {/* List of selected treatments */}
        <View style={styles.treatmentsContainer}>
          <Text style={styles.subheading}>Selected Treatments:</Text>
          {selectedTreatmentObjects.map((treatment, index) => (
            <View key={index} style={styles.treatmentItem}>
              <Text style={styles.treatmentName}>{treatment.name}</Text>
              <Text style={styles.treatmentPrice}>${treatment.price.toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>${totalPrice.toLocaleString()}</Text>
          </View>
        </View>

        {/* Before and After Images */}
        <View style={styles.imagesContainer}>
          <View style={styles.imageWrapper}>
            <Text style={styles.imageLabel}>BEFORE</Text>
            <Image
              source={{ uri: `data:image/jpeg;base64,${base64Image}` }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          <View style={styles.imageWrapper}>
            <Text style={styles.imageLabel}>AFTER</Text>
            {isLoading ? (
              <View style={[styles.image, styles.placeholderContainer]}>
                <Text style={styles.placeholderText}>Simulation in progress...</Text>
              </View>
            ) : error ? (
              <View style={[styles.image, styles.errorContainer]}>
                <FontAwesome name="exclamation-circle" size={40} color="#E53935" />
                <Text style={styles.errorText}>{error}</Text>
                {error.includes('OAuth') && (
                  <View>
                    <Text style={styles.oauthErrorInfo}>
                      Vertex AI's Imagen API requires OAuth authentication with Google Cloud.
                    </Text>
                    <TouchableOpacity
                      style={styles.oauthButton}
                      onPress={handleGoToOAuthSetup}
                    >
                      <Text style={styles.oauthButtonText}>Set Up OAuth</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <Image
                source={{ uri: `data:image/jpeg;base64,${simulationResult?.simulatedImageBase64}` }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* Treatment Effects */}
        {!isLoading && !error && simulationResult && (
          <View style={styles.effectsContainer}>
            <Text style={styles.subheading}>Expected Effects:</Text>
            {simulationResult.effects.map((effect, index) => (
              <View key={index} style={styles.effectItem}>
                <FontAwesome name="check-circle" size={16} color="#4CAF50" style={styles.effectIcon} />
                <Text style={styles.effectText}>{effect}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.disclaimer}>
          <FontAwesome name="info-circle" size={16} color="#757575" style={styles.disclaimerIcon} />
          <Text style={styles.disclaimerText}>
            This is a simulation only. Actual results may vary depending on individual factors.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Back"
          onPress={handleBack}
          variant="secondary"
          disabled={false} // Explicitly set to false to ensure it's always enabled
          loading={false}  // Explicitly set to false to ensure it's never in loading state
        />
        {!simulationResult && !isLoading && (
          <Button
            title="Generate Simulation"
            onPress={startSimulation}
            variant="primary"
            disabled={isLoading}
          />
        )}
        {simulationResult && !isLoading && (
          <Button
            title="Proceed"
            onPress={handleProceed}
            disabled={!!error}
            variant="primary"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  treatmentsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  treatmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  treatmentName: {
    fontSize: 16,
    flex: 1,
  },
  treatmentPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageWrapper: {
    width: '48%',
  },
  imageLabel: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#757575',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    padding: 20,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 20,
  },
  effectsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  effectIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  effectText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#757575',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  oauthButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  oauthErrorInfo: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 10,
  },
  oauthAlertContainer: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  oauthAlertIcon: {
    marginRight: 10,
  },
  oauthAlertContent: {
    flex: 1,
  },
  oauthAlertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  oauthAlertText: {
    fontSize: 12,
    color: 'white',
  },
  oauthAlertArrow: {
    marginLeft: 10,
  },
  fullScreenLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContentContainer: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreenLoadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: '#E53935',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SimulationScreen;

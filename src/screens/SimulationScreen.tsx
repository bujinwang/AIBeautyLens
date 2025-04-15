import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { TREATMENTS } from '../constants/treatments';
import { generateTreatmentSimulation, simulateImprovementsWithDescription, generateSkinImprovementWithInpainting } from '../services/geminiService';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';

type SimulationScreenRouteProp = RouteProp<RootStackParamList, 'Simulation'>;
type SimulationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Simulation'>;

type Props = {
  route: SimulationScreenRouteProp;
  navigation: SimulationScreenNavigationProp;
};

type SimulationMode = 'sameFace' | 'aiGenerated' | 'inpainting';

const SimulationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { selectedTreatments, imageUri, base64Image } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationImage, setSimulationImage] = useState<string | null>(null);
  const [treatmentDescription, setTreatmentDescription] = useState<string | null>(null);
  const [showRealisticSimulation, setShowRealisticSimulation] = useState(true);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('sameFace');
  const [showCallouts, setShowCallouts] = useState(true);
  
  useEffect(() => {
    generateSimulation();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Text style={styles.headerTitle}>TreatmentVision™ Simulation</Text>,
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCallouts(!showCallouts)}
          >
            <MaterialIcons
              name={showCallouts ? "chat-bubble" : "chat-bubble-outline"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowRealisticSimulation(!showRealisticSimulation)}
          >
            <MaterialIcons
              name={showRealisticSimulation ? "compare" : "face"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, showRealisticSimulation, showCallouts]);

  const generateSimulation = async () => {
    if (!selectedTreatments || selectedTreatments.length === 0) {
      setError('No treatments selected');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Get treatment descriptions for the prompt
      const treatmentDescriptions = selectedTreatments
        .map(treatment => {
          const treatmentObj = TREATMENTS.find(t => t.id === treatment);
          return treatmentObj ? treatmentObj.name : '';
        })
        .join(', ');

      // Run different simulations based on selected mode
      if (simulationMode === 'inpainting') {
        try {
          // Use inpainting approach (best for preserving identity)
          console.log('Running inpainting simulation...');
          const inpaintedImage = await generateSkinImprovementWithInpainting(
            base64Image,
            treatmentDescriptions
          );
          setSimulationImage(inpaintedImage);
          setTreatmentDescription("Skin improvements applied using our DermaPrecision™ Technology that preserves your exact facial features.");
        } catch (err) {
          console.error('Inpainting failed, falling back to same face mode:', err);
          // If inpainting fails, fall back to same face mode
          setSimulationMode('sameFace');
          const descriptionResult = await simulateImprovementsWithDescription(
            base64Image,
            treatmentDescriptions
          );
          setSimulationImage(descriptionResult.imageUrl);
          setTreatmentDescription(descriptionResult.description);
        }
      } else if (simulationMode === 'aiGenerated') {
        // Use AI image generation (less accurate for identity)
        console.log('Running AI generation simulation...');
        const generatedImage = await generateTreatmentSimulation(
          base64Image,
          treatmentDescriptions
        );
        setSimulationImage(generatedImage);
        setTreatmentDescription("AestheticVision™ generated visualization of potential skin improvements. Note that facial features may differ from your actual appearance.");
      } else {
        // Use same face mode (default, most accurate for identity)
        console.log('Running same face simulation...');
        const descriptionResult = await simulateImprovementsWithDescription(
          base64Image,
          treatmentDescriptions
        );
        setSimulationImage(descriptionResult.imageUrl);
        setTreatmentDescription(descriptionResult.description);
      }
    } catch (err) {
      console.error('Simulation error:', err);
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
        <Text style={styles.title}>TreatmentVision™ Technology</Text>
        <Text style={styles.subtitle}>
          Transform consultation to transformation with a single photo
        </Text>
      </View>

      {/* Mode selection buttons */}
      <View style={styles.simulationModeContainer}>
        <Text style={styles.sectionTitle}>Visualization Mode:</Text>
        
        <View style={styles.modeButtons}>
          <TouchableOpacity 
            style={[styles.modeButton, simulationMode === 'sameFace' && styles.selectedMode]}
            onPress={() => {
              setSimulationMode('sameFace');
              setLoading(true);
              setTimeout(() => generateSimulation(), 100);
            }}>
            <MaterialIcons name="face" size={20} color={simulationMode === 'sameFace' ? "#1976d2" : "#666"} />
            <Text style={[styles.modeButtonText, simulationMode === 'sameFace' && styles.selectedModeText]}>Clinical View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, simulationMode === 'inpainting' && styles.selectedMode]}
            onPress={() => {
              setSimulationMode('inpainting');
              setLoading(true);
              setTimeout(() => generateSimulation(), 100);
            }}>
            <MaterialIcons name="brush" size={20} color={simulationMode === 'inpainting' ? "#1976d2" : "#666"} />
            <Text style={[styles.modeButtonText, simulationMode === 'inpainting' && styles.selectedModeText]}>Precision Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, simulationMode === 'aiGenerated' && styles.selectedMode]}
            onPress={() => {
              setSimulationMode('aiGenerated');
              setLoading(true);
              setTimeout(() => generateSimulation(), 100);
            }}>
            <MaterialIcons name="auto-awesome" size={20} color={simulationMode === 'aiGenerated' ? "#1976d2" : "#666"} />
            <Text style={[styles.modeButtonText, simulationMode === 'aiGenerated' && styles.selectedModeText]}>Enhanced View</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.modeDescription}>
          {simulationMode === 'sameFace' && "SkinMatrix™ analysis with detailed description of expected improvements."}
          {simulationMode === 'inpainting' && "DermaPrecision™ Technology applies precise skin edits that preserve your facial structure."}
          {simulationMode === 'aiGenerated' && "AestheticVision™ AI-generated simulation with enhanced beauty features."}
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
              <ActivityIndicator size="large" color="#9932CC" />
              <Text style={styles.loadingText}>Generating your simulation...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={generateSimulation}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : simulationImage ? (
            <>
              <Image 
                source={{ uri: simulationMode === 'sameFace' ? imageUri : simulationImage }} 
                style={styles.image} 
              />
              {simulationMode === 'sameFace' && treatmentDescription && (
                <View style={styles.descriptionOverlay}>
                  <Text style={styles.descriptionText}>
                    {treatmentDescription}
                  </Text>
                </View>
              )}
              {simulationMode !== 'sameFace' && (
                <View>
                  {/* Treatment callouts - specific improvement points */}
                  {showCallouts && (
                    <>
                      <View style={[styles.callout, { top: '25%', left: '20%' }]}>
                        <View style={styles.calloutLine} />
                        <View style={styles.calloutBubble}>
                          <Text style={styles.calloutText}>
                            Picosecond Laser
                          </Text>
                          <Text style={styles.calloutSubText}>
                            Reduced visible acne scars
                          </Text>
                        </View>
                      </View>
                      
                      <View style={[styles.callout, { top: '42%', right: '20%' }]}>
                        <View style={styles.calloutLine} />
                        <View style={styles.calloutBubble}>
                          <Text style={styles.calloutText}>
                            Reduces pore size
                          </Text>
                          <Text style={styles.calloutSubText}>
                            Smoother skin texture
                          </Text>
                        </View>
                      </View>
                      
                      <View style={[styles.callout, { top: '60%', left: '10%' }]}>
                        <View style={styles.calloutLine} />
                        <View style={styles.calloutBubble}>
                          <Text style={styles.calloutText}>
                            Fractional laser
                          </Text>
                          <Text style={styles.calloutSubText}>
                            Evens out skin tone and texture
                          </Text>
                        </View>
                      </View>
                      
                      <View style={[styles.callout, { top: '75%', right: '15%' }]}>
                        <View style={styles.calloutLine} />
                        <View style={styles.calloutBubble}>
                          <Text style={styles.calloutText}>
                            Refined skin texture
                          </Text>
                          <Text style={styles.calloutSubText}>
                            Reduced inflammation
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              )}
            </>
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
          Current AI technology has limitations in preserving exact facial features while removing blemishes.
          The simulation shows potential skin improvements only. Actual results will maintain your facial identity.
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
  simulationModeContainer: {
    marginVertical: 15,
    width: '100%',
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 12,
  },
  modeButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMode: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
    borderWidth: 1,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: '#666',
  },
  selectedModeText: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  modeDescription: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  descriptionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  descriptionText: {
    color: 'white',
    fontSize: 12,
    lineHeight: 16,
  },
  callout: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  calloutLine: {
    width: 30,
    height: 2,
    backgroundColor: '#4361ee',
  },
  calloutBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 8,
    maxWidth: 120,
    borderWidth: 1,
    borderColor: '#4361ee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calloutText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4361ee',
    marginBottom: 2,
  },
  calloutSubText: {
    fontSize: 10,
    color: '#666',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
});

export default SimulationScreen; 
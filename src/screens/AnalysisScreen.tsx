import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { analyzeFacialImage } from '../services/geminiService';

type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;

type Props = {
  route: AnalysisScreenRouteProp;
  navigation: AnalysisScreenNavigationProp;
};

type AnalysisResult = {
  estimatedAge: number;
  skinType: string;
  features: {
    description: string;
    severity: number;
  }[];
  recommendations: {
    treatmentId: string;
    reason: string;
  }[];
};

const AnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUri, base64Image } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      const result = await analyzeFacialImage(base64Image);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error in analysis:', error);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (analysisResult) {
      navigation.navigate('Treatment', {
        analysisResult,
        imageUri,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4361ee" />
            <Text style={styles.loadingText}>Analyzing facial features...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={analyzeImage}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : analysisResult ? (
          <View style={styles.resultContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Analysis Results</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Age:</Text>
                <Text style={styles.infoValue}>{analysisResult.estimatedAge} years</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Skin Type:</Text>
                <Text style={styles.infoValue}>{analysisResult.skinType}</Text>
              </View>
            </View>

            <View style={styles.featuresCard}>
              <Text style={styles.sectionTitle}>Facial Features</Text>
              {analysisResult.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureTitle}>{feature.description}</Text>
                    <View style={styles.severityContainer}>
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <View
                          key={dot}
                          style={[
                            styles.severityDot,
                            {
                              backgroundColor: dot <= feature.severity ? '#4361ee' : '#e1e5ee',
                            },
                          ]}
                        />
                      ))}
                      <Text style={styles.severityText}>
                        {feature.severity}/5
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>View Treatment Recommendations</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: 15,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d00',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#4361ee',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  featuresCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureItem: {
    marginBottom: 15,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  severityText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AnalysisScreen; 
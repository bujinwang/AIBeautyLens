import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Share, Platform, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { TREATMENTS } from '../constants/treatments';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type ReportScreenRouteProp = RouteProp<RootStackParamList, 'Report'>;
type ReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Report'>;

type Props = {
  route: ReportScreenRouteProp;
  navigation: ReportScreenNavigationProp;
};

const ReportScreen: React.FC<Props> = ({ route, navigation }) => {
  const { treatmentIds, beforeImage, afterImage } = route.params;
  const [generating, setGenerating] = useState(false);

  const selectedTreatments = treatmentIds
    .map(id => TREATMENTS.find(t => t.id === id))
    .filter(Boolean);

  const totalPrice = selectedTreatments.reduce((sum, treatment) => sum + (treatment?.price || 0), 0);

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    try {
      setGenerating(true);
      // In a real app, this would generate a PDF and share it
      // For MVP, we'll just share a text summary

      const treatmentsList = selectedTreatments
        .map(t => `- ${t?.name}: $${t?.price}`)
        .join('\n');

      const message = `
AIBeautyLens Treatment Plan
Date: ${formatDate()}

Selected Treatments:
${treatmentsList}

Total: $${totalPrice}

*This is a computer-generated recommendation. Please consult with a qualified specialist for personalized advice.
`;

      await Share.share({
        message,
        title: 'AIBeautyLens Treatment Plan',
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartOver = () => {
    navigation.popToTop();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Treatment Report</Text>
        <Text style={styles.date}>Date: {formatDate()}</Text>
      </View>

      <View style={styles.comparisonContainer}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Before</Text>
          <Image source={{ uri: beforeImage }} style={styles.image} />
        </View>
        
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>After (Simulated)</Text>
          <Image source={{ uri: afterImage }} style={styles.image} />
        </View>
      </View>

      <View style={styles.treatmentsContainer}>
        <Text style={styles.sectionTitle}>Recommended Treatments</Text>
        
        {selectedTreatments.map(treatment => (
          <View key={treatment?.id} style={styles.treatmentItem}>
            <Text style={styles.treatmentName}>{treatment?.name}</Text>
            <Text style={styles.treatmentArea}>Area: {treatment?.area}</Text>
            <Text style={styles.treatmentDescription}>{treatment?.description}</Text>
            <Text style={styles.treatmentPrice}>${treatment?.price}</Text>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Estimated Cost</Text>
          <Text style={styles.totalPrice}>${totalPrice}</Text>
        </View>
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerTitle}>Important Information</Text>
        <Text style={styles.disclaimerText}>
          This is a computer-generated recommendation based on AI analysis.
          Actual treatments, prices, and results may vary. 
          The simulation provided is for reference only.
          Please consult with a qualified aesthetic medicine specialist for personalized advice.
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.shareButton]} 
          onPress={handleShare}
          disabled={generating}
        >
          <Text style={styles.buttonText}>
            {generating ? 'Generating...' : 'Share Report'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.startOverButton]} 
          onPress={handleStartOver}
        >
          <Text style={styles.startOverButtonText}>Start Over</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
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
    height: 200,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  treatmentsContainer: {
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
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  treatmentItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  treatmentArea: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    lineHeight: 20,
  },
  treatmentPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4361ee',
    textAlign: 'right',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  disclaimerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  buttonsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: '#4361ee',
  },
  startOverButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4361ee',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  startOverButtonText: {
    color: '#4361ee',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportScreen; 
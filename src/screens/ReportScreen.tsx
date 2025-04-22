import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Share, Platform, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { TREATMENTS } from '../constants/treatments';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLocalization } from '../i18n/localizationContext';

type ReportScreenRouteProp = RouteProp<RootStackParamList, 'Report'>;
type ReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Report'>;

type Props = {
  route: ReportScreenRouteProp;
  navigation: ReportScreenNavigationProp;
};

const ReportScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useLocalization();
  const { treatmentIds, beforeImage } = route.params;
  const [generating, setGenerating] = useState(false);

  // Format the base64 image with proper prefix if needed
  const getFormattedImageUri = (base64String: string) => {
    if (!base64String) return '';

    // If it already has a data URI prefix, return as is
    if (base64String.startsWith('data:image')) {
      return base64String;
    }

    // Check if it starts with a file:// URI
    if (base64String.startsWith('file://')) {
      return base64String;
    }

    // Detect image type from base64 prefix
    let mimeType = 'image/jpeg'; // default
    if (base64String.startsWith('/9j/')) {
      mimeType = 'image/jpeg';
    } else if (base64String.startsWith('iVBORw0KGgo')) {
      mimeType = 'image/png';
    }

    // Add the appropriate data URI prefix
    return `data:${mimeType};base64,${base64String}`;
  };

  // Add debug logging
  console.log('ReportScreen - original beforeImage:', beforeImage?.substring(0, 50) + '...');
  const formattedImageUri = getFormattedImageUri(beforeImage);
  console.log('ReportScreen - formatted image URI prefix:', formattedImageUri.substring(0, 50) + '...');

  const selectedTreatments = treatmentIds
    .map(id => TREATMENTS.find(t => t.id === id))
    .filter(Boolean);

  // Add error handling for image loading
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error('Failed to load image. Original:', beforeImage?.substring(0, 50));
    console.error('Failed to load image. Formatted:', formattedImageUri.substring(0, 50));
    setImageError(true);
  };

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
AIBeautyLens ${t('treatmentReport')}
${t('date')} ${formatDate()}

${t('selectedTreatments')}
${treatmentsList}

${t('total')} $${totalPrice}

*${t('disclaimer')}
`;

      await Share.share({
        message,
        title: `AIBeautyLens ${t('treatmentReport')}`,
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
        <Text style={styles.title}>{t('treatmentReport')}</Text>
        <Text style={styles.date}>{t('date')} {formatDate()}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: formattedImageUri }}
          style={styles.image}
          resizeMode="contain"
          onError={handleImageError}
        />
        {imageError && (
          <Text style={styles.imageErrorText}>
            {t('failedToLoadImage')}
          </Text>
        )}
      </View>

      <View style={styles.treatmentsContainer}>
        <Text style={styles.sectionTitle}>{t('recommendedTreatments')}</Text>

        {selectedTreatments.map(treatment => (
          <View key={treatment?.id} style={styles.treatmentItem}>
            <Text style={styles.treatmentName}>{treatment?.name}</Text>
            <Text style={styles.treatmentArea}>{t('area')} {treatment?.area}</Text>
            <Text style={styles.treatmentDescription}>{treatment?.description}</Text>
            <Text style={styles.treatmentPrice}>${treatment?.price}</Text>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>{t('totalEstimatedCost')}</Text>
          <Text style={styles.totalPrice}>${totalPrice}</Text>
        </View>
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerTitle}>{t('importantInformation')}</Text>
        <Text style={styles.disclaimerText}>
          {t('disclaimer')}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={handleShare}
          disabled={generating}
        >
          <Text style={styles.buttonText}>
            {generating ? t('generating') : t('shareReport')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.startOverButton]}
          onPress={handleStartOver}
        >
          <Text style={styles.startOverButtonText}>{t('startOver')}</Text>
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
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    minHeight: 320,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#fff8e1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd54f',
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 12,
    letterSpacing: 0.25,
  },
  disclaimerText: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  buttonsContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#4361ee',
  },
  startOverButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  startOverButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  imageErrorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ReportScreen;
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Share, Platform, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLocalization } from '../i18n/localizationContext';
import { COLORS } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

type BeforeAfterComparisonReportScreenRouteProp = RouteProp<RootStackParamList, 'BeforeAfterComparisonReport'>;
type BeforeAfterComparisonReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BeforeAfterComparisonReport'>;

type Props = {
  route: BeforeAfterComparisonReportScreenRouteProp;
  navigation: BeforeAfterComparisonReportScreenNavigationProp;
};

const BeforeAfterComparisonReportScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useLocalization();
  const { beforeImage, afterImage, analysisResults } = route.params;
  const [generating, setGenerating] = useState(false);

  // Add error tracking for missing data
  const [hasDataError, setHasDataError] = useState(false);

  // Verify data integrity on mount
  useEffect(() => {
    console.log("Checking analysis results integrity:", JSON.stringify({
      hasResults: !!analysisResults,
      hasAnalysisResults: !!analysisResults?.analysisResults,
      hasRecommendations: !!analysisResults?.recommendations,
      hasImprovementAreas: !!analysisResults?.improvementAreas,
      improvementAreasLength: analysisResults?.improvementAreas?.length || 0
    }));
    
    if (!analysisResults) {
      console.warn('No analysis results received');
      setHasDataError(true);
    } else if (!analysisResults.analysisResults) {
      console.warn('Missing analysisResults field in response');
      setHasDataError(true);
    } else if (!analysisResults.recommendations) {
      console.warn('Missing recommendations field in response');
      setHasDataError(true);
    } else if (!analysisResults.improvementAreas || analysisResults.improvementAreas.length === 0) {
      console.warn('Missing or empty improvementAreas field in response:', analysisResults.improvementAreas);
      setHasDataError(true);
    } else {
      console.log('Analysis results integrity check passed');
      console.log('Received improvement areas:', JSON.stringify(analysisResults.improvementAreas));
    }
  }, [analysisResults]);

  // Extract the results from the API response
  const results = analysisResults?.analysisResults || {
    improvement: "67%",
    skinToneChange: "Significant brightening observed",
    textureChange: "Smoother texture with 43% reduction in visible pores",
    wrinkleReduction: "35% reduction in fine lines around eyes",
    moistureLevel: "Improved by 28%"
  };

  // Extract recommendations
  const recommendations = analysisResults?.recommendations || [
    "Continue with current treatments",
    "Consider adding vitamin C serum for enhanced results",
    "Maintain sunscreen application for best results",
    "Use a hydrating mask once a week for additional moisture"
  ];
  
  // Extract improvement areas from analysis results
  const improvementAreas = analysisResults?.improvementAreas || [
    {
      area: "Around eyes",
      description: "Noticeable reduction in fine lines and increased firmness",
      coordinates: {
        x: 50,
        y: 40,
        radius: 12
      }
    },
    {
      area: "T-zone",
      description: "Reduced pore size and oil production",
      coordinates: {
        x: 50,
        y: 30,
        radius: 15
      }
    },
    {
      area: "Cheek area",
      description: "More even skin tone with reduced redness",
      coordinates: {
        x: 30,
        y: 50,
        radius: 10
      }
    }
  ];
  
  // Component to render improvement area markers
  const ImprovementMarker = ({ x, y, radius, index }: { 
    x: number, 
    y: number, 
    radius: number, 
    index: number
  }) => {
    // Use different colors for different markers
    const colors = [COLORS.primary.main, COLORS.success.main, '#FF9800', '#9C27B0', '#2196F3'];
    const color = colors[index % colors.length];
    
    return (
      <View 
        style={{
          position: 'absolute', 
          left: `${x}%`, 
          top: `${y}%`, 
          width: `${radius*2}%`,
          height: `${radius*2}%`,
          marginLeft: `-${radius}%` as any,
          marginTop: `-${radius}%` as any,
          borderRadius: 100,
          borderWidth: 2,
          borderColor: color,
          backgroundColor: `${color}20`, // 20% opacity
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <Text style={{ 
          fontSize: 10, 
          fontWeight: 'bold',
          color: color,
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 10,
          overflow: 'hidden'
        }}>
          {index + 1}
        </Text>
      </View>
    );
  };

  // Format the base64 image with proper prefix if needed
  const getFormattedImageUri = (base64String: string) => {
    if (!base64String) {
      console.error('Empty image URI received in BeforeAfterComparisonReportScreen');
      return '';
    }

    // If it already has a data URI prefix or is a file URI, return as is
    if (base64String.startsWith('data:image') || base64String.startsWith('file://')) {
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

  const formattedBeforeImageUri = getFormattedImageUri(beforeImage);
  const formattedAfterImageUri = getFormattedImageUri(afterImage);

  // Add error handling for image loading
  const [beforeImageError, setBeforeImageError] = useState(false);
  const [afterImageError, setAfterImageError] = useState(false);

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

      const message = `
AIBeautyLens ProgressScan™ ${t('results')}
${t('date')} ${formatDate()}

${t('overallImprovement')} ${results.improvement}
${t('skinToneChange')} ${results.skinToneChange}
${t('textureChange')} ${results.textureChange}
${t('wrinkleReduction')} ${results.wrinkleReduction}
${t('moistureLevel')} ${results.moistureLevel}

${t('recommendations')}:
${recommendations.map((rec: string) => `- ${rec}`).join('\n')}

* ${t('disclaimer')}
`;

      await Share.share({
        message,
        title: `AIBeautyLens ProgressScan™ ${t('results')}`,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert(t('error'), t('shareError'));
    } finally {
      setGenerating(false);
    }
  };

  const handleStartOver = () => {
    navigation.popToTop();
  };

  return (
    <ScrollView style={styles.container}>
      {hasDataError && (
        <View style={styles.warningBanner}>
          <MaterialIcons name="info" size={20} color="white" />
          <Text style={styles.warningText}>
            {t('resultsFallbackWarning')}
          </Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>{t('progressScanResults')}</Text>
        <Text style={styles.date}>{t('date')} {formatDate()}</Text>
      </View>

      <View style={styles.imagesContainer}>
        <View style={styles.imageColumn}>
          <Text style={styles.imageLabel}>{t('beforeImageLabel')}</Text>
          <View style={styles.imageWrapper}>
            {formattedBeforeImageUri ? (
              <Image
                source={{ uri: formattedBeforeImageUri }}
                style={styles.image}
                resizeMode="cover"
                onError={() => setBeforeImageError(true)}
              />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Text style={styles.imagePlaceholderText}>
                  {t('noImageAvailable')}
                </Text>
              </View>
            )}
            {beforeImageError && (
              <Text style={styles.imageErrorText}>
                {t('failedToLoadImage')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.imageColumn}>
          <Text style={styles.imageLabel}>{t('afterImageLabel')}</Text>
          <View style={styles.imageWrapper}>
            {formattedAfterImageUri ? (
              <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Image
                  source={{ uri: formattedAfterImageUri }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => setAfterImageError(true)}
                />
                {improvementAreas.map((area: any, index: number) => (
                  <ImprovementMarker
                    key={index}
                    x={area.coordinates.x}
                    y={area.coordinates.y}
                    radius={area.coordinates.radius}
                    index={index}
                  />
                ))}
              </View>
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Text style={styles.imagePlaceholderText}>
                  {t('noImageAvailable')}
                </Text>
              </View>
            )}
            {afterImageError && (
              <Text style={styles.imageErrorText}>
                {t('failedToLoadImage')}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>{t('analysisResults')}</Text>

        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>{t('overallImprovement')}</Text>
          <Text style={styles.resultValue}>{results.improvement}</Text>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>{t('skinToneChange')}</Text>
          <Text style={styles.resultValue}>{results.skinToneChange}</Text>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>{t('textureChange')}</Text>
          <Text style={styles.resultValue}>{results.textureChange}</Text>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>{t('wrinkleReduction')}</Text>
          <Text style={styles.resultValue}>{results.wrinkleReduction}</Text>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>{t('moistureLevel')}</Text>
          <Text style={styles.resultValue}>{results.moistureLevel}</Text>
        </View>
      </View>

      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>{t('recommendations')}</Text>
        {recommendations.map((recommendation: string, index: number) => (
          <View key={index} style={styles.recommendationItem}>
            <MaterialIcons name="check-circle" size={20} color={COLORS.primary.main} style={styles.recommendationIcon} />
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </View>

      <View style={styles.improvementAreasContainer}>
        <Text style={styles.sectionTitle}>{t('improvementAreas')}</Text>
        {improvementAreas.map((area: any, index: number) => (
          <View key={index} style={styles.improvementAreaItem}>
            <View style={styles.areaMarkerContainer}>
              <View 
                style={[
                  styles.areaMarker, 
                  { 
                    backgroundColor: [COLORS.primary.main, COLORS.success.main, '#FF9800', '#9C27B0', '#2196F3'][index % 5] 
                  }
                ]}
              >
                <Text style={styles.areaMarkerText}>{index + 1}</Text>
              </View>
            </View>
            <View style={styles.areaDetails}>
              <Text style={styles.areaName}>{area.area}</Text>
              <Text style={styles.areaDescription}>{area.description}</Text>
            </View>
          </View>
        ))}
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
            {generating ? t('generating') : t('shareProgressReport')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.startOverButton]}
          onPress={handleStartOver}
        >
          <Text style={styles.startOverButtonText}>{t('returnToHome')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.background.paper,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary.main,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  imagesContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.background.paper,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageColumn: {
    flex: 1,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text.primary,
  },
  imageWrapper: {
    width: '90%',
    aspectRatio: 3/4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: COLORS.gray[500],
    fontSize: 14,
    textAlign: 'center',
  },
  imageErrorText: {
    color: COLORS.error.main,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  resultsContainer: {
    padding: 16,
    backgroundColor: COLORS.background.paper,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    paddingBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    width: '40%',
  },
  resultValue: {
    fontSize: 16,
    color: COLORS.text.secondary,
    flex: 1,
    textAlign: 'left',
  },
  recommendationsContainer: {
    padding: 16,
    backgroundColor: COLORS.background.paper,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  improvementAreasContainer: {
    padding: 16,
    backgroundColor: COLORS.background.paper,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  improvementAreaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  areaMarkerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
  },
  areaMarker: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaMarkerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  areaDetails: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  areaDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  disclaimerContainer: {
    padding: 16,
    backgroundColor: COLORS.background.paper,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'column',
    padding: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    backgroundColor: COLORS.primary.main,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  startOverButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.primary.main,
  },
  startOverButtonText: {
    color: COLORS.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning.main,
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 16,
    marginTop: 8,
  },
  warningText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default BeforeAfterComparisonReportScreen; 
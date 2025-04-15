import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import { analyzeFacialImage } from '../services/geminiService';
import GenderConfidenceDisplay from '../components/GenderConfidenceDisplay';
import ProcessingIndicator from '../components/ProcessingIndicator';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';

type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;

type Props = {
  route: AnalysisScreenRouteProp;
  navigation: AnalysisScreenNavigationProp;
};

type AnalysisResult = {
  estimatedAge: number;
  gender: string;
  genderConfidence: number;
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
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // Set up navigation options
    navigation.setOptions({
      headerStyle: {
        backgroundColor: COLORS.primary.main,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: COLORS.white,
      headerTitle: 'Advanced Facial Analysis',
      headerTitleStyle: {
        fontWeight: '600',
      },
    });

    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsQuotaError(false);
      const result = await analyzeFacialImage(base64Image);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error in analysis:', error);
      if (error instanceof Error) {
        if (error.message.includes('API_QUOTA_EXCEEDED')) {
          setIsQuotaError(true);
          setError('You have reached your API quota limit.');
        } else {
          setError('Failed to analyze image. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (analysisResult) {
      navigation.navigate('Treatment', {
        analysisResult,
        imageUri,
        base64Image,
      });
    }
  };

  const renderSeverityIndicator = (severity: number) => {
    const dots = [];
    const getColor = (index: number) => {
      if (index <= severity) {
        if (severity <= 2) return COLORS.success.main;
        if (severity <= 4) return COLORS.warning.main;
        return COLORS.error.main;
      }
      return COLORS.gray[200];
    };

    for (let i = 1; i <= 5; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.severityDot,
            { backgroundColor: getColor(i) },
          ]}
        />
      );
    }

    return (
      <View style={styles.severityContainer}>
        {dots}
        <Text style={styles.severityText}>
          {severity}/5
        </Text>
      </View>
    );
  };

  const renderErrorContent = () => {
    if (isQuotaError) {
      return (
        <Card variant="elevated" style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <MaterialIcons name="error-outline" size={40} color={COLORS.error.main} />
            <Text style={styles.errorTitle}>Analysis Temporarily Unavailable</Text>
            <Text style={styles.errorText}>
              Our facial analysis service is currently unavailable due to high demand. 
              Your skin health is important to us, and we apologize for the inconvenience.
            </Text>
            <View style={styles.quotaErrorActions}>
              <Button 
                title="Try Again Later" 
                icon="schedule"
                onPress={analyzeImage} 
                variant="outline"
                style={styles.actionButton}
              />
              <Button 
                title="Contact Clinic" 
                icon="call"
                onPress={() => Linking.openURL('tel:+15551234567')}
                variant="primary"
                style={styles.actionButton}
              />
            </View>
          </View>
        </Card>
      );
    }
    
    return (
      <Card variant="elevated" style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <MaterialIcons name="error-outline" size={40} color={COLORS.error.main} />
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            title="Retry Analysis" 
            icon="refresh"
            onPress={analyzeImage} 
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          
          {/* Premium badge overlay */}
          <View style={styles.badgeContainer}>
            <View style={styles.premiumBadge}>
              <MaterialIcons name="verified" size={16} color={COLORS.gold.main} style={styles.badgeIcon} />
              <Text style={styles.badgeText}>Premium Analysis</Text>
            </View>
          </View>
        </View>
        
        {loading ? (
          <ProcessingIndicator 
            isAnalyzing={true} 
            processingText="Advanced Facial Analysis In Progress"
            showDetailedSteps={true}
          />
        ) : error ? (
          renderErrorContent()
        ) : analysisResult ? (
          <View style={styles.resultContainer}>
            {/* Primary analysis card */}
            <Card 
              variant="elevated" 
              title="Analysis Results"
              icon="analytics"
              style={styles.analysisCard}
            >
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Age:</Text>
                <Text style={styles.infoValue}>{analysisResult.estimatedAge} years</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender:</Text>
                <View style={styles.infoValueContainer}>
                  <GenderConfidenceDisplay 
                    gender={analysisResult.gender}
                    confidence={analysisResult.genderConfidence || 0}
                    size="medium"
                  />
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Skin Type:</Text>
                <Text style={styles.infoValue}>{analysisResult.skinType}</Text>
              </View>
            </Card>

            {/* Features analysis card */}
            <Card
              variant="elevated"
              title="Facial Features Analysis"
              icon="face"
              style={styles.featuresCard}
            >
              {analysisResult.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureTitle}>{feature.description}</Text>
                    {renderSeverityIndicator(feature.severity)}
                  </View>
                </View>
              ))}
            </Card>

            {/* AI insights badge */}
            <View style={styles.insightContainer}>
              <View style={styles.insightIconContainer}>
                <MaterialIcons name="psychology" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.insightText}>
                Analysis powered by advanced AI dermatological models
              </Text>
            </View>

            <Button 
              title="View Treatment Recommendations" 
              icon="arrow-forward"
              iconPosition="right"
              variant="primary"
              size="large"
              fullWidth={true}
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>
        ) : null}
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  image: {
    width: 300,
    height: 400,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  badgeContainer: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
  },
  badgeIcon: {
    marginRight: SPACING.xs,
  },
  badgeText: {
    color: COLORS.gold.main,
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    marginVertical: SPACING.xl,
  },
  errorContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.error.main,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error.main,
    marginVertical: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.md,
  },
  resultContainer: {
    marginTop: SPACING.md,
  },
  analysisCard: {
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  featuresCard: {
    marginBottom: SPACING.xl,
  },
  featureItem: {
    marginBottom: SPACING.md,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    flex: 1,
    paddingRight: SPACING.sm,
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
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary.dark,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  insightText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontStyle: 'italic',
  },
  nextButton: {
    marginBottom: SPACING.xl,
  },
  quotaErrorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default AnalysisScreen; 
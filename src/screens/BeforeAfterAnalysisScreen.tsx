import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLocalization } from '../i18n/localizationContext';
import { analyzeBeforeAfterImages } from '../services/geminiService';

type BeforeAfterAnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BeforeAfterAnalysis'>;

type Props = {
  navigation: BeforeAfterAnalysisScreenNavigationProp;
};

const BeforeAfterAnalysisScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLocalization();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [beforeImage, setBeforeImage] = useState<any>(null);
  const [afterImage, setAfterImage] = useState<any>(null);
  const [currentMode, setCurrentMode] = useState<'before' | 'after'>('before');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const cameraRef = useRef<Camera>(null);

  // Add new effect to log state changes for debugging
  React.useEffect(() => {
    console.log(`Current mode updated to: ${currentMode}`);
  }, [currentMode]);

  React.useEffect(() => {
    if (beforeImage) {
      console.log('Before image has been set');
    }
  }, [beforeImage]);

  React.useEffect(() => {
    if (afterImage) {
      console.log('After image has been set');
    }
  }, [afterImage]);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        exif: false,
      });
      
      console.log(`Taking picture in ${currentMode} mode, has base64:`, !!photo.base64);
      
      // Ensure currentMode is respected when assigning images
      if (currentMode === 'before') {
        console.log('Setting BEFORE image from camera');
        setBeforeImage(photo);
      } else if (currentMode === 'after') {
        console.log('Setting AFTER image from camera');
        setAfterImage(photo);
      } else {
        console.error('Unknown camera mode:', currentMode);
      }
      
      setCameraVisible(false);
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const pickImage = async (mode: 'before' | 'after') => {
    console.log(`Picking image for ${mode} mode`);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [3, 4],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets?.[0];
        if (selectedAsset) {
          let finalUri = selectedAsset.uri;
          let base64Data = selectedAsset.base64;

          if (Platform.OS !== 'web') {
            // Native platforms: continue with caching logic
            const imagesDir = FileSystem.cacheDirectory + 'images';
            const dirInfo = await FileSystem.getInfoAsync(imagesDir);
            if (!dirInfo.exists) {
              await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
            }

            const newCachedUri = imagesDir + '/' + selectedAsset.uri.split('/').pop();
            await FileSystem.copyAsync({ from: selectedAsset.uri, to: newCachedUri });
            finalUri = newCachedUri; // Use the cached URI for native

            if (!base64Data) {
              try {
                base64Data = await FileSystem.readAsStringAsync(finalUri, {
                  encoding: FileSystem.EncodingType.Base64,
                });
              } catch (readError) {
                console.error(`Error reading ${mode} image as base64 from cache:`, readError);
              }
            }
          } else {
            // Web platform: use the URI and base64 directly from ImagePicker
            // The URI might be a blob URI or data URI, base64 should be available
            if (!base64Data && finalUri.startsWith('data:')) {
                // If base64 is not directly provided but URI is a data URI, extract it
                base64Data = finalUri.substring(finalUri.indexOf(',') + 1);
            } else if (!base64Data) {
                // Fallback if base64 is still missing (should be rare with base64: true)
                console.warn(`Base64 data not available for ${mode} image on web, URI: ${finalUri}`);
                // Attempt to fetch and convert blob URI if necessary, though ImagePicker should provide base64
                // This part can be expanded if blob URIs without direct base64 become an issue
            }
          }

          const processedImage = {...selectedAsset, uri: finalUri, base64: base64Data};
          
          // Use the explicitly passed mode parameter instead of currentMode
          if (mode === 'before') {
            console.log('Setting BEFORE image from gallery');
            setBeforeImage(processedImage);
          } else {
            console.log('Setting AFTER image from gallery');
            setAfterImage(processedImage);
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const startCamera = (mode: 'before' | 'after') => {
    console.log(`Starting camera in ${mode} mode`);
    setCurrentMode(mode);
    setCameraVisible(true);
  };

  const resetImages = () => {
    setBeforeImage(null);
    setAfterImage(null);
    setAnalysisResult(null);
  };

  const analyzeImages = async () => {
    if (!beforeImage?.base64 || !afterImage?.base64) {
      Alert.alert(t('missingImagesTitle'), t('missingImagesMessage'));
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Sending images to Gemini Vision API for analysis...');
      
      // Call the Gemini Vision API function with both images
      const analysisResults = await analyzeBeforeAfterImages(
        beforeImage.base64,
        afterImage.base64
      );
      
      console.log('Analysis results received:', 
        typeof analysisResults === 'object' ? 'Valid object' : 'Invalid format',
        analysisResults ? 'Not null' : 'Null'
      );
      
      if (!analysisResults || 
          !analysisResults.analysisResults || 
          !analysisResults.recommendations) {
        console.warn('Received incomplete analysis results, but continuing with available data');
      }
      
      // Navigate to the comparison report screen with the results
      navigation.navigate('BeforeAfterComparisonReport', {
        beforeImage: beforeImage.base64,
        afterImage: afterImage.base64,
        analysisResult: analysisResults
      });
      
    } catch (error) {
      console.error('Error analyzing images:', error);
      Alert.alert(
        t('analysisFailedTitle'), 
        t('analysisFailedMessage'),
        [{ text: 'OK', onPress: () => {} }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderCameraView = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.permissionContainer}>
          <MaterialIcons name="camera" size={50} color={COLORS.primary.main} />
          <Text style={styles.permissionText}>{t('requestingPermission')}</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <MaterialIcons name="no-photography" size={50} color={COLORS.error.main} />
          <Text style={styles.permissionText}>{t('noAccessCamera')}</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => setCameraVisible(false)}
          >
            <Text style={styles.permissionButtonText}>{t('goBack')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.back}
          ratio="4:3"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.faceFrameContainer}>
              <View style={styles.faceFrame}>
                <View style={[styles.cornerBorder, styles.topLeft]} />
                <View style={[styles.cornerBorder, styles.topRight]} />
                <View style={[styles.cornerBorder, styles.bottomLeft]} />
                <View style={[styles.cornerBorder, styles.bottomRight]} />
              </View>
              <Text style={styles.frameTip}>{currentMode === 'before' ? t('capturingBeforeImage') : t('capturingAfterImage')}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setCameraVisible(false)}
            >
              <MaterialIcons name="close" size={20} color={COLORS.primary.main} style={styles.buttonIcon} />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={takePicture}
            >
              <MaterialIcons name="camera-alt" size={20} color="white" style={styles.buttonIcon} />
              <Text style={[styles.buttonText, styles.primaryButtonText]}>{t('capture')}</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <View style={styles.analysisResultContainer}>
        <Text style={styles.analysisTitle}>Analysis Results</Text>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Overall Improvement:</Text>
          <Text style={styles.resultValue}>{analysisResult.improvement}</Text>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Skin Tone Change:</Text>
          <Text style={styles.resultValue}>{analysisResult.skinToneChange}</Text>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Texture Change:</Text>
          <Text style={styles.resultValue}>{analysisResult.textureChange}</Text>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Wrinkle Reduction:</Text>
          <Text style={styles.resultValue}>{analysisResult.wrinkleReduction}</Text>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Moisture Level:</Text>
          <Text style={styles.resultValue}>{analysisResult.moistureLevel}</Text>
        </View>
        
        <Text style={styles.recommendationsTitle}>Recommendations:</Text>
        {analysisResult.recommendations.map((recommendation: string, index: number) => (
          <Text key={index} style={styles.recommendationItem}>• {recommendation}</Text>
        ))}
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, styles.fullWidthButton]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>Return Home</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (cameraVisible) {
    return renderCameraView();
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('beforeAfterTitle')}</Text>
        <View style={styles.spacer}></View>
      </View>

      <Text style={styles.instructions}>
        {t('beforeAfterInstructions')}
      </Text>

      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>{t('beforeTreatment')}</Text>
        <View style={styles.imageContainer}>
          {beforeImage ? (
            <Image source={{ uri: beforeImage.uri }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialIcons name="add-photo-alternate" size={40} color={COLORS.gray[400]} />
              <Text style={styles.placeholderText}>{t('addBeforeImage')}</Text>
            </View>
          )}
        </View>
        <View style={styles.imageButtonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.imageButton]}
            onPress={() => startCamera('before')}
          >
            <MaterialIcons name="camera-alt" size={20} color={COLORS.primary.main} />
            <Text style={styles.imageButtonText}>{t('camera')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.imageButton]}
            onPress={() => {
              console.log('Picking image for BEFORE');
              pickImage('before');
            }}
          >
            <MaterialIcons name="photo-library" size={20} color={COLORS.primary.main} />
            <Text style={styles.imageButtonText}>{t('gallery')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.imageSection, styles.marginTop]}>
        <Text style={styles.sectionTitle}>{t('afterTreatment')}</Text>
        <View style={styles.imageContainer}>
          {afterImage ? (
            <Image source={{ uri: afterImage.uri }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialIcons name="add-photo-alternate" size={40} color={COLORS.gray[400]} />
              <Text style={styles.placeholderText}>{t('addAfterImage')}</Text>
            </View>
          )}
        </View>
        <View style={styles.imageButtonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.imageButton]}
            onPress={() => startCamera('after')}
          >
            <MaterialIcons name="camera-alt" size={20} color={COLORS.primary.main} />
            <Text style={styles.imageButtonText}>{t('camera')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.imageButton]}
            onPress={() => {
              console.log('Picking image for AFTER');
              pickImage('after');
            }}
          >
            <MaterialIcons name="photo-library" size={20} color={COLORS.primary.main} />
            <Text style={styles.imageButtonText}>{t('gallery')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, styles.actionButton]}
          onPress={resetImages}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('reset')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button, 
            styles.primaryButton, 
            styles.actionButton,
            (!beforeImage || !afterImage) && styles.disabledButton
          ]}
          onPress={analyzeImages}
          disabled={!beforeImage || !afterImage || isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={[styles.buttonText, styles.primaryButtonText]}>{t('analyzeChanges')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {renderAnalysisResult()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  spacer: {
    width: 40,
  },
  instructions: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: 24,
  },
  marginTop: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 8,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.primary.main,
    backgroundColor: 'white',
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary.main,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: COLORS.primary.main,
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.primary.main,
  },
  secondaryButtonText: {
    color: COLORS.primary.main,
  },
  disabledButton: {
    backgroundColor: COLORS.gray[300],
    borderColor: COLORS.gray[300],
  },
  buttonIcon: {
    marginRight: 8,
  },
  fullWidthButton: {
    width: '100%',
    marginTop: 16,
  },
  analysisResultContainer: {
    backgroundColor: COLORS.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary.light,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary.main,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  resultValue: {
    flex: 2,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 12,
  },
  recommendationItem: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
    margin: 12,
    backgroundColor: '#000',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 20,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  faceFrameContainer: {
    alignItems: 'center',
  },
  faceFrame: {
    width: 250,
    height: 330,
    position: 'relative',
  },
  cornerBorder: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },
  frameTip: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BeforeAfterAnalysisScreen; 
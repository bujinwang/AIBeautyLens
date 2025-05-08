import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, StatusBar, Platform, TextInput, ScrollView, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import CustomIcon from '../components/CustomIcon';
import Logo from '../components/Logo';
import ProcessingIndicator from '../components/ProcessingIndicator'; // Added import
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalization } from '../i18n/localizationContext';
import { analyzeEyeArea } from '../services/geminiService'; // Added import

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;

type Props = {
  navigation: CameraScreenNavigationProp;
};

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLocalization();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>(CameraType.front);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [visitPurpose, setVisitPurpose] = useState<string>('');
  const [appointmentLength, setAppointmentLength] = useState<string>('1hr'); // Defaulting to a value, adjust if needed
  const [isEyeAnalyzing, setIsEyeAnalyzing] = useState(false); // Added state for eye analysis loading
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
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
        exif: false, // Don't need EXIF data
      });
      
      console.log('Photo captured, has base64:', !!photo.base64);
      
      setPreviewVisible(true);
      setCapturedImage(photo);
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const pickImage = async () => {
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
          // Check if the URI is a file and not a directory
          if (selectedAsset.uri.startsWith('file://')) {
            const imagesDir = FileSystem.cacheDirectory + 'images';
            // Ensure the directory exists
            const dirInfo = await FileSystem.getInfoAsync(imagesDir);
            if (!dirInfo.exists) {
              await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
            }

            const newUri = imagesDir + '/' + selectedAsset.uri.split('/').pop();
            await FileSystem.copyAsync({ from: selectedAsset.uri, to: newUri });
            
            // If we don't have base64 from the image picker, try to read it
            let base64Data = selectedAsset.base64;
            if (!base64Data) {
              try {
                base64Data = await FileSystem.readAsStringAsync(newUri, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                console.log('Successfully read base64 data from selected image');
              } catch (readError) {
                console.error('Error reading selected image as base64:', readError);
              }
            }

            setPreviewVisible(true);
            setCapturedImage({...selectedAsset, uri: newUri, base64: base64Data});
          } else {
            // Show an alert to the user instead of rendering/logging a string in the UI
            Alert.alert(
              t('invalidImageTitle'),
              t('invalidImageMessage'),
              [{ text: t('ok') }]
            );
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setPreviewVisible(false);
  };

  const handleAnalyze = async () => {
    if (!capturedImage || !capturedImage.uri) return;

    try {
      // If capturedImage already has base64, use it
      let base64Data = capturedImage.base64 || '';
      
      // If no base64 data, try to read it from the file
      if (!base64Data && capturedImage.uri) {
        try {
          base64Data = await FileSystem.readAsStringAsync(capturedImage.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log('Successfully loaded base64 data from image file');
        } catch (readError) {
          console.error('Error reading image as base64:', readError);
        }
      }

      navigation.navigate('Analysis', {
        imageUri: capturedImage.uri,
        base64Image: base64Data,
        visitPurpose: visitPurpose,
        appointmentLength: appointmentLength
      });
    } catch (error) {
      console.error('Error preparing image for analysis:', error);
    }
  };

  const handleEyeAnalyze = async () => {
    if (!capturedImage || !capturedImage.uri) return;
    setIsEyeAnalyzing(true); // Start loading

    try {
      // If capturedImage already has base64, use it
      let base64Data = capturedImage.base64 || '';
      
      // If no base64 data, try to read it from the file
      if (!base64Data && capturedImage.uri) {
        try {
          base64Data = await FileSystem.readAsStringAsync(capturedImage.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log('Successfully loaded base64 data for eye analysis');
        } catch (readError) {
          console.error('Error reading image as base64 for eye analysis:', readError);
          // Optionally show an error to the user
          return; 
        }
      }

      // Call the actual eye analysis service
      const analysisResult = await analyzeEyeArea(capturedImage.uri, visitPurpose, appointmentLength);

      // Check if analysis was successful before navigating
      if (analysisResult) {
        // Navigate to ReportScreen with eye analysis results
        navigation.navigate('Report', {
          analysisType: 'eye', // Indicate this is an eye analysis report
          imageUri: capturedImage.uri,
          // base64Image: base64Data, // ReportScreen might not need base64
          eyeAnalysisResult: analysisResult, // Pass the eye results
          // Pass other relevant params if ReportScreen needs them for eye context
          visitPurpose: visitPurpose,
          appointmentLength: appointmentLength
        });
      } else {
        // Handle case where analysisResult is null or undefined (error handled in service)
        Alert.alert(t('error'), t('eyeAnalysisFailed')); 
      }
    } catch (error: any) { // Catch specific error type if possible
      console.error('Error during eye analysis process:', error);
      // Use a more specific error message if available from the error object
      const errorMessage = error?.message || t('eyeAnalysisFailed');
      Alert.alert(t('error'), errorMessage); // Show specific error to user
    } finally {
      setIsEyeAnalyzing(false); // Stop loading
    }
  };

  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <CustomIcon name="camera" size={50} color={COLORS.primary.main} />
        <Text style={styles.permissionText}>{t('requestingPermission')}</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <CustomIcon name="no-photography" size={50} color={COLORS.error.main} />
        <Text style={styles.permissionText}>{t('noAccessCamera')}</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionButtonText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ProcessingIndicator 
        isAnalyzing={isEyeAnalyzing} 
        processingText={t('analyzingEyeArea')} // Corrected localization key
        analysisType="eye" // Specify eye analysis type
        showDetailedSteps={true} // Assuming we want to show steps for eye analysis too
        showTechStack={true} // Assuming we want to show tech stack for eye analysis
      />

      <LinearGradient
        colors={[COLORS.primary.dark, COLORS.primary.main, 'rgba(255,255,255,0.9)']}
        locations={[0, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={navigateToHome}
          >
            <CustomIcon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Logo size="medium" showTagline={false} color="white" containerStyle={styles.logo} />
          </View>

          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>{t('positionFace')}</Text>
      </View>

      {previewVisible && capturedImage ? (
        <ScrollView style={styles.previewScrollContainer}>
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: capturedImage.uri }}
              style={styles.cameraPreview}
            />

            <View style={styles.formContainer}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>{t('purposeOfVisit')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('visitPurposeHint')}
                  placeholderTextColor={COLORS.gray[400]}
                  multiline
                  numberOfLines={3}
                  value={visitPurpose}
                  onChangeText={setVisitPurpose}
                  textAlignVertical="top"
                  blurOnSubmit={false}
                  autoCapitalize="sentences"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>{t('appointmentLength')}</Text>
                <View style={styles.appointmentOptions}>
                  {['1hr', '2hrs', '4hrs', '6hrs', '8hrs'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.appointmentOption,
                        appointmentLength === option && styles.appointmentOptionSelected
                      ]}
                      onPress={() => setAppointmentLength(option)}
                    >
                      <View style={styles.appointmentOptionContent}>
                        {(option === '2hrs' || option === '4hrs' || option === '6hrs' || option === '8hrs') ? (
                          <MaterialIcons
                            name="stars"
                            size={16}
                            color={appointmentLength === option ? COLORS.primary.main : COLORS.gray[400]}
                            style={styles.vipIcon}
                          />
                        ) : null}
                        <Text style={[
                          styles.appointmentOptionText,
                          appointmentLength === option && styles.appointmentOptionTextSelected
                        ]}>{option}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={retakePicture}
              >
                {/* <CustomIcon name="refresh" size={20} color={COLORS.primary.main} style={styles.buttonIcon} /> */}
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('retake')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleAnalyze}
              >
                {/* <CustomIcon name="analytics" size={20} color="white" style={styles.buttonIcon} /> */}
                <Text style={[styles.buttonText, styles.primaryButtonText]}>{t('beginAnalysis')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, styles.eyeButton]} // Added eyeButton style for potential adjustments
                onPress={handleEyeAnalyze} // New handler needed
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>{t('startEyeAnalysis')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={type}
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
                <Text style={styles.frameTip}>{t('centerYourFace')}</Text>
              </View>

              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => {
                  setType(
                    type === CameraType.back
                      ? CameraType.front
                      : CameraType.back
                  );
                }}
              >
                <CustomIcon name="flip-camera-ios" size={26} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={pickImage}
              >
                <CustomIcon name="photo-library" size={20} color={COLORS.primary.main} style={styles.buttonIcon} />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('gallery')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={takePicture}
              >
                <CustomIcon name="camera-alt" size={20} color="white" style={styles.buttonIcon} />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>{t('capture')}</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logo: {
    transform: [{ scale: 1.1 }],
  },
  backButton: {
    padding: 8,
  },
  eyeButton: {
    // Add specific styles for the eye analysis button if needed
    // e.g., marginLeft: 10,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 48,
  },
  buttonIcon: {
    marginRight: 8,
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
    backgroundColor: COLORS.background.paper,
    borderWidth: 1,
    borderColor: COLORS.primary.main,
  },
  secondaryButtonText: {
    color: COLORS.primary.main,
  },
  previewScrollContainer: {
    flex: 1, // Allow the View to take up space
  },
  previewContainer: {
    flex: 1, // Allow inner content to potentially grow
    paddingBottom: 0,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  formSection: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.paper,
    minHeight: 80, // Reduced from 100
    textAlignVertical: 'top',
  },
  appointmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appointmentOption: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.background.paper,
  },
  appointmentOptionSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.light,
  },
  appointmentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vipIcon: {
    marginRight: 4,
  },
  appointmentOptionText: {
    fontSize: 16,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  appointmentOptionTextSelected: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  cameraPreview: {
    width: '100%',
    aspectRatio: 3/4,
    marginTop: 8,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  faceFrameContainer: {
    position: 'absolute',
    top: '15%', // Adjust as needed
    left: '10%',
    right: '10%',
    bottom: '25%', // Adjust as needed
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceFrame: {
    width: '100%',
    height: '100%',
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 2,
    borderRadius: 10, // Optional: adds rounded corners
    position: 'relative',
  },
  cornerBorder: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary.main, // Use a distinct color
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  frameTip: {
    position: 'absolute',
    bottom: -30, // Position below the frame
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  flipButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background.default,
  },
  permissionText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
    color: COLORS.text.primary,
  },
  permissionButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.paper, // Or a slightly different shade
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default CameraScreen;

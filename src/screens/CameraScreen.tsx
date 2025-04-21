import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, StatusBar, Platform, TextInput, ScrollView } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import CustomIcon from '../components/CustomIcon';
import Logo from '../components/Logo';
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;

type Props = {
  navigation: CameraScreenNavigationProp;
};

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>(CameraType.front);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [visitPurpose, setVisitPurpose] = useState<string>('');
  const [appointmentLength, setAppointmentLength] = useState<string>('60m');
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
      });
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
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets?.[0];
        if (selectedAsset) {
          setPreviewVisible(true);
          setCapturedImage(selectedAsset);
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
      let base64Image = capturedImage.base64;
      if (!base64Image) {
        const fileUri = capturedImage.uri;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          const base64Content = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          base64Image = base64Content;
        }
      }

      navigation.navigate('Analysis', {
        imageUri: capturedImage.uri,
        base64Image: base64Image,
        visitPurpose: visitPurpose,
        appointmentLength: appointmentLength
      });
    } catch (error) {
      console.error('Error preparing image for analysis:', error);
    }
  };

  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  const openApiKeySettings = () => {
    navigation.navigate('ApiKey', { forceShow: true });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <CustomIcon name="camera" size={50} color={COLORS.primary.main} />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <CustomIcon name="no-photography" size={50} color={COLORS.error.main} />
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

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

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openApiKeySettings}
          >
            <CustomIcon name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>Position your face within the frame for best results</Text>
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
                <Text style={styles.formLabel}>Purpose of Visit</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Example: Reduce fine lines and improve skin elasticity..."
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
                <Text style={styles.formLabel}>Appointment Length</Text>
                <View style={styles.appointmentOptions}>
                  {['45m', '60m', '2hrs', '4hrs'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.appointmentOption,
                        appointmentLength === option && styles.appointmentOptionSelected
                      ]}
                      onPress={() => setAppointmentLength(option)}
                    >
                      <Text style={[
                        styles.appointmentOptionText,
                        appointmentLength === option && styles.appointmentOptionTextSelected
                      ]}>{option}</Text>
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
                <CustomIcon name="refresh" size={20} color={COLORS.primary.main} style={styles.buttonIcon} />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleAnalyze}
              >
                <CustomIcon name="analytics" size={20} color="white" style={styles.buttonIcon} />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Begin Analysis</Text>
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
                <Text style={styles.frameTip}>Center your face</Text>
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
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={takePicture}
              >
                <CustomIcon name="camera-alt" size={20} color="white" style={styles.buttonIcon} />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Capture</Text>
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
    backgroundColor: '#f5f5f5',
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
  settingsButton: {
    padding: 8,
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
    justifyContent: 'center',
    margin: 20,
    zIndex: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    minWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 6,
  },
  primaryButton: {
    backgroundColor: COLORS.primary.main,
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    color: COLORS.primary.main,
  },
  previewScrollContainer: {
    flex: 1,
    margin: 12,
  },
  previewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  formContainer: {
    width: '90%',
    marginTop: 20,
    marginBottom: 10,
  },
  formSection: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: 'white',
    minHeight: 80,
  },
  appointmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appointmentOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 10,
    backgroundColor: 'white',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  appointmentOptionSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.light,
  },
  appointmentOptionText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  appointmentOptionTextSelected: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  cameraPreview: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
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
  flipButton: {
    position: 'absolute',
    bottom: 90,
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  subtitle: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 0,
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
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

export default CameraScreen;
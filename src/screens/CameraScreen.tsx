import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;

type Props = {
  navigation: CameraScreenNavigationProp;
};

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>(CameraType.front);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
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

  const analyzeImage = async () => {
    if (capturedImage && capturedImage.uri) {
      let base64Image = capturedImage.base64;
      
      if (!base64Image) {
        // If base64 is not available directly, read the file and convert it
        const fileContent = await FileSystem.readAsStringAsync(capturedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        base64Image = fileContent;
      }
      
      navigation.navigate('Analysis', {
        imageUri: capturedImage.uri,
        base64Image: base64Image,
      });
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      {previewVisible && capturedImage ? (
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: capturedImage.uri }} 
            style={styles.cameraPreview}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={retakePicture}
            >
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={analyzeImage}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Analyze</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={type}
            ratio="4:3"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.faceFrame} />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={pickImage}
              >
                <Text style={styles.buttonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={takePicture}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Capture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setType(
                    type === CameraType.back
                      ? CameraType.front
                      : CameraType.back
                  );
                }}
              >
                <Text style={styles.buttonText}>Flip</Text>
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
    backgroundColor: '#f8f9fa',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    minWidth: 100,
  },
  buttonText: {
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#4361ee',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'white',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPreview: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceFrame: {
    width: 250,
    height: 330,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 20,
  },
});

export default CameraScreen; 
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Linking, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Share
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { getApiKey, storeApiKey, isValidApiKey, API_KEY_STORAGE_KEY } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obscureApiKey, encrypt, decrypt } from '../utils/encryption';
import { MaterialIcons } from '@expo/vector-icons';

type ApiKeyScreenRouteProp = RouteProp<RootStackParamList, 'ApiKey'>;

type ApiKeyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ApiKey'>;
  route: ApiKeyScreenRouteProp;
};

const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ navigation, route }) => {
  const [apiKey, setApiKey] = useState('');
  const [displayApiKey, setDisplayApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isObscured, setIsObscured] = useState(true);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importedKey, setImportedKey] = useState('');
  const [encryptedKeyToShare, setEncryptedKeyToShare] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  
  // Check if the screen is opened in "force" mode (e.g. for changing API key)
  const forceShowScreen = route.params?.forceShow === true;
  
  // Check if API key already exists
  useEffect(() => {
    const checkExistingApiKey = async () => {
      try {
        const storedKey = await getApiKey();
        
        // If we're here because of an error or returning to reset the key, show the stored key
        if (!isLoading && errorMessage) {
          if (isValidApiKey(storedKey)) {
            setApiKey(storedKey);
            setDisplayApiKey(isObscured ? obscureApiKey(storedKey) : storedKey);
          }
        }
        
        // If valid API key exists and not in force mode, navigate to Camera screen
        if (isValidApiKey(storedKey) && !errorMessage && !forceShowScreen) {
          // If valid API key exists, navigate to Camera screen
          navigation.replace('Camera');
          return;
        }
        
        // If we have a valid key and we're in force mode, display it
        if (isValidApiKey(storedKey) && forceShowScreen) {
          setApiKey(storedKey);
          setDisplayApiKey(isObscured ? obscureApiKey(storedKey) : storedKey);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking API key:', error);
        setErrorMessage('There was a problem accessing your stored API key.');
        setIsLoading(false);
      }
    };
    
    checkExistingApiKey();
  }, [navigation, errorMessage, isLoading, isObscured, forceShowScreen]);
  
  // Update display value when input changes
  const handleKeyChange = (text: string) => {
    setApiKey(text);
    setDisplayApiKey(isObscured ? obscureApiKey(text) : text);
  };
  
  // Toggle visibility of API key
  const toggleVisibility = () => {
    setIsObscured(!isObscured);
    setDisplayApiKey(isObscured ? apiKey : obscureApiKey(apiKey));
  };
  
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      // Use the proper store function which now encrypts the key
      const success = await storeApiKey(apiKey.trim());
      
      if (success) {
        Alert.alert(
          'Success', 
          'API key saved securely and encrypted on your device!',
          [{ text: 'OK', onPress: () => navigation.replace('Camera') }]
        );
      } else {
        Alert.alert(
          'Error', 
          'Failed to save API key securely. Please try again.',
          [{ text: 'Try Again' }]
        );
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      setErrorMessage('Failed to save API key securely. Please try again.');
      Alert.alert('Error', 'An unexpected error occurred while saving your API key');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClearApiKey = async () => {
    try {
      // Clear the key from both AsyncStorage and Keychain
      await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
      
      // Reset the UI state
      setApiKey('');
      setDisplayApiKey('');
      
      Alert.alert('Success', 'API key cleared successfully');
    } catch (error) {
      console.error('Error clearing API key:', error);
      Alert.alert('Error', 'Failed to clear API key');
    }
  };
  
  // Create encrypted key to share with friends
  const prepareKeyForSharing = async () => {
    try {
      const currentKey = await getApiKey();
      if (isValidApiKey(currentKey)) {
        // Encrypt the key for sharing
        const encryptedKey = encrypt(currentKey);
        setEncryptedKeyToShare(encryptedKey);
        setShareModalVisible(true);
      } else {
        Alert.alert('Error', 'No valid API key found to share.');
      }
    } catch (error) {
      console.error('Error preparing key for sharing:', error);
      Alert.alert('Error', 'Failed to prepare API key for sharing.');
    }
  };

  // Share encrypted key with friends
  const shareEncryptedKey = async () => {
    try {
      await Share.share({
        message: `Use this encrypted API key in AIBeautyLens app: ${encryptedKeyToShare}`,
      });
    } catch (error) {
      console.error('Error sharing key:', error);
    }
  };
  
  // Handle importing an encrypted key
  const handleImportKey = () => {
    if (!importedKey.trim()) {
      Alert.alert('Error', 'Please enter an encrypted API key');
      return;
    }
    
    try {
      // Attempt to decrypt the key
      const decryptedKey = decrypt(importedKey.trim());
      
      if (isValidApiKey(decryptedKey)) {
        // If valid, save the decrypted key
        setApiKey(decryptedKey);
        setDisplayApiKey(isObscured ? obscureApiKey(decryptedKey) : decryptedKey);
        setImportModalVisible(false);
        
        // Confirm to save the imported key
        Alert.alert(
          'Valid Key Found',
          'Would you like to save this API key to your device?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Save Key', 
              onPress: async () => {
                const success = await storeApiKey(decryptedKey);
                if (success) {
                  Alert.alert('Success', 'Imported API key saved successfully!',
                    [{ text: 'OK', onPress: () => navigation.replace('Camera') }]
                  );
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'The encrypted key could not be validated. Please check and try again.');
      }
    } catch (error) {
      console.error('Error importing key:', error);
      Alert.alert('Error', 'Failed to import encrypted key. Make sure the format is correct.');
    }
  };
  
  const handleGetApiKey = () => {
    Linking.openURL('https://ai.google.dev/tutorials/setup');
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361ee" />
        <Text style={styles.loadingText}>Checking API key...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {forceShowScreen ? 'Edit API Key' : 'Welcome to AIBeautyLens'}
          </Text>
          
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : (
            <Text style={styles.description}>
              {forceShowScreen 
                ? 'You can update or change your Gemini API key below. Your key will be encrypted and stored securely.'
                : 'To use this app, you need to provide a Gemini API key. Your key will be encrypted and stored securely on your device.'}
            </Text>
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your Gemini API key"
              value={displayApiKey}
              onChangeText={handleKeyChange}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={isObscured}
            />
            <TouchableOpacity 
              style={styles.visibilityToggle}
              onPress={toggleVisibility}
            >
              <Text style={styles.visibilityText}>
                {isObscured ? 'SHOW' : 'HIDE'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.securityNote}>
            Your API key will be encrypted before storage to enhance security.
          </Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSaveApiKey}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {forceShowScreen ? 'Update API Key' : 'Save API Key'}
              </Text>
            )}
          </TouchableOpacity>
          
          {forceShowScreen && (
            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={handleClearApiKey}
            >
              <Text style={styles.clearButtonText}>Clear API Key</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => setImportModalVisible(true)}
            >
              <MaterialIcons name="file-download" size={18} color="#4361ee" />
              <Text style={styles.optionText}>Import Encrypted Key</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={prepareKeyForSharing}
            >
              <MaterialIcons name="share" size={18} color="#4361ee" />
              <Text style={styles.optionText}>Share My Key</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={handleGetApiKey}>
            <Text style={styles.linkText}>
              Don't have an API key? Learn how to get one
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Import Key Modal */}
      <Modal
        visible={importModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import Encrypted API Key</Text>
            <Text style={styles.modalDescription}>
              Paste the encrypted API key shared with you:
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Paste encrypted key here"
              value={importedKey}
              onChangeText={setImportedKey}
              autoCapitalize="none"
              autoCorrect={false}
              multiline={true}
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setImportModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.importButton]} 
                onPress={handleImportKey}
              >
                <Text style={styles.importButtonText}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Share Key Modal */}
      <Modal
        visible={shareModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Encrypted API Key</Text>
            <Text style={styles.modalDescription}>
              This is your encrypted API key that you can share with friends for testing:
            </Text>
            
            <View style={styles.encryptedKeyContainer}>
              <Text style={styles.encryptedKeyText}>{encryptedKeyToShare}</Text>
            </View>
            
            <Text style={styles.shareNote}>
              Note: This encrypted key can only be used in the AIBeautyLens app.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShareModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.importButton]} 
                onPress={shareEncryptedKey}
              >
                <MaterialIcons name="share" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.importButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 70, // Space for the toggle button
    backgroundColor: '#fff',
    fontSize: 16,
  },
  visibilityToggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#eee',
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  securityNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4361ee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#4361ee',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  optionText: {
    color: '#4361ee',
    marginLeft: 5,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  importButton: {
    backgroundColor: '#4361ee',
  },
  importButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  encryptedKeyContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  encryptedKeyText: {
    fontSize: 14,
    color: '#555',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  shareNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: 5,
  },
  clearButton: {
    backgroundColor: '#f44336',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ApiKeyScreen; 
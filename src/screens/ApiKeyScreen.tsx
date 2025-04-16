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
  Share,
  Switch
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { 
  getApiKey, 
  storeApiKey, 
  isValidApiKey, 
  API_KEY_STORAGE_KEY, 
  getProjectId, 
  storeProjectId, 
  getRegion, 
  storeRegion, 
  DEFAULT_VERTEX_REGION 
} from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obscureApiKey, encrypt, decrypt } from '../utils/encryption';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { checkRuntimeSettings } from '../services/geminiService';

type ApiKeyScreenRouteProp = RouteProp<RootStackParamList, 'ApiKey'>;

type ApiKeyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ApiKey'>;
  route: ApiKeyScreenRouteProp;
};

const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ navigation, route }) => {
  const [apiKey, setApiKey] = useState('');
  const [displayApiKey, setDisplayApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [region, setRegion] = useState(DEFAULT_VERTEX_REGION);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isObscured, setIsObscured] = useState(true);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importedKey, setImportedKey] = useState('');
  const [encryptedKeyToShare, setEncryptedKeyToShare] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [useOAuth, setUseOAuth] = useState(false);
  const [oauthClientId, setOAuthClientId] = useState('');
  
  // Check if the screen is opened in "force" mode (e.g. for changing API key)
  const forceShowScreen = route.params?.forceShow === true;
  
  // Check if API key already exists
  useEffect(() => {
    const checkExistingSettings = async () => {
      try {
        const storedKey = await getApiKey();
        const storedProjectId = await getProjectId();
        const storedRegion = await getRegion();
        
        // Load project ID and region
        setProjectId(storedProjectId);
        setRegion(storedRegion);
        
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
    
    checkExistingSettings();
  }, [navigation, errorMessage, isLoading, isObscured, forceShowScreen]);
  
  // Check for existing OAuth settings
  useEffect(() => {
    const checkOAuthSettings = async () => {
      try {
        const savedUseOAuth = await AsyncStorage.getItem('useOAuth');
        const savedClientId = await AsyncStorage.getItem('oauthClientId');
        
        if (savedUseOAuth) {
          setUseOAuth(savedUseOAuth === 'true');
        }
        
        if (savedClientId) {
          setOAuthClientId(savedClientId);
        }
      } catch (error) {
        console.error('Error retrieving OAuth settings:', error);
      }
    };
    
    checkOAuthSettings();
  }, []);
  
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
      
      // Also store the Vertex AI Project ID and Region
      if (projectId.trim()) {
        await storeProjectId(projectId.trim());
      }
      
      if (region.trim()) {
        await storeRegion(region.trim());
      }
      
      // Save OAuth settings
      await AsyncStorage.setItem('useOAuth', useOAuth.toString());
      if (useOAuth && oauthClientId) {
        await AsyncStorage.setItem('oauthClientId', oauthClientId);
      }
      
      if (success) {
        Alert.alert(
          'Success', 
          'API key and Vertex AI settings saved securely!',
          [{ text: 'OK', onPress: () => navigation.replace('Camera') }]
        );
      } else {
        Alert.alert(
          'Error', 
          'Failed to save settings securely. Please try again.',
          [{ text: 'Try Again' }]
        );
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Failed to save settings securely. Please try again.');
      Alert.alert('Error', 'An unexpected error occurred while saving your settings');
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
      
      // Clear OAuth settings
      await AsyncStorage.removeItem('useOAuth');
      await AsyncStorage.removeItem('oauthClientId');
      
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
  
  // Toggle OAuth usage
  const toggleOAuth = () => {
    setUseOAuth(!useOAuth);
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
            {forceShowScreen ? 'Edit API Settings' : 'Welcome to AIBeautyLens'}
          </Text>
          
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : (
            <Text style={styles.description}>
              {forceShowScreen 
                ? 'Update your API key and Vertex AI settings.'
                : 'To use this app, you need a Gemini API key.'}
            </Text>
          )}
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Gemini API Key</Text>
            <Text style={styles.sectionDescription}>
              Required for facial analysis and image generation.
            </Text>
          
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your Gemini API key"
                value={displayApiKey}
                onChangeText={handleKeyChange}
                autoCapitalize="none"
                secureTextEntry={isObscured}
              />
              <TouchableOpacity style={styles.visibilityButton} onPress={toggleVisibility}>
                <MaterialIcons name={isObscured ? 'visibility' : 'visibility-off'} size={24} color="#4361ee" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Vertex AI Settings</Text>
            <Text style={styles.sectionDescription}>
              Required for using the Imagen API endpoints on Vertex AI.
            </Text>
            
            <Text style={styles.inputLabel}>Google Cloud Project ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Google Cloud Project ID"
              value={projectId}
              onChangeText={setProjectId}
              autoCapitalize="none"
            />
            
            <Text style={styles.inputLabel}>Region</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter region (e.g. us-central1)"
              value={region}
              onChangeText={setRegion}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>OAuth Configuration</Text>
            <Text style={styles.sectionDescription}>
              Use OAuth for authentication instead of API key
            </Text>
            
            <View style={styles.oauthSwitchContainer}>
              <Text style={styles.inputLabel}>Use OAuth</Text>
              <Switch
                value={useOAuth}
                onValueChange={toggleOAuth}
                trackColor={{ false: "#ddd", true: "#bbd0ff" }}
                thumbColor={useOAuth ? "#4361ee" : "#f4f3f4"}
              />
            </View>
            
            {useOAuth && (
              <>
                <Text style={styles.inputLabel}>OAuth Client ID</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={oauthClientId}
                    onChangeText={setOAuthClientId}
                    placeholder="Enter your OAuth Client ID"
                    placeholderTextColor="#aaa"
                    autoCapitalize="none"
                  />
                </View>
              </>
            )}
          </View>
          
          <TouchableOpacity style={styles.getKeyButton} onPress={handleGetApiKey}>
            <Text style={styles.getKeyButtonText}>How to Get an API Key</Text>
          </TouchableOpacity>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveApiKey} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Settings</Text>
              )}
            </TouchableOpacity>
            
            {forceShowScreen && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearApiKey}>
                <Text style={styles.clearButtonText}>Clear API Key</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Only show key sharing options if in force/edit mode */}
          {forceShowScreen && (
            <View style={styles.advancedContainer}>
              <Text style={styles.advancedTitle}>Advanced Options</Text>
              <View style={styles.advancedButtons}>
                <TouchableOpacity style={styles.advancedButton} onPress={() => setImportModalVisible(true)}>
                  <MaterialIcons name="file-download" size={20} color="#4361ee" />
                  <Text style={styles.advancedButtonText}>Import Key</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.advancedButton} onPress={prepareKeyForSharing}>
                  <MaterialIcons name="share" size={20} color="#4361ee" />
                  <Text style={styles.advancedButtonText}>Share Key</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Import Key Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={importModalVisible}
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
            animationType="slide"
            transparent={true}
            visible={shareModalVisible}
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
        </View>
      </ScrollView>
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
  visibilityButton: {
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
  formSection: {
    marginBottom: 20,
    width: '100%',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  saveButton: {
    width: '48%',
    height: 50,
    backgroundColor: '#4361ee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#f44336',
    marginLeft: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  advancedContainer: {
    width: '100%',
    marginBottom: 20,
  },
  advancedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  advancedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  advancedButtonText: {
    color: '#4361ee',
    marginLeft: 5,
    fontSize: 14,
  },
  getKeyButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4361ee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  getKeyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  oauthSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default ApiKeyScreen; 
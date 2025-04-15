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
  ScrollView
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { getApiKey, storeApiKey, isValidApiKey, API_KEY_STORAGE_KEY } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ApiKeyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ApiKey'>;
};

const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ navigation }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Check if API key already exists
  useEffect(() => {
    const checkExistingApiKey = async () => {
      try {
        const storedKey = await getApiKey();
        // If we're here because of an error or returning to reset the key, show the current key
        if (!isLoading && errorMessage) {
          setApiKey(storedKey);
        }
        
        if (isValidApiKey(storedKey) && !errorMessage) {
          // If valid API key exists, navigate to Camera screen
          navigation.replace('Camera');
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking API key:', error);
        setErrorMessage('There was a problem accessing your stored API key.');
        setIsLoading(false);
      }
    };
    
    checkExistingApiKey();
  }, [navigation, errorMessage, isLoading]);
  
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      // First try to save directly to AsyncStorage as a fallback
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      
      // Then attempt to use the full secure method
      const success = await storeApiKey(apiKey.trim());
      
      if (success) {
        Alert.alert(
          'Success', 
          'API key saved successfully!',
          [{ text: 'OK', onPress: () => navigation.replace('Camera') }]
        );
      } else {
        // Even if the secure storage failed, the AsyncStorage save might have worked
        Alert.alert(
          'Partial Success', 
          'API key saved but secure storage may not be available on this device. The app will still function.',
          [{ text: 'Continue', onPress: () => navigation.replace('Camera') }]
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
          <Text style={styles.title}>Welcome to AIBeautyLens</Text>
          
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : (
            <Text style={styles.description}>
              To use this app, you need to provide a Gemini API key.
              This key will be stored securely on your device.
            </Text>
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSaveApiKey}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save API Key</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleGetApiKey}>
            <Text style={styles.linkText}>
              Don't have an API key? Learn how to get one
            </Text>
          </TouchableOpacity>
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
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
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
});

export default ApiKeyScreen; 
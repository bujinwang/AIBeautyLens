import React, { useState, useEffect, useLayoutEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { 
  getApiKey, 
  storeApiKey, 
  isValidApiKey, 
  API_KEY_STORAGE_KEY,
} from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { checkRuntimeSettings } from '../services/geminiService';

type ApiKeyScreenRouteProp = RouteProp<RootStackParamList, 'ApiKey'>;

type ApiKeyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ApiKey'>;
  route: ApiKeyScreenRouteProp;
};

const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ navigation, route }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Check if the screen is opened in "force" mode (e.g. for changing API key)
  const forceShowScreen = route.params?.forceShow === true;
  
  // Set up the navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: forceShowScreen ? 'Edit API Key' : 'API Settings',
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, forceShowScreen]);
  
  // Check if API key already exists
  useEffect(() => {
    const checkExistingSettings = async () => {
      try {
        const storedKey = await getApiKey();
        
        // If we're here because of an error or returning to reset the key, show placeholder
        if (!isLoading && errorMessage) {
          if (isValidApiKey(storedKey)) {
            setApiKey('********');
          }
        }
        
        // If valid API key exists and not in force mode, navigate to Camera screen
        if (isValidApiKey(storedKey) && !errorMessage && !forceShowScreen) {
          navigation.replace('Camera');
          return;
        }
        
        // If we have a valid key and we're in force mode, show placeholder
        if (isValidApiKey(storedKey) && forceShowScreen) {
          setApiKey('********');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking API key:', error);
        setErrorMessage('There was a problem accessing your stored API key.');
        setIsLoading(false);
      }
    };
    
    checkExistingSettings();
  }, [navigation, errorMessage, isLoading, forceShowScreen]);
  
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      const success = await storeApiKey(apiKey.trim());
      
      if (success) {
        Alert.alert(
          'Success', 
          'API key saved securely!',
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
      await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
      setApiKey('');
      Alert.alert('Success', 'API key cleared successfully');
    } catch (error) {
      console.error('Error clearing API key:', error);
      Alert.alert('Error', 'Failed to clear API key');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>API Settings</Text>
          
          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your API key"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isSaving && styles.buttonDisabled]}
            onPress={handleSaveApiKey}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Save API Key</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClearApiKey}
          >
            <Text style={styles.buttonText}>Clear API Key</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  headerButton: {
    padding: 10,
  },
});

export default ApiKeyScreen; 
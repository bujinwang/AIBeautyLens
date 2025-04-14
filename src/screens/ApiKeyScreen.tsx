import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_KEY_STORAGE_KEY, isValidApiKey } from '../config/api';

type ApiKeyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ApiKey'>;

type Props = {
  navigation: ApiKeyScreenNavigationProp;
};

const ApiKeyScreen: React.FC<Props> = ({ navigation }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidKey, setIsValidKey] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  // Validate API key format when it changes
  useEffect(() => {
    if (apiKey) {
      const valid = isValidApiKey(apiKey);
      setIsValidKey(valid);
      if (valid) {
        setValidationMessage('API key format looks valid');
      } else if (apiKey.length > 0) {
        setValidationMessage('API key format is invalid. Keys should be at least 10 characters.');
      } else {
        setValidationMessage('');
      }
    } else {
      setIsValidKey(false);
      setValidationMessage('');
    }
  }, [apiKey]);

  const loadApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
        setIsValidKey(isValidApiKey(savedKey));
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    // If the key doesn't look valid, confirm with the user
    if (!isValidKey) {
      Alert.alert(
        'Warning',
        'The API key format looks invalid. Are you sure you want to save it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => saveKeyToStorage() }
        ]
      );
    } else {
      saveKeyToStorage();
    }
  };

  const saveKeyToStorage = async () => {
    try {
      setSaving(true);
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      Alert.alert('Success', 'API key saved successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Camera') }
      ]);
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const openDeepSeekWebsite = () => {
    Linking.openURL('https://deepseek.com');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>DeepSeek API Key</Text>
        
        <Text style={styles.description}>
          Please enter your DeepSeek API key to use the facial analysis and treatment simulation features.
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isValidKey && styles.validInput]}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter DeepSeek API Key"
            placeholderTextColor="#999"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {validationMessage ? (
            <Text style={[
              styles.validationMessage, 
              isValidKey ? styles.validMessage : styles.invalidMessage
            ]}>
              {validationMessage}
            </Text>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveApiKey}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save API Key</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.hint}>
          You can get a DeepSeek API key by signing up at deepseek.com
        </Text>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={openDeepSeekWebsite}
        >
          <Text style={styles.linkButtonText}>Visit DeepSeek Website</Text>
        </TouchableOpacity>
        
        <Text style={styles.debugInfo}>
          {__DEV__ ? 'Running in development mode' : 'Running in production mode'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  validInput: {
    borderColor: '#4CAF50',
  },
  validationMessage: {
    marginTop: 5,
    fontSize: 14,
  },
  validMessage: {
    color: '#4CAF50',
  },
  invalidMessage: {
    color: '#F44336',
  },
  saveButton: {
    backgroundColor: '#4361ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  hint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },
  linkButton: {
    marginTop: 10,
    padding: 10,
  },
  linkButtonText: {
    color: '#4361ee',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  debugInfo: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default ApiKeyScreen; 
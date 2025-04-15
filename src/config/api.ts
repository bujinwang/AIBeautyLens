// API Configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// API key settings
const KEYCHAIN_SERVICE = 'ai_beauty_lens';
const KEYCHAIN_ACCOUNT = 'api_key';
export const API_KEY_STORAGE_KEY = 'gemini_api_key';

// Environment variable or fallback key (only for development)
export const FALLBACK_API_KEY = 'YOUR_GEMINI_API_KEY';

// API timeout in milliseconds
export const API_TIMEOUT = 30000; // 30 seconds

// Validate API key format
export const isValidApiKey = (key: string): boolean => {
  // This is a simple check - adjust based on Gemini's actual key format
  return Boolean(key && key.length > 10 && key !== 'YOUR_GEMINI_API_KEY');
};

// Check if Keychain is available
const isKeychainAvailable = async (): Promise<boolean> => {
  try {
    if (!Keychain || typeof Keychain.setGenericPassword !== 'function') {
      return false;
    }
    // Try a simple operation to verify it works
    await Keychain.setGenericPassword('test', 'test', { service: 'test' });
    await Keychain.resetGenericPassword({ service: 'test' });
    return true;
  } catch (error) {
    console.warn('Keychain is not available, falling back to AsyncStorage only', error);
    return false;
  }
};

// Store API key securely
export const storeApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const keychainAvailable = await isKeychainAvailable();
    
    // Try to store in keychain if available
    if (keychainAvailable) {
      try {
        await Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, apiKey, {
          service: KEYCHAIN_SERVICE,
        });
      } catch (keychainError) {
        console.warn('Failed to store in Keychain, using AsyncStorage only', keychainError);
      }
    }
    
    // Always store in AsyncStorage as a fallback
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    
    return true;
  } catch (error) {
    console.error('Error storing API key:', error);
    return false;
  }
};

// Get API key from secure storage
export const getApiKey = async (): Promise<string> => {
  try {
    const keychainAvailable = await isKeychainAvailable();
    
    // Try to get from secure keychain if available
    if (keychainAvailable) {
      try {
        const credentials = await Keychain.getGenericPassword({
          service: KEYCHAIN_SERVICE,
        });
        
        if (credentials && credentials.password && isValidApiKey(credentials.password)) {
          return credentials.password;
        }
      } catch (keychainError) {
        console.warn('Failed to retrieve from Keychain, using AsyncStorage', keychainError);
      }
    }
    
    // Always check AsyncStorage as a fallback
    const storedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    
    if (storedKey && isValidApiKey(storedKey)) {
      // If found in AsyncStorage and keychain is available, try to migrate it
      if (keychainAvailable) {
        try {
          await Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, storedKey, {
            service: KEYCHAIN_SERVICE,
          });
        } catch (migrateError) {
          console.warn('Failed to migrate key to Keychain', migrateError);
        }
      }
      return storedKey;
    }
    
    console.warn('No valid API key found, using fallback key');
    return FALLBACK_API_KEY;
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return FALLBACK_API_KEY;
  }
};

// API Endpoints
export const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models';
export const GEMINI_VISION_API = `${GEMINI_API}/gemini-2.5-pro-exp-03-25:generateContent`;
export const IMAGEN_API = 'https://generativelanguage.googleapis.com/v1beta/models';
export const IMAGEN_GENERATION_API = `${IMAGEN_API}/imagen-3.0-generate-002:predict`;
export const IMAGEN_INPAINTING_API = 'https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/imagen-3.0-edit-image-inpainting:predict';

// Google Cloud Project ID - replace with your project ID when using Vertex AI
// You need to create a project in the Google Cloud Console and enable the Vertex AI API
// For inpainting to work, this must be configured with a valid project ID
export const GOOGLE_CLOUD_PROJECT_ID = 'your-project-id';

// Current provider - hardcoded to Gemini
export const CURRENT_PROVIDER = 'gemini';

// API Models
export const MODELS = {
  GEMINI_PRO: 'gemini-2.5-pro-exp-03-25',
  IMAGEN: 'imagen-3.0-generate-002',
}; 
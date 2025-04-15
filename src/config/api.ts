// API Configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { encrypt, decrypt } from '../utils/encryption';
import { Platform } from 'react-native';

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
  // Also prevent false positives from decryption errors
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  // Make sure the key is not our fallback key and has valid length
  return key.length > 10 && key !== 'YOUR_GEMINI_API_KEY' && !key.includes('undefined');
};

// Check if Keychain is available in a more robust way
const isKeychainAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.log('Keychain not available on web platform');
    return false;
  }
  
  try {
    // First verify that Keychain object exists
    if (!Keychain || typeof Keychain.setGenericPassword !== 'function') {
      console.log('Keychain API not available');
      return false;
    }
    
    // Try a simple operation with error handling
    try {
      await Keychain.setGenericPassword('test_user', 'test_pass', { 
        service: 'test_keychain_check',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
      });
      
      // If we get here, it's working properly
      await Keychain.resetGenericPassword({ service: 'test_keychain_check' });
      return true;
    } catch (innerError) {
      console.warn('Keychain operations failed:', innerError);
      return false;
    }
  } catch (error) {
    console.warn('Keychain availability check failed:', error);
    return false;
  }
};

// Store API key securely with encryption
export const storeApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Encrypt the API key before storing
    const encryptedKey = encrypt(apiKey);
    console.log('Encrypted key length:', encryptedKey ? encryptedKey.length : 0);
    
    // Always store in AsyncStorage first as a fallback
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, encryptedKey);
    
    // Try keychain if available
    const keychainAvailable = await isKeychainAvailable();
    if (keychainAvailable) {
      try {
        await Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, encryptedKey, {
          service: KEYCHAIN_SERVICE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
        });
        console.log('Successfully stored in Keychain');
      } catch (keychainError) {
        console.warn('Failed to store in Keychain, using AsyncStorage only', keychainError);
      }
    } else {
      console.log('Keychain not available, using AsyncStorage only');
    }
    
    return true;
  } catch (error) {
    console.error('Error storing API key:', error);
    // Try with just the original key as a fallback
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      console.log('Stored unencrypted key as fallback');
      return true;
    } catch (fallbackError) {
      console.error('Failed to store even unencrypted key:', fallbackError);
      return false;
    }
  }
};

// Get API key from secure storage and decrypt it
export const getApiKey = async (): Promise<string> => {
  try {
    // First, try to get from AsyncStorage which is more reliable
    const encryptedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    let decryptedKey = '';
    
    if (encryptedKey) {
      try {
        // Decrypt the stored key
        decryptedKey = decrypt(encryptedKey);
        
        if (isValidApiKey(decryptedKey)) {
          console.log('Successfully retrieved and decrypted key from AsyncStorage');
          return decryptedKey;
        }
        
        // If decryption fails, the key might be stored unencrypted
        if (isValidApiKey(encryptedKey)) {
          console.log('Key in AsyncStorage appears to be unencrypted');
          return encryptedKey;
        }
      } catch (decryptError) {
        console.warn('Error decrypting key from AsyncStorage:', decryptError);
        // If decryption fails, the key might be stored unencrypted
        if (isValidApiKey(encryptedKey)) {
          console.log('Using direct key from AsyncStorage as fallback');
          return encryptedKey;
        }
      }
    }
    
    // Try keychain as a second attempt if available
    const keychainAvailable = await isKeychainAvailable();
    if (keychainAvailable) {
      try {
        const credentials = await Keychain.getGenericPassword({
          service: KEYCHAIN_SERVICE,
        });
        
        if (credentials && credentials.password) {
          try {
            // Decrypt the stored key
            const keyFromKeychain = decrypt(credentials.password);
            if (isValidApiKey(keyFromKeychain)) {
              console.log('Successfully retrieved and decrypted key from Keychain');
              return keyFromKeychain;
            }
            
            // If decryption fails, try using the raw value
            if (isValidApiKey(credentials.password)) {
              console.log('Using direct key from Keychain');
              return credentials.password;
            }
          } catch (keychainDecryptError) {
            console.warn('Error decrypting key from Keychain:', keychainDecryptError);
            // If decryption fails, the key might be stored unencrypted
            if (isValidApiKey(credentials.password)) {
              console.log('Using unencrypted key from Keychain');
              return credentials.password;
            }
          }
        }
      } catch (keychainError) {
        console.warn('Failed to retrieve from Keychain', keychainError);
      }
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

// API Models
export const MODELS = {
  GEMINI_PRO: 'gemini-2.5-pro-exp-03-25',
  IMAGEN: 'imagen-3.0-generate-002',
}; 
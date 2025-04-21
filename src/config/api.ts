// API Configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { encrypt, decrypt } from '../utils/encryption';
import { Platform } from 'react-native';

// Standardized logging functions
const logStorageError = (context: string, error: any) => {
  console.error(`[Storage Error] ${context}: ${error?.message || error}`);
};

const logKeychain = (context: string, isError = false) => {
  const prefix = isError ? '[Keychain Error]' : '[Keychain Info]';
  console.log(`${prefix} ${context}`);
};

// API key settings
const KEYCHAIN_SERVICE = 'ai_beauty_lens';
const KEYCHAIN_ACCOUNT = 'api_key';
export const API_KEY_STORAGE_KEY = 'gemini_api_key';

// Environment variable or fallback key (only for development)
export const FALLBACK_API_KEY = 'AIzaSyCF5JIUoRuuqb5Cd6D31_aSjsZ7Wm_85-w';

// API timeout in milliseconds
export const API_TIMEOUT = 60000; // 60 seconds

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

// Check if Keychain is available
const isKeychainAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    logKeychain('Not available on web platform');
    return false;
  }

  try {
    if (!Keychain || typeof Keychain.setGenericPassword !== 'function' || typeof Keychain.getGenericPassword !== 'function') {
      logKeychain('API not available or incomplete');
      return false;
    }

    if (__DEV__) {
      logKeychain('Development environment detected, skipping test');
      return true;
    }

    try {
      await Keychain.setGenericPassword('test_user', 'test_pass', {
        service: 'test_keychain_check',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
      });
      await Keychain.resetGenericPassword({ service: 'test_keychain_check' });
      return true;
    } catch (error) {
      logKeychain('Operations test failed', true);
      return false;
    }
  } catch (error) {
    logKeychain('Availability check failed', true);
    return false;
  }
};

// Store API key securely
export const storeApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const encryptedKey = encrypt(apiKey);
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, encryptedKey);

    const keychainAvailable = await isKeychainAvailable();
    if (keychainAvailable) {
      try {
        await Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, encryptedKey, {
          service: KEYCHAIN_SERVICE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
        });
        logKeychain('API key stored successfully');
      } catch (error) {
        logKeychain('Storage failed, using AsyncStorage only', true);
      }
    }

    return true;
  } catch (error) {
    logStorageError('Failed to store API key', error);
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      logKeychain('Stored unencrypted key as fallback');
      return true;
    } catch (fallbackError) {
      logStorageError('Failed to store unencrypted key', fallbackError);
      return false;
    }
  }
};

// Cache for API key to prevent excessive storage access and logging
let cachedApiKey: string | null = null;
let lastApiKeyFetch = 0;
const API_KEY_CACHE_DURATION = 60000; // 1 minute cache

// Add a timeout wrapper for async operations
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    console.warn('Operation timed out, using fallback value');
    return fallback;
  }
};

// Get API key from secure storage
export const getApiKey = async (): Promise<string> => {
  try {
    const now = Date.now();
    if (cachedApiKey && (now - lastApiKeyFetch < API_KEY_CACHE_DURATION)) {
      return cachedApiKey;
    }

    const encryptedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    if (encryptedKey) {
      try {
        const decryptedKey = decrypt(encryptedKey);
        if (isValidApiKey(decryptedKey)) {
          cachedApiKey = decryptedKey;
          lastApiKeyFetch = now;
          return decryptedKey;
        }

        if (isValidApiKey(encryptedKey)) {
          cachedApiKey = encryptedKey;
          lastApiKeyFetch = now;
          return encryptedKey;
        }
      } catch (error) {
        if (isValidApiKey(encryptedKey)) {
          cachedApiKey = encryptedKey;
          lastApiKeyFetch = now;
          return encryptedKey;
        }
      }
    }

    const keychainAvailable = await isKeychainAvailable();
    if (keychainAvailable) {
      try {
        const credentials = await Keychain.getGenericPassword({
          service: KEYCHAIN_SERVICE,
        });

        if (credentials) {
          try {
            const keyFromKeychain = decrypt(credentials.password);
            if (isValidApiKey(keyFromKeychain)) {
              cachedApiKey = keyFromKeychain;
              lastApiKeyFetch = now;
              return keyFromKeychain;
            }

            if (isValidApiKey(credentials.password)) {
              cachedApiKey = credentials.password;
              lastApiKeyFetch = now;
              return credentials.password;
            }
          } catch (error) {
            if (isValidApiKey(credentials.password)) {
              cachedApiKey = credentials.password;
              lastApiKeyFetch = now;
              return credentials.password;
            }
          }
        }
      } catch (error) {
        // Silent fail and continue to fallback
      }
    }

    if (__DEV__) {
      logKeychain('Using fallback API key in development');
      return FALLBACK_API_KEY;
    }

    throw new Error('No valid API key found');
  } catch (error) {
    logStorageError('Error retrieving API key', error);
    if (__DEV__) {
      return FALLBACK_API_KEY;
    }
    throw error;
  }
};

// API Endpoints
export const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models';
export const GEMINI_VISION_API = `${GEMINI_API}/gemini-2.0-flash:generateContent`;
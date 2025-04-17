// API Configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { encrypt, decrypt } from '../utils/encryption';
import { Platform } from 'react-native';
import { getAccessToken, OAUTH_ACCESS_TOKEN_KEY, OAUTH_TOKEN_EXPIRY_KEY, OAUTH_CLIENT_ID_KEY } from '../utils/oauth';

// API key settings
const KEYCHAIN_SERVICE = 'ai_beauty_lens';
const KEYCHAIN_ACCOUNT = 'api_key';
export const API_KEY_STORAGE_KEY = 'gemini_api_key';
export const VERTEX_PROJECT_ID_KEY = 'vertex_project_id';
export const VERTEX_REGION_KEY = 'vertex_region';

// Default region for Vertex AI
export const DEFAULT_VERTEX_REGION = 'us-central1';

// For backwards compatibility
export const GOOGLE_CLOUD_PROJECT_ID = 'gen-lang-client-0550117999';

// Environment variable or fallback key (only for development)
export const FALLBACK_API_KEY = 'AIzaSyCF5JIUoRuuqb5Cd6D31_aSjsZ7Wm_85-w';

// API timeout in milliseconds
export const API_TIMEOUT = 60000; // 60 seconds (increased to handle Vertex AI's longer processing time)

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
    // First verify that Keychain object exists and has the required methods
    if (!Keychain || typeof Keychain.setGenericPassword !== 'function' || typeof Keychain.getGenericPassword !== 'function') {
      console.log('Keychain API not available or incomplete');
      return false;
    }

    // In development, we'll skip the actual test operation to avoid the warning
    if (__DEV__) {
      console.log('Development environment detected, skipping keychain test');
      return true;
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

// Get API key from secure storage and decrypt it
export const getApiKey = async (): Promise<string> => {
  try {
    // Return cached key if available and not expired
    const now = Date.now();
    if (cachedApiKey && (now - lastApiKeyFetch < API_KEY_CACHE_DURATION)) {
      return cachedApiKey;
    }

    // Try to get OAuth token first for Vertex AI with a timeout
    try {
      const oauthToken = await withTimeout(getAccessToken(), 5000, null);
      if (oauthToken) {
        // Cache the token
        cachedApiKey = `Bearer ${oauthToken}`;
        lastApiKeyFetch = now;
        return cachedApiKey;
      }
    } catch (oauthError) {
      // Silently catch OAuth errors and continue with API key authentication
    }

    // First, try to get from AsyncStorage which is more reliable (with timeout)
    const encryptedKey = await withTimeout(
      AsyncStorage.getItem(API_KEY_STORAGE_KEY),
      3000,
      null
    );
    let decryptedKey = '';

    if (encryptedKey) {
      try {
        // Decrypt the stored key
        decryptedKey = decrypt(encryptedKey);

        if (isValidApiKey(decryptedKey)) {
          // Cache the key
          cachedApiKey = decryptedKey;
          lastApiKeyFetch = now;
          return decryptedKey;
        }

        // If decryption fails, the key might be stored unencrypted
        if (isValidApiKey(encryptedKey)) {
          // Cache the key
          cachedApiKey = encryptedKey;
          lastApiKeyFetch = now;
          return encryptedKey;
        }
      } catch (decryptError) {
        // If decryption fails, the key might be stored unencrypted
        if (isValidApiKey(encryptedKey)) {
          // Cache the key
          cachedApiKey = encryptedKey;
          lastApiKeyFetch = now;
          return encryptedKey;
        }
      }
    }

    // Try keychain as a second attempt if available (with timeout)
    const keychainAvailable = await withTimeout(isKeychainAvailable(), 3000, false);
    if (keychainAvailable) {
      try {
        const credentials = await withTimeout(
          Keychain.getGenericPassword({
            service: KEYCHAIN_SERVICE,
          }),
          3000,
          null
        );

        if (credentials && credentials.password) {
          try {
            // Decrypt the stored key
            const keyFromKeychain = decrypt(credentials.password);
            if (isValidApiKey(keyFromKeychain)) {
              // Cache the key
              cachedApiKey = keyFromKeychain;
              lastApiKeyFetch = Date.now();
              return keyFromKeychain;
            }

            // If decryption fails, try using the raw value
            if (isValidApiKey(credentials.password)) {
              // Cache the key
              cachedApiKey = credentials.password;
              lastApiKeyFetch = Date.now();
              return credentials.password;
            }
          } catch (keychainDecryptError) {
            // If decryption fails, the key might be stored unencrypted
            if (isValidApiKey(credentials.password)) {
              // Cache the key
              cachedApiKey = credentials.password;
              lastApiKeyFetch = Date.now();
              return credentials.password;
            }
          }
        }
      } catch (keychainError) {
        // Silent fail and continue to fallback
      }
    }

    // Cache the fallback key
    cachedApiKey = FALLBACK_API_KEY;
    lastApiKeyFetch = Date.now();
    return FALLBACK_API_KEY;
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return FALLBACK_API_KEY;
  }
};

// Store Vertex AI project ID
export const storeProjectId = async (projectId: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(VERTEX_PROJECT_ID_KEY, projectId);
    return true;
  } catch (error) {
    console.error('Error storing project ID:', error);
    return false;
  }
};

// Get Vertex AI project ID
export const getProjectId = async (): Promise<string> => {
  try {
    const projectId = await AsyncStorage.getItem(VERTEX_PROJECT_ID_KEY);
    return projectId || '[your-project-id]';
  } catch (error) {
    console.error('Error retrieving project ID:', error);
    return '[your-project-id]';
  }
};

// Store Vertex AI region
export const storeRegion = async (region: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(VERTEX_REGION_KEY, region);
    return true;
  } catch (error) {
    console.error('Error storing region:', error);
    return false;
  }
};

// Get Vertex AI region
export const getRegion = async (): Promise<string> => {
  try {
    const region = await AsyncStorage.getItem(VERTEX_REGION_KEY);
    return region || DEFAULT_VERTEX_REGION;
  } catch (error) {
    console.error('Error retrieving region:', error);
    return DEFAULT_VERTEX_REGION;
  }
};

// Get formatted Vertex AI endpoint
export const getVertexEndpoint = async (modelPath: string): Promise<string> => {
  const region = await getRegion();
  const projectId = await getProjectId();
  return `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${modelPath}`;
};

// API Endpoints
export const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models';
export const GEMINI_VISION_API = `${GEMINI_API}/gemini-2.0-flash:generateContent`;
export const IMAGEN_API = 'https://generativelanguage.googleapis.com/v1beta/models';

// Vertex AI model paths
export const VERTEX_MODEL_PATHS = {
  IMAGEN_GENERATE: 'imagen-3.0-generate-002',
  IMAGEN_INPAINTING: 'imagen-3.0-edit-image-inpainting',
};

// Static endpoint definitions (these should be replaced with dynamic ones in code)
export const IMAGEN_GENERATION_API_STATIC = 'https://[your-region]-aiplatform.googleapis.com/v1/projects/[your-project-id]/locations/[your-region]/publishers/google/models/imagen-3.0-generate-002:predict';
export const IMAGEN_INPAINTING_API_STATIC = 'https://[your-region]-aiplatform.googleapis.com/v1/projects/[your-project-id]/locations/[your-region]/publishers/google/models/imagen-3.0-edit-image-inpainting:predict';

// Get dynamic Imagen endpoints
export const getImagenGenerationEndpoint = async (): Promise<string> => {
  const endpoint = await getVertexEndpoint(VERTEX_MODEL_PATHS.IMAGEN_GENERATE);
  const usingOAuth = await isUsingOAuth();

  // If using OAuth, the token will be passed in Authorization header, so no need for ?key=
  return `${endpoint}:predict${!usingOAuth ? '?key=' : ''}`;
};

export const getImagenInpaintingEndpoint = async (): Promise<string> => {
  const endpoint = await getVertexEndpoint(VERTEX_MODEL_PATHS.IMAGEN_INPAINTING);
  const usingOAuth = await isUsingOAuth();

  // If using OAuth, the token will be passed in Authorization header, so no need for ?key=
  return `${endpoint}:predict${!usingOAuth ? '?key=' : ''}`;
};

// Cache for OAuth status
let cachedOAuthStatus: boolean | null = null;
let lastOAuthCheck = 0;
const OAUTH_CACHE_DURATION = 60000; // 1 minute cache

// Add a function to check if we're using OAuth or API Key
export const isUsingOAuth = async (): Promise<boolean> => {
  // Return cached status if available and not expired
  const now = Date.now();
  if (cachedOAuthStatus !== null && (now - lastOAuthCheck < OAUTH_CACHE_DURATION)) {
    return cachedOAuthStatus;
  }

  // Check directly if we have a valid OAuth token instead of using getApiKey
  try {
    // First check if we have OAuth credentials (with timeout)
    const clientId = await withTimeout(
      AsyncStorage.getItem(OAUTH_CLIENT_ID_KEY),
      2000,
      null
    );
    if (!clientId) {
      cachedOAuthStatus = false;
      lastOAuthCheck = now;
      return false;
    }

    // Then check if we have a valid access token (with timeout)
    const token = await withTimeout(
      AsyncStorage.getItem(OAUTH_ACCESS_TOKEN_KEY),
      2000,
      null
    );
    const expiryTimeStr = await withTimeout(
      AsyncStorage.getItem(OAUTH_TOKEN_EXPIRY_KEY),
      2000,
      null
    );

    if (!token || !expiryTimeStr) {
      cachedOAuthStatus = false;
      lastOAuthCheck = now;
      return false;
    }

    const expiryTime = parseInt(expiryTimeStr);
    const isValid = now < expiryTime - 5 * 60 * 1000; // 5 min buffer

    cachedOAuthStatus = isValid;
    lastOAuthCheck = now;
    return isValid;
  } catch (error) {
    cachedOAuthStatus = false;
    lastOAuthCheck = now;
    return false;
  }
};

// Add OAuth configuration constants
export const OAUTH_GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform'
];
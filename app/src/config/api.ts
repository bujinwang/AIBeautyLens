// API Configuration
import { Platform } from 'react-native';

// API key settings
export const API_KEY_STORAGE_KEY = 'gemini_api_key';

// Environment variable or fallback key
export const FALLBACK_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCtO46zpt7unoWMCfIiVtUzfiiy3xClhbs';

// API timeout in milliseconds
export const API_TIMEOUT = 180000;

// Backend API base URL
export const getBaseUrl = (): string => {
  // Use environment variable if available
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBaseUrl) return envBaseUrl;
  
  // Otherwise use platform-specific defaults for development
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api'; // Android emulator uses 10.0.2.2 to access host machine
  } else {
    return 'http://localhost:3000/api'; // iOS and other platforms
  }
};

// Validate API key format (always valid since we're using fallback)
export const isValidApiKey = (key: string): boolean => {
  return true;
};

// Get API key (always returns fallback)
export const getApiKey = async (): Promise<string> => {
  return FALLBACK_API_KEY;
};

// Store API key (no-op since we always use fallback)
export const storeApiKey = async (apiKey: string): Promise<boolean> => {
  return true;
};

// API Endpoints
export const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models';
export const GEMINI_VISION_API = `${GEMINI_API}/gemini-2.5-pro-preview-05-06:generateContent`;
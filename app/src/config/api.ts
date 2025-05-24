// API Configuration
import { Platform } from 'react-native';

// API key settings
export const API_KEY_STORAGE_KEY = 'gemini_api_key';

// Environment variable or fallback key
export const FALLBACK_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCF5JIUoRuuqb5Cd6D31_aSjsZ7Wm_85-w';

// API timeout in milliseconds
export const API_TIMEOUT = 180000;

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
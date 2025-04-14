// API Configuration
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for API key
export const API_KEY_STORAGE_KEY = 'deepseek_api_key';

// Fallback key (only for development)
export const FALLBACK_API_KEY = 'YOUR_DEEPSEEK_API_KEY';

// Development flag - using the global __DEV__ variable in React Native
// or falling back to true if not available (for testing)
export const IS_DEVELOPMENT = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

// API timeout in milliseconds
export const API_TIMEOUT = 30000; // 30 seconds

// Validate API key format
export const isValidApiKey = (key: string): boolean => {
  // This is a simple check - adjust based on DeepSeek's actual key format
  return Boolean(key && key.length > 10 && key !== FALLBACK_API_KEY);
};

// Get API key from storage
export const getApiKey = async (): Promise<string> => {
  try {
    const storedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    
    // In development, print key info
    if (IS_DEVELOPMENT && storedKey) {
      console.log('Retrieved API key from storage:', 
        `${storedKey.substring(0, 4)}...${storedKey.substring(storedKey.length - 4)}`);
    }
    
    // Validate the key format
    if (storedKey && isValidApiKey(storedKey)) {
      return storedKey;
    } else {
      console.warn('Invalid API key format or using fallback key');
      return FALLBACK_API_KEY;
    }
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return FALLBACK_API_KEY;
  }
};

// API Endpoints
export const DEEPSEEK_CHAT_API = 'https://api.deepseek.com/v1/chat/completions';
export const DEEPSEEK_IMAGE_API = 'https://api.deepseek.com/v1/images/generations';

// API Models
export const MODELS = {
  DEEPSEEK_VISION: 'deepseek-vision',
  DEEPSEEK_IMAGE: 'deepseek-image',
};

// Simple development mock responses (for testing without API access)
export const MOCK_RESPONSES = {
  ANALYSIS: {
    estimatedAge: 32,
    skinType: "Normal to Combination",
    features: [
      { description: "Fine lines around eyes", confidence: 0.85 },
      { description: "Mild sun damage on cheeks", confidence: 0.72 },
      { description: "Early signs of nasolabial folds", confidence: 0.68 }
    ],
    recommendations: [
      { treatmentId: "botox", reason: "To reduce appearance of fine lines around eyes" },
      { treatmentId: "ha-filler", reason: "To address early signs of nasolabial folds" },
      { treatmentId: "fractional-laser", reason: "To improve skin texture and reduce sun damage" }
    ]
  },
  IMAGE_URL: 'https://placehold.co/1024x1024/png?text=Simulated+Treatment'
}; 
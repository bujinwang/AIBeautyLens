declare module '@env' {
  export const OPENAI_API_KEY: string;
}

// Add type definitions for Expo constants
declare module 'expo-constants' {
  import Constants from 'expo-constants';
  
  export interface AppConfig {
    extra: {
      openaiApiKey: string;
    };
  }
  
  export interface ExpoDynamicConfig {
    expoConfig?: AppConfig;
  }
  
  // Extend the Constants interface
  export default interface Constants extends ExpoDynamicConfig {}
} 
// Type definitions for expo-file-system
import * as FileSystem from 'expo-file-system';

declare module 'expo-file-system' {
  interface FileInfo {
    uri: string;
    exists: boolean;
    isDirectory: boolean;
    modificationTime?: number;
    size?: number;
  }
} 
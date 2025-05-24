// Type definitions for expo-camera
import { Camera } from 'expo-camera';

declare module 'expo-camera' {
  namespace Camera {
    namespace Constants {
      enum Type {
        front = 'front',
        back = 'back'
      }
    }
  }
} 
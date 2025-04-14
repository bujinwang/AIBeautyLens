import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Resizes an image to reduce its file size while maintaining quality
 */
export const resizeImage = async (uri: string, width: number = 800): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    return uri; // Return original URI if resize fails
  }
};

/**
 * Converts an image URI to base64 string
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Gets the file size of an image in MB
 */
export const getImageFileSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    // Use type assertion to work around TypeScript limitation
    const size = (fileInfo as any).size || 0;
    return size / (1024 * 1024); // Convert to MB
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
}; 
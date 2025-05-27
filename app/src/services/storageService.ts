import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { getApiKey, getBaseUrl } from '../config/api';

/**
 * Gets a signed URL from the backend for uploading an image to GCS
 * @param filename - Base filename for the image
 * @param fileExtension - File extension (jpg, png, etc.)
 * @param expirationMinutes - URL expiration time in minutes (optional, default: 15)
 * @returns The signed URL for uploading
 */
export const getSignedUrl = async (
  filename: string, 
  fileExtension: string,
  expirationMinutes?: number
): Promise<string> => {
  try {
    const response = await axios.post(
      `${getBaseUrl()}/gcs/signed-url`,
      { filename, fileExtension, expirationMinutes },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getApiKey()}`
        }
      }
    );
    
    return response.data.url;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw new Error('Failed to get signed URL for upload');
  }
};

/**
 * Logs a successful upload to the backend
 * @param objectName - The name of the uploaded object
 */
export const logUploadSuccess = async (objectName: string): Promise<void> => {
  try {
    await axios.post(
      `${getBaseUrl()}/gcs/log-upload-success`,
      { objectName },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getApiKey()}`
        }
      }
    );
  } catch (error) {
    console.error('Error logging upload success:', error);
    // Don't throw here, just log the error
  }
};

/**
 * Logs a failed upload to the backend
 * @param objectName - The name of the object that failed to upload
 * @param error - The error message
 */
export const logUploadFailure = async (objectName: string, error: string): Promise<void> => {
  try {
    await axios.post(
      `${getBaseUrl()}/gcs/log-upload-failure`,
      { objectName, error },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getApiKey()}`
        }
      }
    );
  } catch (error) {
    console.error('Error logging upload failure:', error);
    // Don't throw here, just log the error
  }
};

/**
 * Uploads an image to Google Cloud Storage using a signed URL
 * @param base64Image - Base64 encoded image string
 * @param imageName - Name to use for the image in GCS
 * @param expirationMinutes - URL expiration time in minutes (optional)
 * @returns The public URL of the uploaded image
 */
export const uploadImageToGCS = async (
  base64Image: string, 
  imageName: string,
  expirationMinutes?: number
): Promise<string> => {
  // Generate a unique filename with timestamp
  const timestamp = new Date().getTime();
  const uniqueFilename = `${imageName}_${timestamp}`;
  const fileExtension = 'jpg'; // Default to jpg, could be determined from the base64 data
  const objectName = `${uniqueFilename}.${fileExtension}`;
  
  try {
    // Get a signed URL from the backend
    const signedUrl = await getSignedUrl(uniqueFilename, fileExtension, expirationMinutes);
    
    console.log(`Uploading ${objectName} to Google Cloud Storage...`);
    
    // Remove the data URL prefix if present
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;
    
    // Convert base64 to blob for upload
    const response = await fetch(`data:image/${fileExtension};base64,${base64Data}`);
    const blob = await response.blob();
    
    // Upload directly to GCS using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': `image/${fileExtension}`
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }
    
    // Construct the public URL
    const publicUrl = `https://storage.googleapis.com/ai-beauty-lens/${objectName}`;
    console.log(`Image uploaded successfully. URL: ${publicUrl}`);
    
    // Log the successful upload
    await logUploadSuccess(objectName);
    
    return publicUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error uploading image to GCS:', errorMessage);
    
    // Log the failed upload
    await logUploadFailure(objectName, errorMessage);
    
    throw new Error('Failed to upload image to Google Cloud Storage');
  }
};

/**
 * Uploads an image from a local URI to Google Cloud Storage
 * @param uri - Local URI of the image file
 * @param imageName - Name to use for the image in GCS
 * @param expirationMinutes - URL expiration time in minutes (optional)
 * @returns The public URL of the uploaded image
 */
export const uploadImageFromUri = async (
  uri: string, 
  imageName: string,
  expirationMinutes?: number
): Promise<string> => {
  // Generate a unique filename with timestamp
  const timestamp = new Date().getTime();
  const uniqueFilename = `${imageName}_${timestamp}`;
  
  // Determine file extension from URI
  const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const objectName = `${uniqueFilename}.${fileExtension}`;
  
  try {
    // Get a signed URL from the backend
    const signedUrl = await getSignedUrl(uniqueFilename, fileExtension, expirationMinutes);
    
    console.log(`Uploading ${objectName} from URI to Google Cloud Storage...`);
    
    let uploadResponse;
    
    if (Platform.OS === 'web') {
      // For web, fetch the file and upload as blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': `image/${fileExtension}`
        }
      });
    } else {
      // For native platforms, use Expo FileSystem
      uploadResponse = await FileSystem.uploadAsync(signedUrl, uri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          'Content-Type': `image/${fileExtension}`
        }
      });
    }
    
    if ((Platform.OS === 'web' && !uploadResponse.ok) || 
        (Platform.OS !== 'web' && uploadResponse.status !== 200)) {
      throw new Error(`Upload failed with status: ${
        Platform.OS === 'web' ? uploadResponse.status : uploadResponse.status
      }`);
    }
    
    // Construct and return the public URL
    const publicUrl = `https://storage.googleapis.com/ai-beauty-lens/${objectName}`;
    console.log(`Image uploaded successfully. URL: ${publicUrl}`);
    
    // Log the successful upload
    await logUploadSuccess(objectName);
    
    return publicUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error uploading image from URI:', errorMessage);
    
    // Log the failed upload
    await logUploadFailure(objectName, errorMessage);
    
    throw new Error('Failed to upload image from URI to Google Cloud Storage');
  }
};

/**
 * In a real implementation, you would add functions for:
 * 1. Getting a signed URL from your backend
 * 2. Handling the actual upload to GCS
 * 3. Error handling and retries
 * 4. Progress tracking
 */ 
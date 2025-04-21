// Import necessary modules
// Gemini API integration for facial analysis
import { getApiKey, GEMINI_VISION_API, FALLBACK_API_KEY } from '../config/api';
import axios from 'axios';
import {
  API_TIMEOUT
} from '../config/api';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// Navigation reference for navigation outside of components
let _navigationRef: any = null;

// Set the navigation reference
export const setGlobalNavigationRef = (navigationRef: any) => {
  _navigationRef = navigationRef;
};

// Helper function to determine image type from base64 prefix
function getImageMimeType(base64Data: string) {
  if (base64Data.startsWith('iVBORw0KGgo')) {
    return 'image/png';
  } else if (base64Data.startsWith('/9j/')) {
    return 'image/jpeg';
  } else {
    // Default to jpeg if unknown
    return 'image/jpeg';
  }
}

// Custom error interface for retry mechanism
interface RetryError extends Error {
  name: 'RetryError';
}

// Function to log network errors in a standardized way
const logNetworkError = (context: string, error: any, details?: any) => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  console.error(`[Network Error] ${context}: ${errorMessage}`, details || '');
};

// Function to log API responses in a standardized way
const logAPIResponse = (context: string, status: number, statusText: string) => {
  if (status >= 400) {
    console.error(`[API Error] ${context} - Status: ${status}, Message: ${statusText}`);
  } else {
    console.log(`[API Success] ${context} - Status: ${status}`);
  }
};

// Function to log image processing in a standardized way
const logImageProcessing = (context: string, details: any) => {
  console.log(`[Image Processing] ${context}:`, details);
};

/**
 * Analyzes a facial image and returns recommendations
 * @param base64Image - Base64 encoded image string
 * @param visitPurpose - Optional purpose of the visit
 * @param appointmentLength - Optional appointment length
 * @returns Analysis results including age, skin type, and treatment recommendations
 */
export const analyzeFacialImage = async (base64Image: string, visitPurpose?: string, appointmentLength?: string) => {
  let retryCount = 0;
  // Update to ensure the value is capped at 2 (for a total of 3 attempts max)
  const MAX_RETRIES = Math.min(2, Platform.OS === 'ios' && Platform.isPad ? 2 : 1);
  const isIPad = Platform.OS === 'ios' && Platform.isPad;

  // Function to reduce base64 image size if needed - especially important for iPads
  const reduceBase64ImageSize = async (imageBase64: string): Promise<string> => {
    // Only process if on iPad and image is large
    if (isIPad && imageBase64.length > 750000) {
      logImageProcessing('Starting image reduction', {
        originalSize: Math.round(imageBase64.length/1024),
        platform: 'iPad'
      });

      try {
        // Create a temporary file to store the image
        const tempFilePath = `${FileSystem.cacheDirectory}temp_image.jpg`;
        await FileSystem.writeAsStringAsync(tempFilePath, imageBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // More aggressive compression for iPad
        let quality = 0.7; // Start with lower quality for iPad
        let maxWidth = 800; // Start with smaller width for iPad

        // Adjust quality and width based on image size
        if (imageBase64.length > 1500000) {
          quality = 0.5;
          maxWidth = 600;
        }
        if (imageBase64.length > 2500000) {
          quality = 0.3;
          maxWidth = 400;
        }

        console.log(`Original image size: ${Math.round(imageBase64.length/1024)} KB`);
        console.log(`Applying quality reduction factor: ${quality}`);
        console.log(`Resizing to max width: ${maxWidth}px`);

        // Resize and compress the image
        const manipResult = await ImageManipulator.manipulateAsync(
          tempFilePath,
          [{ resize: { width: maxWidth } }], // Resize to smaller width for iPad
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Read the compressed image
        const compressedBase64 = await FileSystem.readAsStringAsync(manipResult.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Clean up the temporary file
        await FileSystem.deleteAsync(tempFilePath);

        console.log(`Compressed image size: ${Math.round(compressedBase64.length/1024)} KB`);
        
        // If compression didn't reduce size enough, try one more time with more aggressive settings
        if (compressedBase64.length > 750000) {
          console.log('First compression not sufficient, trying more aggressive compression...');
          const secondTempPath = `${FileSystem.cacheDirectory}temp_image_2.jpg`;
          await FileSystem.writeAsStringAsync(secondTempPath, compressedBase64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const secondManipResult = await ImageManipulator.manipulateAsync(
            secondTempPath,
            [{ resize: { width: Math.max(400, maxWidth * 0.7) } }],
            { compress: Math.max(0.3, quality * 0.7), format: ImageManipulator.SaveFormat.JPEG }
          );

          const finalBase64 = await FileSystem.readAsStringAsync(secondManipResult.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          await FileSystem.deleteAsync(secondTempPath);
          console.log(`Final compressed image size: ${Math.round(finalBase64.length/1024)} KB`);
          return finalBase64;
        }

        logImageProcessing('Image reduction complete', {
          finalSize: Math.round(compressedBase64.length/1024),
          quality,
          maxWidth
        });

        return compressedBase64;
      } catch (resizeError) {
        logNetworkError('Image reduction failed', resizeError);
        // Fall back to original image if reduction fails
        return imageBase64;
      }
    }

    return imageBase64;
  };

  // Function for retry logic
  const executeWithRetry = async () => {
    try {
      // Get the API key from storage
      const apiKey = await getApiKey();

      // Log API key format (safely)
      console.log('API key format check:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'No API key');

      // Make sure the API key is valid
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        throw new Error('Invalid or missing API key. Please enter a valid Gemini API key in the settings.');
      }

      logImageProcessing('Processing request', {
        platform: Platform.OS,
        isIPad,
        retryCount: retryCount + 1,
        imageSize: base64Image?.length
      });

      console.log(`Platform: ${Platform.OS}, iPad: ${isIPad}, Retry #${retryCount + 1}`);

      // First, let's log the key details about the image we're sending
      console.log('Original Base64 image length:', base64Image ? base64Image.length : 0);

      // Validate that image data exists
      if (!base64Image || base64Image.length < 100) {
        throw new Error('Invalid or missing image data. Please provide a valid image.');
      }

      // For iPad: process large images to reduce API issues
      let processedBase64 = base64Image;
      if (isIPad) {
        try {
          processedBase64 = await reduceBase64ImageSize(base64Image);
          console.log('Processed Base64 image length:', processedBase64.length);
          
          // If image is still too large after processing, throw a specific error
          if (processedBase64.length > 1000000) {
            throw new Error('IMAGE_TOO_LARGE: The image is too large for processing on iPad even after compression. Please try with a smaller image or use a different device.');
          }
        } catch (compressionError) {
          console.error('Error during image compression:', compressionError);
          // If compression fails, try one more time with more aggressive settings
          if (retryCount === 0) {
            console.log('Retrying with more aggressive compression...');
            processedBase64 = await reduceBase64ImageSize(base64Image);
          } else {
            throw compressionError;
          }
        }
      }

      // Clean the base64 string to remove any potential line breaks or invalid characters
      processedBase64 = processedBase64.replace(/[\r\n\t]/g, '').trim();

      // Then use it when constructing the URL
      const mimeType = getImageMimeType(processedBase64);
      console.log('Detected image mime type:', mimeType);

      // Treatments catalog to provide to the AI
      const treatmentsList = `
      Available treatments for recommendation:

      LASER TREATMENTS:
      - pico-laser: Picosecond Laser (Face) - Advanced laser technology that delivers energy in ultra-short picosecond pulses to target pigmentation and improve skin texture
      - fractional-laser: Fractional Laser (Face) - Creates micro-damage zones to stimulate collagen production and skin rejuvenation
      - laser-hair-removal: Permanent Laser Hair Removal (Various) - Uses laser energy to target hair follicles for permanent hair reduction

      RADIOFREQUENCY TREATMENTS:
      - tempsure-rf: Tempsure Gold RF Lifting (Face) - Radiofrequency treatment that heats deep skin layers to stimulate collagen production and tighten skin
      - thermage: Thermage (Face/Body) - Premium radiofrequency treatment for significant skin tightening and contouring
      - flexsure: Flexsure Body Contouring (Body) - Targeted radiofrequency treatment for body contouring and fat reduction

      INJECTION TREATMENTS:
      - ha-filler: Hyaluronic Acid Filler (Face) - Injectable gel that adds volume, smooths lines, and enhances facial contours
      - botox: Botulinum Toxin (Face) - Relaxes muscles to reduce the appearance of wrinkles and fine lines
      - fat-dissolving: Fat Dissolving Injection (Face/Body) - Injectable treatment that breaks down fat cells for localized fat reduction
      - prp: PRP (Platelet-Rich Plasma) (Face/Scalp) - Uses patient's own blood plasma to stimulate cell regeneration and collagen production

      SPECIAL TREATMENTS:
      - hydrofacial: HydroFacial (Face) - Multi-step treatment that cleanses, exfoliates, and hydrates the skin
      - aqua-needle: Aqua Acupuncture (Face) - Microinjections of hyaluronic acid and nutrients for skin hydration and rejuvenation
      - head-spa: Head Spa Machine (Scalp) - Deep cleansing and stimulating treatment for the scalp to promote hair health and relieve tension
      - acupuncture: Acupuncture (Face/Body) - Traditional therapy using fine needles to stimulate specific points on the body, promoting natural healing and wellness
      `;

      // Prepare the request body for Gemini
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert aesthetic medical professional specializing in facial analysis. Provide detailed assessments of facial features based on images. Be thorough and try to find facial features even in challenging images.

Analyze this image for facial features and potential cosmetic treatments.

IMPORTANT: Make your best effort to identify facial features in the image. Even if the image is low quality, partially obscured, or taken from an unusual angle, try to detect any human facial features present.

Only return an error if you are 100% certain there is absolutely no human face or facial features in the image. In case of uncertainty, proceed with analysis and note your confidence level.

For any images with human facial features, include estimated age, gender with confidence score, skin type, visible facial features that could benefit from treatments, and specific recommendations ONLY from our treatment catalog below.

${treatmentsList}

${visitPurpose ? `PURPOSE OF VISIT: ${visitPurpose}` : ''}
${appointmentLength ? `APPOINTMENT LENGTH: ${appointmentLength}` : ''}

IMPORTANT TREATMENT RULES:
1. Products containing acids should not be used 7-10 days before or after undergoing laser or light-based treatments.
2. Products containing hydroquinone are very effective for treating hyperpigmentation, especially melasma, but they must be used under medical supervision and cannot be used continuously.

Format your response as a JSON object with these exact fields:
1. estimatedAge (number)
2. gender (string - "male", "female", or "unknown")
3. genderConfidence (number - from 0.0 to 1.0, with 1.0 being 100% confident)
4. skinType (string)
5. features (array of objects with description and severity)
6. recommendations (array of objects with treatmentId and reason)

The treatmentId must be one of the IDs from the catalog (e.g., "botox", "fractional-laser").
The severity should be a number from 1 to 5, where 1 is mild and 5 is severe.
${appointmentLength ? `Consider the appointment length of ${appointmentLength} when making recommendations. Only recommend treatments that can be reasonably performed within this timeframe.` : ''}`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: processedBase64
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.6,
          max_output_tokens: 4096,
          response_mime_type: "application/json"
        }
      };

      // Make the API call with API key as query parameter
      const apiUrl = `${GEMINI_VISION_API}?key=${apiKey}`;

      // For iPad specifically, we'll use fetch with AbortController for better timeout management
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT + (isIPad ? 5000 : 0)); // Extra time for iPad
      // Create a sanitized version of the request body for logging (without image data)
      const sanitizedRequestBody = {
        contents: [
          {
            role: requestBody.contents[0].role,
            parts: [
              { text: "[PROMPT_TEXT]" }, // Don't include the actual prompt text for brevity
              { inline_data: { mime_type: mimeType, data: '[BASE64_IMAGE_DATA_REDACTED]' } }
            ]
          }
        ],
        generation_config: { ...requestBody.generation_config }
      };

      // Log comprehensive request information without exposing the API key
      // Create a sanitized URL that doesn't include the API key
      const sanitizedUrl = GEMINI_VISION_API + '?key=[API_KEY_REDACTED]';

      console.log('Making API request to Gemini...', {
        url: sanitizedUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        requestBodyStructure: sanitizedRequestBody,
        platformInfo: {
          platform: Platform.OS,
          isIPad: isIPad,
          retryAttempt: retryCount + 1,
          maxRetries: MAX_RETRIES + 1
        }
      });

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        // Clear the timeout since the request completed
        clearTimeout(timeoutId);

        // Check HTTP response status
        console.log('Gemini API response status:', response.status);
        console.log('Gemini API response status text:', response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);

          // Special iPad-specific handling for 429 errors
          if (response.status === 429) {
            if (isIPad && retryCount < MAX_RETRIES) {
              // If on iPad and we have retries left, throw a retry error
              const retryError = new Error('RETRY_NEEDED') as RetryError;
              retryError.name = 'RetryError';
              throw retryError;
            } else {
              // Final quota error with user-friendly message
              throw new Error('API_QUOTA_EXCEEDED: Our facial analysis service is temporarily unavailable. Please try again later or contact our clinic for assistance.');
            }
          }

          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        // Parse the response directly as JSON
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || 'Error analyzing image');
        }

        // Check if the response has the expected structure from Gemini
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          console.error('Unexpected API response structure:', JSON.stringify(data, null, 2));
          throw new Error('Invalid response structure from Gemini API');
        }

        // Get the text content from the Gemini response
        const content = data.candidates[0].content.parts[0].text;
        const finishReason = data.candidates[0].finishReason;

        // Check if response was truncated
        if (finishReason === "MAX_TOKENS") {
          console.warn('Response was truncated due to token limit. Attempting to fix incomplete JSON...');
        }

        if (typeof content === 'string') {
          try {
            // Try to fix incomplete JSON before parsing
            let jsonToParseStr = content;

            // If we have a truncated response, attempt to fix it by adding missing brackets
            if (finishReason === "MAX_TOKENS") {
              // Count opening vs closing braces to detect incomplete structure
              const countChar = (str: string, char: string) => (str.match(new RegExp(char, 'g')) || []).length;

              const openBraces = countChar(jsonToParseStr, '{');
              const closeBraces = countChar(jsonToParseStr, '}');
              const openBrackets = countChar(jsonToParseStr, '\\[');
              const closeBrackets = countChar(jsonToParseStr, '\\]');

              // Add missing closing braces/brackets
              if (openBraces > closeBraces) {
                jsonToParseStr += '}'.repeat(openBraces - closeBraces);
              }

              if (openBrackets > closeBrackets) {
                jsonToParseStr += ']'.repeat(openBrackets - closeBrackets);
              }
            }

            // Parse the content string into a JSON object
            const parsedContent = JSON.parse(jsonToParseStr);

            // Check if the parsed content contains an error message about not being a face
            if (parsedContent.error === true) {
              throw new Error(parsedContent.message || 'The uploaded image does not contain a human face');
            }

            return parsedContent;
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Content that failed to parse:', content.substring(0, 200));

            if (isIPad && retryCount < MAX_RETRIES) {
              // If on iPad and we have retries left, throw a retry error
              const retryError = new Error('RETRY_NEEDED') as RetryError;
              retryError.name = 'RetryError';
              throw retryError;
            } else {
              throw new Error('Failed to parse API response content as JSON');
            }
          }
        } else if (typeof content === 'object' && content !== null) {
          // If content is already an object (rare case), check for error
          if (content.error === true) {
            throw new Error(content.message || 'The uploaded image does not contain a human face');
          }
          return content;
        }

        throw new Error('Unexpected response format from Gemini API');
      } catch (fetchError: any) {
        // Clear the timeout to prevent any lingering issues
        clearTimeout(timeoutId);

        // Handle AbortController timeout
        if (fetchError.name === 'AbortError') {
          console.error('Request timed out');
          throw new Error('The request to the Gemini API timed out. Please try again later.');
        }

        // If it's a retry error on iPad, propagate it
        if (fetchError.name === 'RetryError') {
          throw fetchError;
        }

        // Otherwise, propagate other errors
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Error in executeWithRetry:', error);
      
      // Special handling for iPad-specific errors
      if (isIPad) {
        // If we haven't retried yet and it's a network error
        if (retryCount < MAX_RETRIES && 
            (error.message.includes('Network request failed') || 
             error.message.includes('Network Error') ||
             error.message.includes('timeout'))) {
          console.log(`Retrying iPad request (attempt ${retryCount + 1} of ${MAX_RETRIES})`);
          
          // Add exponential backoff delay between retries
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          retryCount++;
          return executeWithRetry();
        }
        
        // For iPad-specific errors, provide more detailed guidance
        if (error.message.includes('IMAGE_TOO_LARGE')) {
          throw new Error('The image is too large for processing on iPad. Please try:\n1. Taking a new photo with better lighting\n2. Using a different device\n3. Reducing the image size before uploading');
        }
      }
      
      throw error;
    }
  };

  // Main try/catch block with retries for iPad
  try {
    return await executeWithRetry();
  } catch (error: any) {
    logNetworkError('Final error in facial analysis', error);
    
    // Special iPad-specific error message with more helpful guidance
    if (isIPad) {
      if (error.message.includes('Network request failed') || 
          error.message.includes('Network Error') ||
          error.message.includes('timeout')) {
        throw new Error('Network connection issue detected. Please check your internet connection or try again later.');
      } else {
        throw new Error('We encountered an issue processing your request. Please try taking a new photo with better lighting or reducing the image size.');
      }
    }
    
    throw error;
  }
};

/**
 * Validates the current API key settings.
 * @returns An object indicating success or failure of validation
 */
export const checkRuntimeSettings = async (): Promise<{success: boolean; message?: string}> => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();

    // Check if there's a valid API key
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      return {
        success: false,
        message: 'Invalid or missing API key. Please enter a valid Gemini API key.'
      };
    }

    // Check the API key format - Gemini API keys typically start with "AI"
    if (!apiKey.startsWith('AI')) {
      return {
        success: false,
        message: 'API key format appears invalid. Gemini API keys typically start with "AI".'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error validating runtime settings:', error);
    return {
      success: false,
      message: 'An error occurred while validating settings.'
    };
  }
};

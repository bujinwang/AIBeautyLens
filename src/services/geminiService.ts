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
import { SkincareRecommendation } from '../types';
import { TREATMENTS } from '../constants/treatments';
import { SkincareProduct, SKINCARE_PRODUCTS, PRODUCTS_BY_SKIN_TYPE, getProductsForConcerns } from '../constants/skincareProducts';

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

// Interface for Gemini API request with user's skin info
interface GeminiProductRequestData {
  skinType: string;
  concerns: string[];
  existingRecommendations: SkincareRecommendation[];
}

// Response from Gemini API with product recommendations
interface GeminiProductResponseData {
  products: SkincareProduct[];
}

// Mock API key - in a real app, this would be stored in environment variables
// and accessed securely
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

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

      // Dynamically generate treatments catalog from TREATMENTS array
      const generateTreatmentsList = () => {
        let treatmentsCatalog = `
        Available treatments for recommendation:
        
        `;
        
        // Group treatments by category
        const categorizedTreatments: Record<string, typeof TREATMENTS> = {};
        TREATMENTS.forEach(treatment => {
          if (!categorizedTreatments[treatment.category]) {
            categorizedTreatments[treatment.category] = [];
          }
          categorizedTreatments[treatment.category].push(treatment);
        });
        
        // Build the treatments list by category
        Object.entries(categorizedTreatments).forEach(([category, treatments]) => {
          treatmentsCatalog += `${category.toUpperCase()} TREATMENTS:\n`;
          
          treatments.forEach(treatment => {
            treatmentsCatalog += `- ${treatment.id}: ${treatment.name} (${treatment.area}) - ${treatment.description}\n`;
            
            if (treatment.contraindications && treatment.contraindications.length > 0) {
              treatmentsCatalog += `  CONTRAINDICATIONS: ${treatment.contraindications.join(', ')}\n`;
            }
            
            if (treatment.restrictions) {
              treatmentsCatalog += `  RESTRICTIONS: ${treatment.restrictions}\n`;
            }
            
            treatmentsCatalog += `\n`;
          });
        });
        
        // Add treatment selection guidelines
        treatmentsCatalog += `
        IMPORTANT TREATMENT SELECTION GUIDELINES:
        1. Always check contraindications before recommending any treatment
        2. For clients with active acne or inflammation, avoid laser and radiofrequency treatments
        3. Consider HydraFacial as a safer alternative for acne-prone skin
        4. For severe acne cases, recommend medical consultation before any aesthetic treatments
        5. Consider skin type and sensitivity when recommending treatments
        6. Always prioritize skin barrier repair before aggressive treatments
        7. Factor in recent procedures or medications that might affect treatment safety
        8. Consider alternative treatments when contraindications are present
        9. Always ensure the treatment addresses the client's specific concerns
        10. Consider the client's skin tone for treatments with pigmentation risks
        `;
        
        return treatmentsCatalog;
      };

      // Generate the treatments list from the full TREATMENTS array
      const treatmentsList = generateTreatmentsList();

      // Prepare the request body for Gemini
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert aesthetic medical professional and licensed dermatologist specializing in facial analysis and skincare recommendations. Provide comprehensive clinical assessments of facial features, skin conditions, and personalized treatment recommendations. Your analysis should be thorough and detailed, similar to a professional dermatological consultation.

Analyze this image for facial features, skin conditions, and provide a detailed clinical assessment.

ANALYSIS REQUIREMENTS:

1. Basic Profile:
   - Estimated age based on visual indicators
   - Gender with confidence score
   - Overall skin type (oily, dry, combination, sensitive) based on visual cues
   - Skin undertone assessment (warm, cool, neutral)

2. Overall Skin Health:
   Provide a concise summary of:
   - Primary skin concerns
   - Current skin condition
   - Any signs of inflammation or barrier issues
   - General skin health status

3. Clinical Assessment:
   For EACH identified skin condition, analyze:
   a) Condition Details:
      - Precise clinical description
      - Exact locations on face (e.g., T-zone, perioral area, etc.)
      - Severity rating (1-5) with clinical justification
      - Current status (active, healing, or chronic)
      
   b) Clinical Analysis:
      - Probable causes (list all relevant factors)
      - Observable characteristics
      - Associated symptoms
      - Impact on overall skin health
      
   c) Treatment Priority:
      - Priority level (immediate attention, high, moderate, low, maintenance)
      - Clinical reasoning for priority assignment
      - Risk factors if left untreated

4. Key Conditions to Assess:
   Evaluate presence and severity of:
   - Acne (comedonal, inflammatory, cystic)
   - Post-inflammatory hyperpigmentation
   - Texture irregularities
   - Dehydration markers
   - Barrier compromise signs
   - Sebum production patterns
   - Inflammatory responses
   - Sun damage indicators
   - Melasma/hyperpigmentation
   - Skin sensitivity markers

Format your response as a JSON object with these exact fields:
{
  "estimatedAge": number,
  "gender": "male" | "female" | "unknown",
  "genderConfidence": number (0.0 to 1.0),
  "skinType": string,
  "skinUndertone": string,
  "overallCondition": string (detailed assessment),
  "features": [
    {
      "description": string (clinical name),
      "severity": number (1-5),
      "location": string (specific facial areas),
      "causes": string[] (evidence-based factors),
      "status": "active" | "healing" | "chronic",
      "characteristics": string[] (observable traits),
      "priority": number (1-5, where 1 is highest)
    }
  ],
  "recommendations": [
    {
      "treatmentId": string (from catalog),
      "reason": string (clinical justification),
      "priority": number (1-5),
      "expectedOutcome": string,
      "recommendedInterval": string
    }
  ],
  "skincareRecommendations": [
    {
      "productType": string,
      "recommendedIngredients": string,
      "recommendedUsage": string,
      "reason": string,
      "targetConcerns": string[],
      "precautions": string
    }
  ]
}

IMPORTANT: Keep your response concise but complete. Focus on the most relevant conditions and recommendations. If the response is too long, it may be truncated.

${treatmentsList}

${visitPurpose ? `PURPOSE OF VISIT: ${visitPurpose}` : ''}
${appointmentLength ? `APPOINTMENT LENGTH: ${appointmentLength}` : ''}

IMPORTANT CLINICAL GUIDELINES:
1. Base all assessments solely on visible evidence in the image
2. Provide specific locations and descriptions for each condition
3. Consider multiple factors for each condition's probable causes
4. Assess severity based on clinical presentation
5. Prioritize treatment based on condition severity and impact
6. Note any conditions requiring immediate medical attention
7. Consider potential condition interactions
8. Document any signs of skin barrier compromise
9. Assess both active and chronic conditions
10. Consider patient age in all recommendations`
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
          max_output_tokens: 8192,
          response_mime_type: "application/json",
          top_p: 0.8,
          top_k: 40
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

        // Remove raw response logs
        console.log('Finish Reason:', finishReason);
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

            // Return the analysis result directly since it now includes skincare recommendations
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

/**
 * Calls Gemini API to get personalized product recommendations based on skincare advice
 */
export const getGeminiProductRecommendations = async (
  requestData: GeminiProductRequestData
): Promise<SkincareProduct[]> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('Missing Gemini API key');
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As a skincare expert, recommend specific skincare products for a user with ${requestData.skinType} skin 
            and the following concerns: ${requestData.concerns.join(', ')}. 
            
            For each of these product types:
            ${requestData.existingRecommendations.map(rec => `
              - ${rec.productType}
                Recommended ingredients: ${rec.recommendedIngredients}
                Usage: ${rec.recommendedUsage}
                Target concerns: ${rec.targetConcerns.join(', ')}
            `).join('\n')}
            
            For each product type, recommend ONE specific product with:
            - Real brand name
            - Specific product name
            - Actual retail price (USD)
            - Key ingredients that match the recommended ingredients
            - Brief description of benefits
            - Usage instructions
            
            Format your response as a JSON array of products with these exact fields:
            {
              "id": string (unique identifier),
              "name": string (specific product name),
              "brand": string (brand name),
              "category": string (matching the product type exactly),
              "price": number (retail price in USD),
              "skinType": string[] (array of compatible skin types),
              "description": string (benefits and features),
              "ingredients": string (key ingredients),
              "usage": string (how to use)
            }`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse Gemini's response to extract the JSON product data
    const productText = data.candidates[0].content.parts[0].text;
    const productData = JSON.parse(productText.substring(
      productText.indexOf('['),
      productText.lastIndexOf(']') + 1
    ));

    return productData;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback to getSingleProductRecommendations if Gemini API fails
    return getSingleProductRecommendations(requestData);
  }
};

/**
 * Recommends one product per skincare advice category from our curated database
 * This provides more realistic recommendations than the mock Gemini function
 */
export const getSingleProductRecommendations = async (
  requestData: GeminiProductRequestData
): Promise<SkincareProduct[]> => {
  const { skinType, concerns, existingRecommendations } = requestData;
  
  try {
    // Get all products matching this skin type
    const skinTypeProducts = skinType !== 'all' 
      ? PRODUCTS_BY_SKIN_TYPE[skinType.toLowerCase()] || [] 
      : SKINCARE_PRODUCTS;
    
    const recommendedProducts: SkincareProduct[] = [];
    
    // Process each recommendation type
    for (const recommendation of existingRecommendations) {
      // Get the product type (category)
      const productType = recommendation.productType;
      
      // Find products in this category for this skin type
      let matchingProducts = skinTypeProducts.filter(product => {
        // Check if the product category matches (exact or contains)
        const categoryMatch = 
          product.category.toLowerCase() === productType.toLowerCase() ||
          product.category.toLowerCase().includes(productType.toLowerCase()) ||
          productType.toLowerCase().includes(product.category.toLowerCase());
        
        return categoryMatch;
      });
      
      // If no exact matches, try to find products with matching ingredients
      if (matchingProducts.length === 0 && recommendation.recommendedIngredients) {
        const ingredientKeywords = recommendation.recommendedIngredients
          .toLowerCase()
          .split(',')
          .map(i => i.trim());
        
        matchingProducts = skinTypeProducts.filter(product => 
          product.ingredients && 
          ingredientKeywords.some(keyword => 
            product.ingredients?.toLowerCase().includes(keyword)
          )
        );
      }
      
      // Prioritize products that match concerns
      if (concerns.length > 0 && matchingProducts.length > 1) {
        // Check if any products address the concerns
        const concernProducts = matchingProducts.filter(product => 
          product.description && 
          concerns.some(concern => 
            product.description?.toLowerCase().includes(concern.toLowerCase())
          )
        );
        
        if (concernProducts.length > 0) {
          matchingProducts = concernProducts;
        }
      }
      
      // Select one product from matches (or placeholder if no matches)
      if (matchingProducts.length > 0) {
        // Find the best match (prioritize products with full info)
        const bestMatches = matchingProducts.filter(p => p.usage && p.ingredients);
        const selectedProduct = bestMatches.length > 0 
          ? bestMatches[Math.floor(Math.random() * bestMatches.length)]
          : matchingProducts[Math.floor(Math.random() * matchingProducts.length)];
        
        // Add to recommendations
        recommendedProducts.push(selectedProduct);
      } else {
        // Create a placeholder product using our recommendation data
        const placeholderProduct: SkincareProduct = {
          id: `placeholder-${productType.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${skinType} ${productType}`,
          brand: 'Recommended Brand',
          category: productType,
          price: productType.includes('Serum') || productType.includes('Treatment') ? 85.00 : 45.00,
          skinType: [skinType.toLowerCase()],
          description: `Specially formulated ${productType.toLowerCase()} for ${skinType} skin`,
          ingredients: recommendation.recommendedIngredients || 'Recommended ingredients for your skin type',
          usage: recommendation.recommendedUsage || 'As directed'
        };
        
        recommendedProducts.push(placeholderProduct);
      }
    }
    
    // Add a short delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return recommendedProducts;
  } catch (error) {
    console.error("Error generating product recommendations:", error);
    return [];
  }
};

/**
 * Generates mock products based on user's skin type and concerns
 * This is used as a placeholder until the actual Gemini API integration
 */
const generateMockProducts = (requestData: GeminiProductRequestData): SkincareProduct[] => {
  const { skinType, concerns } = requestData;
  const products: SkincareProduct[] = [];
  
  // Generate products for each recommendation type
  requestData.existingRecommendations.forEach(recommendation => {
    // Extract the product type and create a matching product
    const productType = recommendation.productType;
    
    // Create 1-2 products per recommendation
    const numProducts = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numProducts; i++) {
      const productId = `gemini-${productType.toLowerCase().replace(/\s+/g, '-')}-${i+1}`;
      
      // Generate brand based on product type
      let brand = 'CeraVe';
      if (productType.includes('Acne') || productType.includes('Treatment')) {
        brand = 'La Roche-Posay';
      } else if (productType.includes('Moisturizer')) {
        brand = 'Neutrogena';
      } else if (productType.includes('Serum')) {
        brand = 'The Ordinary';
      } else if (i % 2 === 0) {
        brand = 'Paula\'s Choice';
      }
      
      // Generate price range based on product type
      let priceBase = 20;
      if (productType.includes('Serum') || productType.includes('Treatment')) {
        priceBase = 30;
      } else if (productType.includes('Moisturizer')) {
        priceBase = 25;
      } else if (productType.includes('Cleanser')) {
        priceBase = 15;
      }
      
      // Add some variation to the price
      const price = priceBase + (Math.random() * 15).toFixed(2);
      
      // Use recommendation ingredients if available
      const ingredients = recommendation.recommendedIngredients || 
                         'Ingredients recommended for your skin type';
      
      // Create a product name
      const productName = `${brand} ${skinType} ${productType}${i > 0 ? ' Plus' : ''}`;
      
      // Create a description that mentions skin type and concerns
      let description = `Specially formulated for ${skinType} skin`;
      if (concerns.length > 0) {
        const targetConcern = concerns[Math.min(i, concerns.length - 1)];
        description += ` targeting ${targetConcern}`;
      }
      
      // Add the product
      products.push({
        id: productId,
        name: productName,
        brand,
        category: productType,
        price: parseFloat(price),
        skinType: [skinType.toLowerCase(), 'all'],
        description,
        ingredients
      });
    }
  });
  
  return products;
};

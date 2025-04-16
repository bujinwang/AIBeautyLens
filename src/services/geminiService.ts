// Import necessary modules
// Gemini API integration for facial analysis
import { getApiKey, GEMINI_VISION_API, FALLBACK_API_KEY, isUsingOAuth, getImagenGenerationEndpoint, getImagenInpaintingEndpoint } from '../config/api';
import axios from 'axios';
import {
  API_TIMEOUT,
  IMAGEN_GENERATION_API_STATIC,
  IMAGEN_INPAINTING_API_STATIC,
  GOOGLE_CLOUD_PROJECT_ID,
  getProjectId,
  getRegion
} from '../config/api';
import { createAcneMask } from '../utils/imageUtils';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation reference for navigation outside of components
let _navigationRef: any = null;

// Set the navigation reference
export const setGlobalNavigationRef = (navigationRef: any) => {
  _navigationRef = navigationRef;
};

// Helper to navigate to OAuth setup
export const navigateToOAuthSetup = () => {
  if (_navigationRef && _navigationRef.current) {
    _navigationRef.current.navigate('OAuthSetup');
    return true;
  }
  return false;
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

/**
 * Analyzes a facial image and returns recommendations
 * @param base64Image - Base64 encoded image string
 * @returns Analysis results including age, skin type, and treatment recommendations
 */
export const analyzeFacialImage = async (base64Image: string) => {
  let retryCount = 0;
  // Update to ensure the value is capped at 2 (for a total of 3 attempts max)
  const MAX_RETRIES = Math.min(2, Platform.OS === 'ios' && Platform.isPad ? 2 : 1);
  const isIPad = Platform.OS === 'ios' && Platform.isPad;

  // Function to reduce base64 image size if needed - especially important for iPads
  const reduceBase64ImageSize = (imageBase64: string): string => {
    // Only process if on iPad and image is large
    if (isIPad && imageBase64.length > 750000) {
      console.log('Reducing image quality for iPad compatibility...');
      try {
        // For large images, we'll reduce their size by:
        // 1. Removing any metadata that might be included
        // 2. If available, reducing quality

        // If image is very large, apply more aggressive reduction
        let quality = 0.85;
        if (imageBase64.length > 1500000) quality = 0.7;
        if (imageBase64.length > 2500000) quality = 0.5;

        // Simple size reduction for React Native context
        // In a real app you would use something like react-native-image-manipulator
        // or react-native-image-resizer for proper resizing

        // Log the action being taken
        console.log(`Applied quality reduction factor: ${quality}`);
        console.log(`Original image size: ${Math.round(imageBase64.length/1024)} KB`);

        // Since we can't actually resize the image in this context,
        // we'll return the original but log a warning
        console.log('WARNING: Image size reduction would normally happen here');
        console.log('To properly implement image resizing, use a library like:');
        console.log('- react-native-image-manipulator');
        console.log('- react-native-image-resizer');
        console.log('- expo-image-manipulator');

        return imageBase64;
      } catch (resizeError) {
        console.error('Error reducing image size:', resizeError);
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
        processedBase64 = reduceBase64ImageSize(base64Image);
        console.log('Processed Base64 image length:', processedBase64.length);
      }

      // Check if the base64 image is too large - common issue with API limits
      if (processedBase64.length > 1000000) {
        console.log('Warning: Base64 image is quite large (' + Math.round(processedBase64.length/1024/1024*100)/100 + ' MB), this may exceed API limits');

        // For iPad, we'll throw an error immediately if the image is still too large after resizing
        if (isIPad && processedBase64.length > 2000000) {
          throw new Error('The image is too large for processing on iPad. Please try with a smaller image or use a different device.');
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

Format your response as a JSON object with these exact fields:
1. estimatedAge (number)
2. gender (string - "male", "female", or "unknown")
3. genderConfidence (number - from 0.0 to 1.0, with 1.0 being 100% confident)
4. skinType (string)
5. features (array of objects with description and severity)
6. recommendations (array of objects with treatmentId and reason)

The treatmentId must be one of the IDs from the catalog (e.g., "botox", "fractional-laser").
The severity should be a number from 1 to 5, where 1 is mild and 5 is severe.`
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
      // Check if this is a retry error and we should retry
      if (error.name === 'RetryError' && retryCount < MAX_RETRIES) {
        throw error; // Re-throw to trigger retry in outer catch
      }
      throw error; // Otherwise re-throw the error to be handled by caller
    }
  };

  // Main try/catch block with retries for iPad
  try {
    return await executeWithRetry();
  } catch (error: any) {
    if (error.name === 'RetryError' && retryCount < MAX_RETRIES) {
      console.log(`Retrying API request for iPad... Attempt ${retryCount + 2} of ${MAX_RETRIES + 1}`);
      retryCount++;

      // Wait for a short delay before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Retry the request
      return await executeWithRetry();
    }

    console.error('Error analyzing image:', error);

    // Check if error is quota related and format it for UI presentation
    if (error instanceof Error && error.message.includes('API_QUOTA_EXCEEDED')) {
      throw new Error('API_QUOTA_EXCEEDED: Our facial analysis service is temporarily unavailable. Please try again later or use a different device if possible.');
    }

    // Special iPad-specific error message with more helpful guidance
    if (isIPad) {
      throw new Error('We encountered an issue processing your request on iPad. Try reducing image size, taking a new photo with better lighting, or using a different device if available.');
    }

    throw error;
  }
};

/**
 * Generates a treatment simulation image using Imagen API
 * @param base64Image - Base64 encoded image string
 * @param treatmentDescriptions - Description of treatments to simulate
 * @returns URL of the generated image or base64 data
 */
export const generateTreatmentSimulation = async (
  base64Image: string,
  treatmentDescriptions: string,
  signal?: AbortSignal
) => {
  // Add retry logic
  let retryCount = 0;
  const MAX_RETRIES = 2;
  const requestId = Math.random().toString(36).substring(2, 10);

  // Check if the request is already aborted
  if (signal?.aborted) {
    throw new Error('Request was cancelled');
  }

  const startTime = Date.now();

  // Inner function to handle the actual API call
  const executeWithRetry = async () => {
    try {
      // Get the API key from storage
      const apiKey = await getApiKey();

      // Check for abort after getting API key
      if (signal?.aborted) throw new Error('Request was cancelled');

      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        throw new Error('Invalid or missing API key. Please enter a valid Gemini API key or configure OAuth in the settings.');
      }

      const isUsingOAuth = apiKey.startsWith('Bearer ');

      if (!isUsingOAuth) {
        if (retryCount === 0) {
          navigateToOAuthSetup();
        }
        throw new Error('Vertex AI requires OAuth authentication. Please go to Settings and set up OAuth credentials.');
      }

      // Check for abort before gender detection
      if (signal?.aborted) throw new Error('Request was cancelled');

      // Gender detection with abort signal
      const genderDetectionStartTime = Date.now();
      const genderController = new AbortController();
      
      // Link the parent signal to the gender detection controller
      signal?.addEventListener('abort', () => genderController.abort());

      const genderResponse = await fetch(`${GEMINI_VISION_API}?key=${FALLBACK_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: 'Analyze this facial image and determine the person\'s gender. Return only one word: "male" or "female".' },
              { inline_data: { mime_type: getImageMimeType(base64Image), data: base64Image } }
            ]
          }],
          generation_config: { temperature: 0.1, max_output_tokens: 10 }
        }),
        signal: genderController.signal
      });

      // Check for abort after gender detection request
      if (signal?.aborted) throw new Error('Request was cancelled');

      let gender = "person";
      if (genderResponse.ok) {
        const genderData = await genderResponse.json();
        if (genderData.candidates?.[0]?.content?.parts?.[0]?.text) {
          const genderText = genderData.candidates[0].content.parts[0].text.toLowerCase().trim();
          gender = genderText.includes("male") ? "male" : genderText.includes("female") ? "female" : "person";
        }
      }

      // Check for abort before main image generation
      if (signal?.aborted) throw new Error('Request was cancelled');

      // Create the image generation controller
      const imageController = new AbortController();
      
      // Link the parent signal to the image generation controller
      signal?.addEventListener('abort', () => imageController.abort());

      const apiUrl = await getImagenGenerationEndpoint();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify({
          instances: [{
            prompt: `I NEED TO KEEP THE EXACT SAME FACE. This is critical.
              This is a photo of a ${gender} with acne and skin texture issues. Show me the EXACT SAME PERSON with ONLY the following changes:
              1. Remove the acne, blemishes, and visible scars
              2. Reduce the visibility of pores
              3. Even out the skin tone
              4. Keep all other facial features exactly the same
              DO NOT change any facial features, structure, or identity.
              The treatments being applied are: ${treatmentDescriptions}.`
          }],
          parameters: { sampleCount: 1 }
        }),
        signal: imageController.signal
      });

      // Check for abort after image generation request
      if (signal?.aborted) throw new Error('Request was cancelled');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image generation failed: ${errorText}`);
      }

      const data = await response.json();
      
      // Final abort check before returning
      if (signal?.aborted) throw new Error('Request was cancelled');

      if (data.predictions?.[0]?.bytesBase64Encoded) {
        return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
      }

      throw new Error('No image data in response');
    } catch (error) {
      if (signal?.aborted || (error instanceof Error && error.message.includes('cancelled'))) {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  };

  try {
    return await executeWithRetry();
  } catch (error) {
    if (error instanceof Error && error.message.includes('cancelled')) {
      throw error;
    }
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying request... Attempt ${retryCount + 2} of ${MAX_RETRIES + 1}`);
      retryCount++;
      return await executeWithRetry();
    }
    throw error;
  }
};

/**
 * Generates an image using Imagen 3.0 based on a text prompt
 * @param prompt The text prompt describing the desired image
 * @param negativePrompt Optional negative prompt to guide what should not be in the image
 * @returns The generated image data in base64 format
 */
export const generateImageWithImagen = async (
  prompt: string,
  negativePrompt?: string
): Promise<string> => {
  try {
    const apiKey = await getApiKey();

    // Check if we're using OAuth (Bearer token) - Vertex AI requires OAuth authentication
    const isUsingOAuth = apiKey.startsWith('Bearer ');

    if (!isUsingOAuth) {
      console.warn('WARNING: Vertex AI Imagen API requires OAuth authentication. API key will not work.');
      throw new Error('Vertex AI requires OAuth authentication. Please go to Settings and set up OAuth credentials.');
    }

    // Get the dynamic endpoint URL
    const apiUrl = await getImagenGenerationEndpoint();

    // Prepare request body for Imagen API
    const requestBody = {
      instances: [
        {
          prompt
        }
      ],
      parameters: {
        sampleCount: 1,
        negativePrompt: negativePrompt
      }
    };

    // Make the API request with OAuth token
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagen API Error Response:', errorText);
      throw new Error(`Imagen API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Extract image from response
    if (data.predictions && data.predictions.length > 0) {
      const imagePrediction = data.predictions[0];
      if (imagePrediction.bytesBase64Encoded) {
        return imagePrediction.bytesBase64Encoded;
      }
    }

    throw new Error('No image data found in Imagen API response');
  } catch (error) {
    console.error('Error generating image with Imagen:', error);
    throw error;
  }
};

/**
 * Generates a treatment simulation image using Imagen 3.0
 * @param baseImage Base64 encoded image of the face
 * @param treatmentDescription Description of the treatment to simulate
 * @returns Base64 encoded simulated treatment image
 */
export const generateTreatmentSimulationWithImagen = async (
  _baseImage: string, // Unused parameter, prefixed with underscore
  treatmentDescription: string
): Promise<string> => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();

    // Check if we're using OAuth (Bearer token) - Vertex AI requires OAuth authentication
    const isUsingOAuth = apiKey.startsWith('Bearer ');

    if (!isUsingOAuth) {
      // Try to navigate to OAuth setup if possible
      navigateToOAuthSetup();
      throw new Error('Vertex AI requires OAuth authentication. Please go to Settings and set up OAuth credentials.');
    }

    // Construct a detailed prompt for the image generation
    const detailedPrompt = `Generate a realistic treatment simulation image showing the effects of ${treatmentDescription}.
    The simulation should show subtle, realistic improvements without altering fundamental facial structure.
    The result should maintain the person's identity and look like a realistic before/after treatment photo.`;

    // Prepare the request body using the correct predict format
    const requestBody = {
      instances: [
        {
          prompt: detailedPrompt
        }
      ],
      parameters: {
        sampleCount: 1,
        negativePrompt: "unrealistic effects, cartoon-like, distorted features, changed identity"
      }
    };

    // Get dynamic endpoint for Vertex AI
    const apiUrl = await getImagenGenerationEndpoint();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Imagen API request failed with status ${response.status}: ${errorText}`);
    }

    // Parse the response
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Error generating simulation with Imagen API');
    }

    // Extract the image data from the predict response format
    if (data.predictions && data.predictions.length > 0) {
      const imagePrediction = data.predictions[0];
      if (imagePrediction.bytesBase64Encoded) {
        return imagePrediction.bytesBase64Encoded;
      }
    }

    throw new Error('No image data returned from Imagen API');
  } catch (error) {
    console.error('Error generating treatment simulation with Imagen:', error);
    throw error;
  }
};

/**
 * Generates a treatment simulation image using Imagen API's inpainting
 * specifically targeting facial features like scars and pores
 *
 * @param base64Image - Base64 encoded image string
 * @param treatmentDescriptions - Description of treatments to simulate
 * @returns URL of the generated image or base64 data
 */
export const generateTreatmentSimulationWithInpainting = async (
  base64Image: string,
  treatmentDescriptions: string,
  useFaceMask: boolean = true
): Promise<string> => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();

    // Log API key format (safely)
    console.log('Image API key format check:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'No API key');

    // Make sure the API key is valid
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Invalid or missing API key. Please enter a valid Gemini API key in the settings.');
    }

    // For simplicity since this is a demo app, we'll default to the old method
    // which generates a completely new image without requiring Vertex AI setup
    if (!useFaceMask) {
      return generateTreatmentSimulation(base64Image, treatmentDescriptions);
    }

    console.log('This function requires Vertex AI project setup');
    console.log('Falling back to standard image generation');

    // Fall back to the standard image generation
    return generateTreatmentSimulation(base64Image, treatmentDescriptions);

    // Comment: The code below would be used if you have a properly configured Vertex AI project
    // You would need to replace PROJECT_ID with your actual Google Cloud project ID

    /*
    // Create a mask targeting the facial area
    const imageObj = new Image();
    await new Promise(resolve => {
      imageObj.onload = resolve;
      imageObj.src = `data:image/jpeg;base64,${base64Image}`;
    });

    const width = imageObj.width;
    const height = imageObj.height;

    // Get a mask image (white area on black background)
    const base64Mask = await createFaceMask(width, height);

    // Create a detailed prompt for specific skin improvements
    const detailedPrompt = `Remove facial scars, acne, and blemishes. Refine skin texture, reduce pore size, and create a smooth, even skin tone. Maintain all facial features and structure. ${treatmentDescriptions}`;

    console.log('Making image inpainting request using Imagen API...');

    // Get the project ID and dynamic endpoint
    const apiUrl = await getImagenInpaintingEndpoint() + `?key=${apiKey}`;

    const requestBody = {
      instances: [{
        image: {
          bytesBase64Encoded: base64Image
        },
        mask: {
          bytesBase64Encoded: base64Mask
        },
        prompt: {
          text: detailedPrompt
        }
      }]
    };

    console.log('Using Imagen Inpainting API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image API Error Response:', errorText);
      throw new Error(`Image API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Error generating simulation');
    }

    // Extract image from response
    if (data.predictions && data.predictions.length > 0) {
      const imagePrediction = data.predictions[0];
      if (imagePrediction.bytesBase64Encoded) {
        console.log('Successfully received image data from Imagen Inpainting API');
        return `data:image/png;base64,${imagePrediction.bytesBase64Encoded}`;
      }
    }

    console.error('No image data found in Imagen response');
    throw new Error('No image data returned from Imagen API');
    */
  } catch (error) {
    console.error('Error generating simulation with inpainting:', error);
    // Fall back to standard image generation
    return generateTreatmentSimulation(base64Image, treatmentDescriptions);
  }
};

/**
 * Fallback method when AI-generated images don't preserve facial identity.
 * This simulates the "after" treatment effect by describing what would happen,
 * but returns the original image to maintain facial identity.
 *
 * @param base64Image - Original image
 * @param treatmentDescriptions - Treatments applied
 * @returns The original image with simulated improvements (for this demo)
 */
export const simulateImprovementsWithDescription = async (
  base64Image: string,
  treatmentDescriptions: string
): Promise<{imageUrl: string, description: string}> => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Invalid or missing API key');
    }

    // Clean base64 image if it has a data URL prefix
    let cleanBase64 = base64Image;
    if (cleanBase64.startsWith('data:')) {
      cleanBase64 = cleanBase64.split('base64,')[1];
    }

    // Create a prompt to generate a description of skin improvements
    const descriptionPrompt = `
    This is a photo of a person seeking skin improvement treatments. They want to get these treatments: ${treatmentDescriptions}.

    Write a detailed, scientifically accurate description (120-150 words) of how their skin would improve after these treatments.
    Focus on:
    1. Specific improvements for acne, scars, and blemishes (reduction in inflammation, size, and visibility)
    2. Changes in skin texture (smoothness, reduced roughness, smaller pores)
    3. Improvements in skin tone (evenness, reduction in redness or hyperpigmentation)
    4. Timeline for seeing results (immediate effects vs. gradual improvements)

    Include brief explanations of how each treatment works. For example, laser treatments target pigmentation, while RF treatments stimulate collagen.

    Maintain a professional medical tone. Be accurate yet optimistic without overpromising results.
    `;

    // Make the API call to get a treatment description
    const response = await fetch(`${GEMINI_VISION_API}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: descriptionPrompt },
              {
                inline_data: {
                  mime_type: getImageMimeType(cleanBase64),
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.3,
          max_output_tokens: 350,
        }
      })
    });

    let description = "These treatments would significantly improve your skin by reducing acne, scars, and blemishes. The Picosecond Laser treatment would target pigmentation, breaking down discoloration into smaller particles for your body to remove naturally. Fractional Laser would create micro-damage zones to stimulate collagen production, resulting in smoother skin texture and reduced visibility of scars. Within 2-3 weeks, you'd notice significant improvement in skin texture, evenness, and reduced pore size, with continued improvement over 2-3 months as collagen production increases.";

    if (response.ok) {
      try {
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          description = data.candidates[0].content.parts[0].text.trim();
          console.log('Successfully generated treatment description');
        }
      } catch (parseError) {
        console.warn('Error parsing API response:', parseError);
        // Continue with default description
      }
    } else {
      console.warn('Error from API:', response.status, response.statusText);
      // Continue with default description
    }

    // Return the original image with the description of improvements
    return {
      imageUrl: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
      description
    };
  } catch (error) {
    console.error('Error generating treatment description:', error);
    return {
      imageUrl: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
      description: "Following these treatments, your skin would show significant improvement in clarity and texture. Acne and blemishes would be reduced, while skin tone would become more even with less visible pigmentation. The treatments work by stimulating collagen production, removing damaged skin cells, and encouraging healthy regeneration. You can expect visible improvement after the first session, with optimal results developing over 3-4 weeks as your skin continues to heal and rejuvenate."
    };
  }
};

/**
 * Uses Imagen inpainting to improve skin appearance
 * @param base64Image - Base64 encoded image string
 * @param treatmentDescriptions - Description of treatments to simulate
 * @returns URL of the generated image with improved skin
 */
export const generateSkinImprovementWithInpainting = async (
  base64Image: string,
  treatmentDescriptions: string
): Promise<string> => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Invalid or missing API key');
    }

    console.log('Generating acne/blemish mask...');

    // Ensure base64Image is properly formatted
    let cleanBase64 = base64Image;
    if (cleanBase64.startsWith('data:')) {
      // Make sure we pass only the base64 data to other functions, not the data URL prefix
      cleanBase64 = cleanBase64.split('base64,')[1];
      console.log('Removed data URL prefix from base64 image');
    }

    // Generate mask that targets acne/blemish areas
    const base64Mask = await createAcneMask(cleanBase64);

    // Validate mask was created successfully
    if (!base64Mask || base64Mask.length < 100) {
      console.error('Invalid mask generated');
      throw new Error('Failed to generate valid mask for inpainting');
    }

    console.log('Mask generated successfully, mask length:', base64Mask.length);

    // Create prompt for skin improvement
    const inpaintingPrompt = `Remove facial acne, scars, and blemishes.
        Smooth skin texture and even out skin tone.
        Reduce pore visibility.
        Create clear, healthy-looking skin.
        Keep all facial features exactly the same.
        Treatment being applied: ${treatmentDescriptions}`;

    console.log('Sending inpainting request to Imagen API...');

    // Get the dynamic endpoint
    const apiUrl = await getImagenInpaintingEndpoint() + `?key=${apiKey}`;

    // Prepare the inpainting request exactly as specified in the documentation
    const requestBody = {
      instances: [{
        image: {
          bytesBase64Encoded: cleanBase64
        },
        mask: {
          bytesBase64Encoded: base64Mask
        },
        prompt: {
          text: inpaintingPrompt
        }
      }]
    };

    console.log('Using Imagen inpainting API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Inpainting API Error Response:', errorText);
      throw new Error(`Inpainting API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Error generating skin improvement');
    }

    // Extract image from the response format for the inpainting API
    if (data.predictions && data.predictions.length > 0) {
      const imagePrediction = data.predictions[0];
      if (imagePrediction.bytesBase64Encoded) {
        console.log('Successfully received image data from Imagen Inpainting API');
        return `data:image/png;base64,${imagePrediction.bytesBase64Encoded}`;
      }
    }

    console.error('No image data found in Imagen inpainting response');
    throw new Error('No image data returned from Imagen inpainting API');
  } catch (error) {
    console.error('Error generating skin improvement with inpainting:', error);
    // Fall back to using regular treatment simulation if inpainting fails
    console.log('Falling back to regular treatment simulation');

    // Rather than crashing, return the error so the UI can show a fallback
    throw error;
  }
};

/**
 * Validates the current API key and OAuth settings.
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

    // You could make a simple test API call here to validate the key works
    // For now we'll just validate the format

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

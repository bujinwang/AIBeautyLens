// Import necessary modules
// Gemini API integration for facial analysis
import { getApiKey, GEMINI_VISION_API, MODELS } from '../config/api';
import axios from 'axios';
import { 
  API_TIMEOUT,
  IMAGEN_GENERATION_API,
  IMAGEN_INPAINTING_API,
  GOOGLE_CLOUD_PROJECT_ID
} from '../config/api';
import { createAcneMask } from '../utils/imageUtils';

/**
 * Analyzes a facial image and returns recommendations
 * @param base64Image - Base64 encoded image string
 * @returns Analysis results including age, skin type, and treatment recommendations
 */
export const analyzeFacialImage = async (base64Image: string) => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();
    
    // Log API key format (safely)
    console.log('API key format check:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'No API key');
    
    // Make sure the API key is valid
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Invalid or missing API key. Please enter a valid Gemini API key in the settings.');
    }
    
    console.log('Making API request to Gemini...');
    
    // First, let's log the key details about the image we're sending
    console.log('Base64 image length:', base64Image ? base64Image.length : 0);
    
    // Validate that image data exists
    if (!base64Image || base64Image.length < 100) {
      throw new Error('Invalid or missing image data. Please provide a valid image.');
    }
    
    // Check if the base64 image is too large - common issue with API limits
    if (base64Image.length > 1000000) {
      console.log('Warning: Base64 image is quite large (' + Math.round(base64Image.length/1024/1024*100)/100 + ' MB), this may exceed API limits');
    }
    
    // Calculate a hash-like value for the image to detect if same image is being sent repeatedly
    const imageFingerprint = base64Image.substring(0, 20) + '...' + base64Image.substring(base64Image.length - 20);
    console.log('Image fingerprint:', imageFingerprint);
    
    // Clean the base64 string to remove any potential line breaks or invalid characters
    base64Image = base64Image.replace(/[\r\n\t]/g, '').trim();
    
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

    // Then use it when constructing the URL
    const mimeType = getImageMimeType(base64Image);
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

For any images with human facial features, include estimated age, skin type, visible facial features that could benefit from treatments, and specific recommendations ONLY from our treatment catalog below.

${treatmentsList}

Format your response as a JSON object with these exact fields:
1. estimatedAge (number)
2. skinType (string)
3. features (array of objects with description and severity)
4. recommendations (array of objects with treatmentId and reason)

The treatmentId must be one of the IDs from the catalog (e.g., "botox", "fractional-laser").
The severity should be a number from 1 to 5, where 1 is mild and 5 is severe.`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
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
    
    // Log the request structure without the image data
    const logRequestBody = JSON.parse(JSON.stringify(requestBody));
    if (logRequestBody.contents && 
        logRequestBody.contents[0] && 
        logRequestBody.contents[0].parts && 
        logRequestBody.contents[0].parts[1] && 
        logRequestBody.contents[0].parts[1].inline_data) {
      // Remove the base64 image from logging to avoid overwhelming the console
      logRequestBody.contents[0].parts[1].inline_data.data = "[BASE64_IMAGE_DATA]";
    }
    console.log('Request structure:', JSON.stringify(logRequestBody, null, 2));
    
    // Make the API call with API key as query parameter
    const apiUrl = `${GEMINI_VISION_API}?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Check HTTP response status
    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response status text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response directly as JSON
    const data = await response.json();
    
    // Add debug logging
    console.log('API response structure:', JSON.stringify(data, null, 2));
    
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
          
          console.log('Attempted to fix truncated JSON:', jsonToParseStr.substring(0, 100) + '...');
        }
        
        // Parse the content string into a JSON object
        const parsedContent = JSON.parse(jsonToParseStr);
        console.log('Successfully parsed content as JSON:', JSON.stringify(parsedContent, null, 2));
        
        // Check if the parsed content contains an error message about not being a face
        if (parsedContent.error === true) {
          throw new Error(parsedContent.message || 'The uploaded image does not contain a human face');
        }
        
        return parsedContent;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Content that failed to parse:', content.substring(0, 200));
        throw new Error('Failed to parse API response content as JSON');
      }
    } else if (typeof content === 'object' && content !== null) {
      // If content is already an object (rare case), check for error
      if (content.error === true) {
        throw new Error(content.message || 'The uploaded image does not contain a human face');
      }
      return content;
    }
    
    throw new Error('Unexpected response format from Gemini API');
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

/**
 * Generates a treatment simulation image using Imagen API
 * @param base64Image - Base64 encoded image string
 * @param treatmentDescriptions - Description of treatments to simulate
 * @returns URL of the generated image or base64 data
 */
export const generateTreatmentSimulation = async (base64Image: string, treatmentDescriptions: string) => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();
    
    // Log API key format (safely)
    console.log('Image API key format check:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'No API key');
    
    // Make sure the API key is valid
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Invalid or missing API key. Please enter a valid Gemini API key in the settings.');
    }

    console.log('Making image generation request using Imagen API...');
    
    // First, analyze the image to identify gender
    const genderDetectionPrompt = `Analyze this facial image and determine the person's gender. Return only one word: "male" or "female".`;
    
    // Make a request to determine gender
    const genderResponse = await fetch(`${GEMINI_VISION_API}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: genderDetectionPrompt },
              {
                inline_data: {
                  mime_type: getImageMimeType(base64Image),
                  data: base64Image
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.1,
          max_output_tokens: 10,
        }
      })
    });
    
    let gender = "person";
    if (genderResponse.ok) {
      const genderData = await genderResponse.json();
      if (genderData.candidates && genderData.candidates[0].content.parts[0].text) {
        const genderText = genderData.candidates[0].content.parts[0].text.toLowerCase().trim();
        if (genderText.includes("male")) {
          gender = "male";
        } else if (genderText.includes("female")) {
          gender = "female";
        }
      }
    }
    
    console.log(`Detected gender: ${gender}`);
    
    // Create a detailed prompt that focuses on specific skin improvements
    const detailedPrompt = `I NEED TO KEEP THE EXACT SAME FACE. This is critical.

This is a photo of a ${gender} with acne and skin texture issues. Show me the EXACT SAME PERSON with ONLY the following changes:
1. Remove the acne, blemishes, and visible scars
2. Reduce the visibility of pores
3. Even out the skin tone
4. Keep all other facial features exactly the same

DO NOT:
- Change the face shape
- Change the eye color or size
- Change the nose shape or size
- Change the lip shape or size
- Change the hair
- Change the overall facial structure
- Use a different person
- Make the person look "prettier" or "more attractive"

This should look like the same exact photograph, only with clearer skin. The treatments being applied are: ${treatmentDescriptions}.

REPEAT: THIS MUST BE THE SAME PERSON IN THE PHOTOGRAPH, with only skin blemishes and acne removed.`;
    
    // For Imagen, we need to use the correct format for the predict endpoint
    const requestBody = {
      instances: [
        {
          prompt: detailedPrompt
        }
      ],
      parameters: {
        sampleCount: 1
      }
    };
    
    // Use the Imagen API endpoint
    const apiUrl = `${IMAGEN_GENERATION_API}?key=${apiKey}`;
    console.log('Using Imagen API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Check HTTP response status
    console.log('Imagen API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image API Error Response:', errorText);
      throw new Error(`Image API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error generating simulation');
    }
    
    // Extract image from Imagen API response format for predict endpoint
    if (data.predictions && data.predictions.length > 0) {
      const imagePrediction = data.predictions[0];
      if (imagePrediction.bytesBase64Encoded) {
        console.log('Successfully received image data from Imagen API');
        return `data:image/png;base64,${imagePrediction.bytesBase64Encoded}`;
      }
    }
    
    console.error('No image data found in Imagen response:', JSON.stringify(data, null, 2));
    throw new Error('No image data returned from Imagen API');
  } catch (error) {
    console.error('Error generating simulation:', error);
    throw error;
  }
};

/**
 * Helper function to determine image type from base64 prefix
 */
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
    
    // Prepare request body for Imagen API
    const requestBody = {
      prompt: {
        text: prompt
      },
      // Optional negative prompt if provided
      ...(negativePrompt && {
        negative_prompt: {
          text: negativePrompt
        }
      }),
      // Configuration parameters
      responseType: "base64",
      sampleCount: 1
    };

    // Make the API request
    const response = await axios.post(
      `${IMAGEN_GENERATION_API}?key=${apiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: API_TIMEOUT,
      }
    );

    if (response.data && response.data.images && response.data.images.length > 0) {
      return response.data.images[0].base64;
    } else {
      throw new Error('No image was generated in the response');
    }
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
  baseImage: string,
  treatmentDescription: string
): Promise<string> => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();
    
    // Log API key format (safely)
    console.log('Imagen API key format check:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'No API key');
    
    // Make sure the API key is valid
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Invalid or missing API key. Please enter a valid Gemini API key in the settings.');
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
    
    // Make the API call with the correct predict endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Check HTTP response status
    console.log('Imagen API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagen API Error Response:', errorText);
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
        console.log('Successfully received image data from Imagen API');
        return imagePrediction.bytesBase64Encoded;
      }
    }
    
    console.error('No image data found in response:', JSON.stringify(data, null, 2));
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
    
    // Prepare the inpainting request using Vertex AI format
    const projectId = 'YOUR_PROJECT_ID'; // Replace with your actual project ID
    const apiUrl = IMAGEN_INPAINTING_API.replace('PROJECT_ID', projectId) + `?key=${apiKey}`;
    
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
    
    // Create a prompt to generate a description of skin improvements
    const descriptionPrompt = `
    This is a photo of a person with some skin issues. They want to get these treatments: ${treatmentDescriptions}.
    
    Write a brief, detailed description (100-150 words) of how their skin would improve after these treatments.
    Focus on:
    1. How the acne/scars would be reduced or eliminated
    2. How their skin texture would improve
    3. How their overall skin tone would become more even
    4. The specific benefits of each treatment
    
    Keep it realistic and medical/clinical in tone. Don't exaggerate results.
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
                  mime_type: getImageMimeType(base64Image),
                  data: base64Image
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.2,
          max_output_tokens: 300,
        }
      })
    });
    
    let description = "This treatment would improve the skin by reducing acne, removing scars, and evening out skin tone. The skin texture would become smoother with significantly reduced blemishes and pore size.";
    
    if (response.ok) {
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        description = data.candidates[0].content.parts[0].text;
      }
    }
    
    // Return the original image with the description of improvements
    return {
      imageUrl: `data:image/jpeg;base64,${base64Image}`,
      description
    };
  } catch (error) {
    console.error('Error generating treatment description:', error);
    return {
      imageUrl: `data:image/jpeg;base64,${base64Image}`,
      description: "These treatments would significantly reduce acne, scars, and blemishes while improving overall skin tone and texture."
    };
  }
};

/**
 * Generates a treatment simulation using proper inpainting with Imagen.
 * This preserves the exact face structure and identity while only modifying skin blemishes.
 * 
 * Requires a Google Cloud account with Vertex AI access.
 * 
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
    
    // Replace project ID placeholder with actual project ID
    const projectId = GOOGLE_CLOUD_PROJECT_ID;
    
    // If project ID is not set properly, throw a more specific error
    if (!projectId || projectId === 'your-project-id') {
      throw new Error('Google Cloud Project ID is not configured. Please set it in config/api.ts');
    }
    
    const apiUrl = IMAGEN_INPAINTING_API.replace('PROJECT_ID', projectId) + `?key=${apiKey}`;
    
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
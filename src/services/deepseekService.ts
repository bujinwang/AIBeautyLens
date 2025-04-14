// Import necessary modules
// DeepSeek API integration for facial analysis
import { getApiKey, DEEPSEEK_CHAT_API, MODELS, IS_DEVELOPMENT, MOCK_RESPONSES } from '../config/api';

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
    if (!apiKey || apiKey === 'YOUR_DEEPSEEK_API_KEY') {
      // If in development mode, return mock data instead of failing
      if (typeof IS_DEVELOPMENT !== 'undefined' && IS_DEVELOPMENT) {
        console.log('Using mock analysis data since no valid API key was provided');
        return MOCK_RESPONSES.ANALYSIS;
      }
      throw new Error('Invalid or missing API key. Please enter a valid DeepSeek API key in the settings.');
    }
    
    console.log('Making API request to DeepSeek...');
    
    // First, let's log the key details about the image we're sending
    console.log('Base64 image length:', base64Image ? base64Image.length : 0);
    
    // Check if the base64 image is too large - common issue with API limits
    if (base64Image && base64Image.length > 1000000) {
      console.log('Warning: Base64 image is quite large (' + Math.round(base64Image.length/1024/1024*100)/100 + ' MB), this may exceed API limits');
    }
    
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
    
    // Prepare the request body
    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `Analyze this facial image for potential cosmetic treatments. Include estimated age, skin type, facial features that could benefit from treatments, and specific recommendations ONLY from our treatment catalog below.

${treatmentsList}

Be detailed but concise. Format your response as a JSON object with these exact fields:
1. estimatedAge (number)
2. skinType (string)
3. features (array of objects with description and confidence)
4. recommendations (array of objects with treatmentId and reason)

The treatmentId must be one of the IDs from the catalog (e.g., "botox", "fractional-laser").
<image>`,
          images: [`data:${mimeType};base64,${base64Image}`]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1024
    };
    
    // Log the request structure, but truncate the base64 image for readability
    const logRequestBody = JSON.parse(JSON.stringify(requestBody)); // Create a deep copy
    if (logRequestBody.messages && 
        logRequestBody.messages[0] && 
        logRequestBody.messages[0].images && 
        logRequestBody.messages[0].images[0]) {
      // Truncate the base64 image in the log to avoid overwhelming the console
      const urlValue = logRequestBody.messages[0].images[0];
      if (urlValue.length > 100) {
        logRequestBody.messages[0].images[0] = 
          urlValue.substring(0, 150) + '...' + urlValue.substring(urlValue.length - 150);
      }
    }
    console.log('Request structure:', JSON.stringify(logRequestBody, null, 2));
    
    // Make the API call
    const response = await fetch(DEEPSEEK_CHAT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // Check HTTP response status
    console.log('DeepSeek API response status:', response.status);
    console.log('DeepSeek API response status text:', response.statusText);
    console.log('DeepSeek API response headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response as text first to debug
    const responseText = await response.text();
    console.log('Raw API response (first 500 chars):', responseText.substring(0, 500));
    console.log('Raw API response (last 500 chars):', responseText.substring(Math.max(0, responseText.length - 500)));
    
    // Now parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', parseError);
      console.error('Response that failed to parse:', responseText.substring(0, 500));
      
      // Return a fallback mock response for testing
      if (IS_DEVELOPMENT) {
        console.log('Returning mock data for development');
        return MOCK_RESPONSES.ANALYSIS;
      }
      
      throw new Error('Invalid JSON response from DeepSeek API');
    }
    
    // Add debug logging
    console.log('API response structure:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      throw new Error(data.error.message || 'Error analyzing image');
    }
    
    // Check if the response has the expected structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response structure from DeepSeek API');
    }
    
    // Parse JSON from DeepSeek response
    const content = data.choices[0].message.content;
    
    if (typeof content === 'string') {
      try {
        // Parse the content string into a JSON object
        const parsedContent = JSON.parse(content);
        console.log('Successfully parsed content as JSON:', JSON.stringify(parsedContent, null, 2));
        return parsedContent;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Content that failed to parse:', content.substring(0, 200));
        
        // Return a fallback mock response for testing
        if (IS_DEVELOPMENT) {
          console.log('Returning mock data after content parse failure');
          return MOCK_RESPONSES.ANALYSIS;
        }
        
        throw new Error('Failed to parse API response content as JSON');
      }
    } else if (typeof content === 'object' && content !== null) {
      // If content is already an object (rare case), return it directly
      return content;
    }
    
    throw new Error('Unexpected response format from DeepSeek API');
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}; 
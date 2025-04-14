// DeepSeek API integration for image generation
import { getApiKey, DEEPSEEK_IMAGE_API, MODELS, IS_DEVELOPMENT, MOCK_RESPONSES } from '../config/api';

/**
 * Generates a treatment simulation image using DeepSeek AI
 * @param base64Image - Base64 encoded image string
 * @param treatmentDescriptions - Description of treatments to simulate
 * @returns URL of the generated image
 */
export const generateTreatmentSimulation = async (base64Image: string, treatmentDescriptions: string) => {
  try {
    // Get the API key from storage
    const apiKey = await getApiKey();
    
    // Log API key format (safely)
    console.log('Image API key format check:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'No API key');
    
    // Make sure the API key is valid
    if (!apiKey || apiKey === 'YOUR_DEEPSEEK_API_KEY') {
      // If in development mode, return mock data instead of failing
      if (typeof IS_DEVELOPMENT !== 'undefined' && IS_DEVELOPMENT) {
        console.log('Using mock image URL since no valid API key was provided');
        return MOCK_RESPONSES.IMAGE_URL;
      }
      throw new Error('Invalid or missing API key. Please enter a valid DeepSeek API key in the settings.');
    }
    
    console.log('Making image generation request to DeepSeek...');
    const response = await fetch(DEEPSEEK_IMAGE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODELS.DEEPSEEK_IMAGE,
        prompt: `Generate a realistic after image showing the results of these cosmetic treatments: ${treatmentDescriptions}. Maintain the same identity but show the specific improvements. The image should look realistic and professional, like a before/after comparison for a medical aesthetics clinic.`,
        n: 1,
        size: "1024x1024",
        input_image: base64Image,
        quality: "standard"
      })
    });
    
    // Check HTTP response status
    console.log('DeepSeek Image API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image API Error Response:', errorText);
      throw new Error(`Image API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response as text first to debug
    const responseText = await response.text();
    console.log('Raw Image API response (first 200 chars):', responseText.substring(0, 200));
    
    // Now parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Image API response as JSON:', parseError);
      console.error('Image response that failed to parse:', responseText.substring(0, 500));
      
      // Return a fallback image URL for testing
      if (__DEV__) {
        console.log('Returning mock image for development');
        return 'https://placehold.co/1024x1024/png?text=Simulated+Treatment';
      }
      
      throw new Error('Invalid JSON response from DeepSeek Image API');
    }
    
    if (data.error) {
      throw new Error(data.error.message || 'Error generating simulation');
    }
    
    // Check if the response has the expected structure
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Unexpected Image API response structure:', JSON.stringify(data, null, 2));
      
      // Return a fallback image URL for testing
      if (__DEV__) {
        return 'https://placehold.co/1024x1024/png?text=Fallback+Image';
      }
      
      throw new Error('Invalid response structure from DeepSeek Image API');
    }
    
    console.log('Successfully received image URL from DeepSeek API');
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating simulation:', error);
    throw error;
  }
}; 
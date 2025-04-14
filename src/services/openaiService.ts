// @ts-ignore
import Constants from 'expo-constants';

// Replace with your actual DeepSeek API key
const DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY';

/**
 * Analyzes a facial image and returns recommendations
 * @param base64Image - Base64 encoded image string
 * @returns Analysis results including age, skin type, and treatment recommendations
 */
export const analyzeFacialImage = async (base64Image: string) => {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-vision",  // Use the DeepSeek vision model
        messages: [
          {
            role: "system",
            content: "You are an Aesthetic Medicine Specialist analyzing facial images."
          },
          {
            role: "user",
            content: [
              {
                type: "text", 
                text: "Analyze this facial image for potential cosmetic treatments. Include estimated age, skin type, facial features that could benefit from treatments, and specific recommendations from our treatment catalog. Be detailed but concise. Format your response as a JSON object with fields for estimatedAge (number), skinType (string), features (array of objects with description and confidence), and recommendations (array of objects with treatmentId and reason)."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error analyzing image');
    }
    
    // Parse JSON from DeepSeek response
    const content = data.choices[0].message.content;
    return typeof content === 'string' ? JSON.parse(content) : content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}; 
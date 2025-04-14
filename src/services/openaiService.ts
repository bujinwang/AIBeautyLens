// @ts-ignore
import Constants from 'expo-constants';

// For development, use a placeholder API key
// In production, this should be securely managed via environment variables
const OPENAI_API_KEY = 'YOUR_API_KEY_HERE';

export const analyzeFacialImage = async (base64Image: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
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
                text: "Analyze this facial image for potential cosmetic treatments. Include estimated age, skin type, facial features that could benefit from treatments, and specific recommendations from our treatment catalog. Be detailed but concise."
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
        response_format: { type: "json_object" }
      })
    });
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'Error analyzing image');
    }
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}; 
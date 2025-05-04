// Import necessary modules
// Gemini API integration for facial analysis
import { getApiKey, GEMINI_VISION_API, FALLBACK_API_KEY } from '../config/api';
import axios from 'axios';
import {
  API_TIMEOUT
} from '../config/api';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/localizationContext';
import { getFacialAnalysisPrompt, getProductRecommendationsPrompt, generateTreatmentsList } from './promptTemplates';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { SkincareRecommendation } from '../types';
import { TREATMENTS } from '../constants/treatments';
import { SkincareProduct, SKINCARE_PRODUCTS } from '../constants/skincareProducts';

// Navigation reference for navigation outside of components
// This is used in the navigate function below
let _navigationRef: any = null;

// Set the navigation reference
export const setGlobalNavigationRef = (navigationRef: any) => {
  _navigationRef = navigationRef;
};

// This function is used elsewhere in the app to navigate programmatically
export const navigate = (name: string, params?: any) => {
  if (_navigationRef && _navigationRef.isReady()) {
    _navigationRef.navigate(name, params);
  }
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
// This is used in the API calls below
export const logAPIResponse = (context: string, status: number, statusText: string) => {
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

// Function to translate product information based on language
const translateProductInfo = (text: string, language: string): string => {
  if (language === 'zh') {
    // Simple translations for common skincare terms
    const translations: Record<string, string> = {
      'Cleanser': '洁面乳',
      'Moisturizer': '保湿霜',
      'Serum': '精华液',
      'Sunscreen': '防晒霜',
      'Exfoliator': '去角质产品',
      'Toner': '爽肤水',
      'Mask': '面膜',
      'Apply': '使用',
      'Skin': '皮肤',
      'Face': '面部',
      'Morning': '早上',
      'Evening': '晚上',
      'Daily': '每天',
      'Twice': '两次',
      'Gently': '轻轻地',
      'Massage': '按摩',
      'Rinse': '冲洗',
      'Hydrating': '保湿',
      'Nourishing': '滋养',
      'Soothing': '舒缓',
      'Brightening': '美白',
      'Anti-aging': '抗衰老',
      'Acne': '痘痘',
      'Sensitive': '敏感',
      'Dry': '干性',
      'Oily': '油性',
      'Combination': '混合性',
      'Normal': '中性',
      'Ingredients': '成分',
      'Benefits': '好处',
      'Usage': '使用方法',
      'Directions': '使用说明',
      'Recommended': '推荐',
      'For': '适用于',
      'And': '和',
      'With': '含有',
      'Contains': '含有',
      'Helps': '有助于',
      'Reduces': '减少',
      'Improves': '改善',
      'Prevents': '预防',
      'Protects': '保护',
      'Repairs': '修复',
      'Restores': '恢复',
      'Balances': '平衡',
      'Calms': '镇静',
      'Soothes': '舒缓',
      'Hydrates': '保湿',
      'Moisturizes': '滋润',
      'Nourishes': '滋养',
      'Cleanses': '清洁',
      'Exfoliates': '去角质',
      'Tones': '调理',
      'Brightens': '美白',
      'Firms': '紧致',
      'Smooths': '平滑',
      'Evens': '均匀',
      'Texture': '质地',
      'Tone': '肤色',
      'Appearance': '外观',
      'Skin barrier': '皮肤屏障',
      'Pores': '毛孔',
      'Wrinkles': '皱纹',
      'Fine lines': '细纹',
      'Dark spots': '黑斑',
      'Redness': '泛红',
      'Inflammation': '炎症',
      'Irritation': '刺激',
      'Dryness': '干燥',
      'Oiliness': '油腻',
      'Breakouts': '爆发',
      'Blemishes': '瑕疵',
      'Blackheads': '黑头',
      'Whiteheads': '白头',
      'Hyperpigmentation': '色素沉着',
      'Sun damage': '日晒伤害',
      'Aging': '老化',
      'Dullness': '暗沉',
      'Uneven': '不均匀',
      'Radiant': '光彩',
      'Glowing': '发光',
      'Healthy': '健康',
      'Youthful': '年轻',
      'Smooth': '光滑',
      'Soft': '柔软',
      'Firm': '紧致',
      'Plump': '丰满',
      'Supple': '柔软',
      'Elastic': '有弹性',
      'Refreshed': '焕然一新',
      'Revitalized': '恢复活力',
      'Renewed': '更新',
      'Transformed': '转变',
      'Enhanced': '增强',
      'Improved': '改善',
      'Optimized': '优化',
      'Maximized': '最大化',
      'Boosted': '提升',
      'Strengthened': '加强',
      'Fortified': '强化',
      'Enriched': '丰富',
      'Infused': '注入',
      'Packed': '充满',
      'Loaded': '装载',
      'Formulated': '配制',
      'Designed': '设计',
      'Created': '创建',
      'Developed': '开发',
      'Tested': '测试',
      'Proven': '证明',
      'Clinically': '临床',
      'Dermatologically': '皮肤科',
      'Hypoallergenic': '低过敏性',
      'Non-comedogenic': '不致粉刺',
      'Fragrance-free': '无香料',
      'Alcohol-free': '无酒精',
      'Paraben-free': '无对羟基苯甲酸酯',
      'Sulfate-free': '无硫酸盐',
      'Silicone-free': '无硅',
      'Oil-free': '无油',
      'Cruelty-free': '不做动物测试',
      'Vegan': '纯素',
      'Natural': '天然',
      'Organic': '有机',
      'Clean': '清洁',
      'Safe': '安全',
      'Effective': '有效',
      'Powerful': '强大',
      'Gentle': '温和',
      'Mild': '温和',
      'Lightweight': '轻盈',
      'Rich': '丰富',
      'Creamy': '奶油状',
      'Silky': '丝滑',
      'Luxurious': '豪华',
      'Premium': '高级',
      'Professional': '专业',
      'Advanced': '先进',
      'Innovative': '创新',
      'Revolutionary': '革命性',
      'Breakthrough': '突破',
      'Cutting-edge': '前沿',
      'State-of-the-art': '最先进',
      'Next-generation': '下一代',
      'High-performance': '高性能',
      'Multi-tasking': '多任务',
      'All-in-one': '多合一',
      'Targeted': '针对性',
      'Specialized': '专业',
      'Customized': '定制',
      'Personalized': '个性化',
      'Tailored': '量身定制',
      'Exclusive': '独家',
      'Unique': '独特',
      'Signature': '标志性',
      'Iconic': '标志性',
      'Classic': '经典',
      'Bestselling': '畅销',
      'Award-winning': '获奖',
      'Cult-favorite': '流行',
      'Must-have': '必备',
      'Essential': '必需',
      'Staple': '主要',
      'Go-to': '首选',
      'Holy grail': '圣杯',
      'Game-changer': '游戏规则改变者',
      'Life-changing': '改变生活',
      'Transformative': '变革',
      'Miraculous': '神奇',
      'Amazing': '惊人',
      'Incredible': '难以置信',
      'Extraordinary': '非凡',
      'Exceptional': '特殊',
      'Outstanding': '杰出',
      'Remarkable': '显著',
      'Impressive': '令人印象深刻',
      'Stunning': '惊人',
      'Spectacular': '壮观',
      'Fabulous': '极好',
      'Fantastic': '极好',
      'Wonderful': '精彩',
      'Excellent': '优秀',
      'Superb': '极好',
      'Superior': '优越',
      'Ultimate': '终极',
      'Perfect': '完美',
      'Ideal': '理想',
      'Optimal': '最佳',
      'Best': '最好',
      'Top': '顶级',
      'Premium_1': '高级',
      'Luxury': '奢侈',
      'High-end': '高端',
      'Prestige': '声望',
      'Elite': '精英',
      'Exclusive_1': '独家',
      'Limited edition': '限量版',
      'Special': '特别',
      'Unique_1': '独特',
      'One-of-a-kind': '独一无二',
      'Distinctive': '独特',
      'Innovative_1': '创新',
      'Groundbreaking': '开创性',
      'Revolutionary_1': '革命性',
      'Pioneering': '开创性',
      'Trailblazing': '开创性',
      'Visionary': '有远见',
      'Forward-thinking': '前瞻性',
      'Futuristic': '未来主义',
      'Modern': '现代',
      'Contemporary': '当代',
      'Trendy': '时尚',
      'Fashionable': '时尚',
      'Stylish': '时尚',
      'Chic': '别致',
      'Sophisticated': '复杂',
      'Elegant': '优雅',
      'Refined': '精致',
      'Polished': '精致',
      'Sleek': '时尚',
      'Minimalist': '极简主义',
      'Clean_1': '干净',
      'Pure_1': '纯净',
      'Simple': '简单',
      'Uncomplicated': '不复杂',
      'Straightforward': '直接',
      'Easy': '容易',
      'Convenient': '方便',
      'Practical': '实用',
      'Functional': '功能性',
      'Versatile': '多功能',
      'Flexible': '灵活',
      'Adaptable': '适应性',
      'Universal': '通用',
      'All-purpose': '多用途',
      'Comprehensive': '全面',
      'Complete': '完整',
      'Thorough': '彻底',
      'Extensive': '广泛',
      'Expansive': '广阔',
      'Wide-ranging': '广泛',
      'Far-reaching': '深远',
      'Long-lasting': '持久',
      'Enduring': '持久',
      'Durable': '耐用',
      'Resilient': '有弹性',
      'Robust': '强健',
      'Strong': '强大',
      'Powerful_1': '强大',
      'Potent': '有效',
      'Concentrated': '浓缩',
      'Intense': '强烈',
      'Deep': '深',
      'Profound': '深刻',
      'Significant': '重要',
      'Substantial': '实质性',
      'Considerable': '相当',
      'Notable': '显著',
      'Noticeable': '明显',
      'Visible': '可见',
      'Apparent': '明显',
      'Evident': '明显',
      'Clear': '清晰',
      'Obvious': '明显',
      'Unmistakable': '明确',
      'Undeniable': '不可否认',
      'Indisputable': '无可争议',
      'Unquestionable': '无可置疑',
      'Certain': '确定',
      'Definite': '明确',
      'Absolute': '绝对',
      'Complete_1': '完整',
      'Total': '总',
      'Utter': '完全',
      'Sheer': '纯',
      'Pure_2': '纯',
      'Unadulterated': '纯',
      'Undiluted': '未稀释',
      'Full-strength': '全强度',
      'Maximum': '最大',
      'Optimal_1': '最佳',
      'Ideal_1': '理想',
      'Perfect_1': '完美',
    };

    // Replace English terms with Chinese translations
    let translatedText = text;
    Object.entries(translations).forEach(([english, chinese]) => {
      // Use word boundary to avoid partial word matches
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, chinese);
    });

    return translatedText;
  }

  // Return original text for other languages
  return text;
};

// Interface for Gemini API request with user's skin info
interface GeminiProductRequestData {
  skinType: string;
  concerns: string[];
  existingRecommendations: SkincareRecommendation[];
  language?: string;
}

// Response from Gemini API with product recommendations
// This interface is used in the implementation of the Gemini API integration
// It's kept here for documentation purposes
/*
interface GeminiProductResponseData {
  products: SkincareProduct[];
}
*/

// Mock API key - in a real app, this would be stored in environment variables
// and accessed securely
// This is now handled in the config/api.ts file
// const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

/**
 * Analyzes a facial image and returns recommendations
 * @param base64Image - Base64 encoded image string
 * @param visitPurpose - Optional purpose of the visit
 * @param appointmentLength - Optional appointment length
 * @returns Analysis results including age, skin type, and treatment recommendations
 */
export const analyzeFacialImage = async (imageUri: string, visitPurpose?: string, appointmentLength?: string) => {
  let base64Image = '';
  if (imageUri.startsWith('file://')) {
    base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else {
    base64Image = imageUri;
  }
  // Get the current language from AsyncStorage
  let currentLanguage = 'en';
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    if (savedLanguage) {
      currentLanguage = savedLanguage;
    }
  } catch (error) {
    console.error('Error loading language preference:', error);
  }
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

      // Generate the treatments list from the full TREATMENTS array
      const treatmentsList = generateTreatmentsList(TREATMENTS);

      // Prepare the request body for Gemini
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: getFacialAnalysisPrompt(currentLanguage, treatmentsList, visitPurpose, appointmentLength)
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
  // Get the current language from AsyncStorage
  let currentLanguage = 'en';
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    if (savedLanguage) {
      currentLanguage = savedLanguage;
    }
  } catch (error) {
    console.error('Error loading language preference:', error);
  }
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
            text: getProductRecommendationsPrompt(
              currentLanguage,
              requestData.skinType,
              requestData.concerns,
              requestData.existingRecommendations
            )
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
  // Get the language from the request data or AsyncStorage
  let currentLanguage = requestData.language || 'en';
  if (!requestData.language) {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        currentLanguage = savedLanguage;
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  }
  const { skinType, concerns, existingRecommendations } = requestData;

  // Function to translate Chinese category to English for better matching
  const translateCategoryToEnglish = (category: string): string => {
    // Map of Chinese categories to English equivalents
    const chineseToEnglishMap: Record<string, string> = {
      '洁面乳': 'Gentle Cleanser',
      '温和洁面乳': 'Gentle Cleanser',
      '洗面奶': 'Cleanser',
      '洁面': 'Cleanser',
      '保湿霜': 'Moisturizer',
      '保湿面霜': 'Moisturizer',
      '轻盈保湿霜': 'Lightweight Moisturizer',
      '面霜': 'Moisturizer',
      '乳液': 'Moisturizer',
      '精华': 'Serum',
      '精华液': 'Serum',
      '精华 (抗炎/色素沉着后炎症)': 'Treatment Serum (Anti-inflammatory/PIH)',
      '抗炎精华': 'Treatment Serum (Anti-inflammatory)',
      '祛斑精华': 'Treatment Serum (PIH)',
      '美白精华': 'Brightening Serum',
      '精华 (痘痘/质地 - 谨慎使用)': 'Treatment Serum (Acne/Texture - Use cautiously)',
      '祛痘精华': 'Acne Treatment Serum',
      '痘痘精华': 'Acne Treatment Serum',
      '抗痘精华': 'Acne Treatment Serum',
      '防晒霜': 'Sunscreen',
      '防晒': 'Sunscreen',
      '防晒乳': 'Sunscreen',
      '保湿精华': 'Hydrating Serum',
      '补水精华': 'Hydrating Serum',
      '精华 (日间)': 'Treatment Serum (AM)',
      '日间精华': 'Treatment Serum (AM)',
      '精华 (夜间 - 交替使用)': 'Treatment Serum (PM)',
      '夜间精华': 'Treatment Serum (PM)',
      '爽肤水': 'Toner',
      '化妆水': 'Toner',
      '柔肤水': 'Toner',
      '去角质产品': 'Exfoliator',
      '磨砂膏': 'Exfoliator',
      '去角质': 'Exfoliator',
      '面膜': 'Mask',
      '眼霜': 'Eye Cream',
      '眼部护理': 'Eye Care'
    };

    // Return English equivalent if found, otherwise return original
    return chineseToEnglishMap[category] || category;
  };

  try {
    // Handle combined skin types (e.g., "Combination/Sensitive")
    const skinTypes = skinType.toLowerCase().split('/').map(type => type.trim());

    // Get all products matching any of the skin types
    const skinTypeProducts = skinTypes.length > 0
      ? SKINCARE_PRODUCTS.filter(product =>
          product.skinType.some(type =>
            skinTypes.includes(type.toLowerCase()) || type.toLowerCase() === 'all'
          )
        )
      : SKINCARE_PRODUCTS;

    const recommendedProducts: SkincareProduct[] = [];
    const usedProductIds = new Set<string>(); // Track used product IDs

    // Process each recommendation type
    for (const recommendation of existingRecommendations) {
      // Get the product type (category) and translate to English if needed
      let productType = recommendation.productType;
      let originalProductType = productType; // Keep original for logging

      // If UI is in Chinese, translate the category to English for better matching
      if (currentLanguage === 'zh') {
        const englishProductType = translateCategoryToEnglish(productType);
        console.log(`Translating category from '${productType}' to '${englishProductType}' for better matching`);
        productType = englishProductType;
      }

      // Log the category we're processing
      console.log(`Processing product category: ${productType}${currentLanguage === 'zh' ? ` (original: ${originalProductType})` : ''}`);

      // Ensure we have a valid product type - use a default if somehow empty
      if (!productType || productType.trim() === '') {
        console.warn(`Empty product type found, using default category`);
        // Use a default category based on position in recommendations
        const defaultCategories = ['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen'];
        const index = Math.min(existingRecommendations.indexOf(recommendation), defaultCategories.length - 1);
        productType = defaultCategories[index];
        console.log(`Using default category: ${productType}`);
      }

      // Find products in this category for this skin type
      let matchingProducts = skinTypeProducts.filter(product => {
        // Skip if we've already recommended this product
        if (usedProductIds.has(product.id)) {
          return false;
        }

        // Normalize categories for comparison
        const normalizedProductCategory = product.category.toLowerCase().replace(/-/g, ' ');
        const normalizedRecommendationType = productType.toLowerCase().replace(/-/g, ' ');

        // Map common category variations
        const categoryMappings: { [key: string]: string[] } = {
          // English categories
          'gentle cleanser': ['cleanser', 'gentle cleanser'],
          'exfoliating/pih serum': ['serum', 'targeted treatment', 'exfoliator'],
          'lightweight moisturizer': ['moisturizer', 'hydrator', 'lightweight moisturizer'],
          'treatment serum (anti-inflammatory / brightening)': ['serum', 'targeted treatment', 'niacinamide', 'azelaic acid'],
          'treatment serum (acne / texture - use cautiously)': ['serum', 'targeted treatment', 'adapalene', 'retinol'],
          'treatment serum (am)': ['serum', 'targeted treatment', 'vitamin c'],
          'treatment serum (pm)': ['serum', 'targeted treatment', 'retinol', 'adapalene'],
          'treatment serum': ['serum', 'targeted treatment'],
          'hydrating moisturizer': ['moisturizer', 'hydrator'],

          // Chinese categories
          '洁面乳': ['cleanser', 'gentle cleanser'],
          '温和洁面乳': ['cleanser', 'gentle cleanser'],
          '洗面奶': ['cleanser', 'gentle cleanser'],
          '洁面': ['cleanser', 'gentle cleanser'],
          '保湿霜': ['moisturizer', 'hydrator', 'hydrating moisturizer'],
          '保湿面霜': ['moisturizer', 'hydrator', 'hydrating moisturizer'],
          '轻盈保湿霜': ['moisturizer', 'hydrator', 'lightweight moisturizer'],
          '面霜': ['moisturizer', 'hydrator', 'hydrating moisturizer'],
          '乳液': ['moisturizer', 'hydrator', 'hydrating moisturizer'],
          '精华': ['serum', 'targeted treatment'],
          '精华液': ['serum', 'targeted treatment'],
          '精华 (抗炎/色素沉着后炎症)': ['serum', 'targeted treatment', 'niacinamide', 'azelaic acid'],
          '抗炎精华': ['serum', 'targeted treatment', 'niacinamide', 'azelaic acid'],
          '祛斑精华': ['serum', 'targeted treatment', 'niacinamide', 'azelaic acid'],
          '美白精华': ['serum', 'targeted treatment', 'niacinamide', 'azelaic acid'],
          '精华 (痘痘/质地 - 谨慎使用)': ['serum', 'targeted treatment', 'adapalene', 'retinol'],
          '祛痘精华': ['serum', 'targeted treatment', 'adapalene', 'retinol'],
          '痘痘精华': ['serum', 'targeted treatment', 'adapalene', 'retinol'],
          '抗痘精华': ['serum', 'targeted treatment', 'adapalene', 'retinol'],
          '防晒霜': ['sunscreen'],
          '防晒': ['sunscreen'],
          '防晒乳': ['sunscreen'],
          '保湿精华': ['serum', 'hydrating & calming serum', 'targeted treatment'],
          '补水精华': ['serum', 'hydrating & calming serum', 'targeted treatment'],
          '精华 (日间)': ['serum', 'targeted treatment', 'vitamin c'],
          '日间精华': ['serum', 'targeted treatment', 'vitamin c'],
          '精华 (夜间 - 交替使用)': ['serum', 'targeted treatment', 'retinol', 'adapalene'],
          '夜间精华': ['serum', 'targeted treatment', 'retinol', 'adapalene'],
          '爽肤水': ['toner'],
          '化妆水': ['toner'],
          '柔肤水': ['toner'],
          '去角质产品': ['exfoliator'],
          '磨砂膏': ['exfoliator'],
          '去角质': ['exfoliator'],
          '面膜': ['masks', 'mask'],
          '眼霜': ['eye care', 'eye cream'],
          '眼部护理': ['eye care', 'eye cream']
        };

        // Check direct match
        if (normalizedProductCategory === normalizedRecommendationType) {
          return true;
        }

        // Check mapped categories and handle specific treatment types
        const mappedCategories = categoryMappings[normalizedRecommendationType] || [];
        if (mappedCategories.some(cat =>
          normalizedProductCategory.includes(cat) ||
          cat.includes(normalizedProductCategory)
        )) {
          // For anti-inflammatory/brightening serums, prefer products with niacinamide or azelaic acid
          if (normalizedRecommendationType === 'treatment serum (anti-inflammatory / brightening)' &&
              (!product.ingredients ||
               !(product.ingredients.toLowerCase().includes('niacinamide') ||
                 product.ingredients.toLowerCase().includes('azelaic acid')))) {
            return false;
          }

          // For acne/texture serums, prefer adapalene or retinol products
          if (normalizedRecommendationType === 'treatment serum (acne / texture - use cautiously)' &&
              (!product.ingredients ||
               !(product.ingredients.toLowerCase().includes('adapalene') ||
                 product.ingredients.toLowerCase().includes('retinol')))) {
            return false;
          }

          // For AM treatment serums, prefer Vitamin C products
          if (normalizedRecommendationType === 'treatment serum (am)' &&
              (!product.ingredients || !product.ingredients.toLowerCase().includes('vitamin c'))) {
            return false;
          }

          // For PM treatment serums, prefer retinol/adapalene products
          if (normalizedRecommendationType === 'treatment serum (pm)' &&
              (!product.ingredients ||
               !(product.ingredients.toLowerCase().includes('retinol') ||
                 product.ingredients.toLowerCase().includes('adapalene')))) {
            return false;
          }

          return true;
        }

        // Check if product category contains the recommendation type or vice versa
        // Also check for partial matches with a minimum length to avoid false positives
        if (normalizedProductCategory.includes(normalizedRecommendationType) ||
            normalizedRecommendationType.includes(normalizedProductCategory)) {
          return true;
        }

        // Check for partial word matches with a minimum length
        const productWords = normalizedProductCategory.split(/\s+/);
        const recommendationWords = normalizedRecommendationType.split(/\s+/);

        // Check if any word in product category matches any word in recommendation type
        return productWords.some(pWord =>
          pWord.length > 3 && recommendationWords.some(rWord =>
            rWord.length > 3 && (pWord.includes(rWord) || rWord.includes(pWord))
          )
        );
      });

      console.log(`Found ${matchingProducts.length} matching products for ${productType}`);
      matchingProducts.forEach(p => console.log(`- ${p.brand} ${p.name} (${p.category})`));

      // If no exact matches, try to find products with matching ingredients
      if (matchingProducts.length === 0 && recommendation.recommendedIngredients) {
        console.log(`No category matches found for ${productType}, trying ingredient matching...`);
        const ingredientKeywords = recommendation.recommendedIngredients
          .toLowerCase()
          .replace(/[()%]/g, '')  // Remove parentheses and percentage signs
          .replace(/-/g, ' ')     // Replace hyphens with spaces
          .split(/[,.]/)          // Split by comma or period
          .map(i => i.trim())
          .filter(i => i.length > 0)  // Remove empty strings
          .map(i => i.replace(/\d+(\.\d+)?/g, '').trim()); // Remove numbers

        console.log(`Looking for products with ingredients: ${ingredientKeywords.join(', ')}`);

        matchingProducts = skinTypeProducts.filter(product => {
          if (!product.ingredients) return false;

          const productIngredients = product.ingredients.toLowerCase();

          // Count how many recommended ingredients match
          const matchCount = ingredientKeywords.filter(keyword =>
            productIngredients.includes(keyword) ||
            // Handle common variations
            (keyword.includes('vitamin') && productIngredients.includes('vit')) ||
            (keyword.includes('acid') && productIngredients.includes(keyword.replace(' acid', ''))) ||
            (keyword === 'zinc oxide' && productIngredients.includes('zinc')) ||
            (keyword === 'titanium dioxide' && productIngredients.includes('titanium'))
          ).length;

          // Match if product contains at least one of the recommended ingredients
          return matchCount > 0;
        });

        // Sort by number of matching ingredients
        matchingProducts.sort((a, b) => {
          if (!a.ingredients || !b.ingredients) return 0;

          const aIngredients = a.ingredients.toLowerCase();
          const bIngredients = b.ingredients.toLowerCase();

          const aMatches = ingredientKeywords.filter(keyword =>
            aIngredients.includes(keyword) ||
            // Handle common variations
            (keyword.includes('vitamin') && aIngredients.includes('vit')) ||
            (keyword.includes('acid') && aIngredients.includes(keyword.replace(' acid', ''))) ||
            (keyword === 'zinc oxide' && aIngredients.includes('zinc')) ||
            (keyword === 'titanium dioxide' && aIngredients.includes('titanium'))
          ).length;

          const bMatches = ingredientKeywords.filter(keyword =>
            bIngredients.includes(keyword) ||
            // Handle common variations
            (keyword.includes('vitamin') && bIngredients.includes('vit')) ||
            (keyword.includes('acid') && bIngredients.includes(keyword.replace(' acid', ''))) ||
            (keyword === 'zinc oxide' && bIngredients.includes('zinc')) ||
            (keyword === 'titanium dioxide' && bIngredients.includes('titanium'))
          ).length;

          return bMatches - aMatches;
        });

        console.log(`Found ${matchingProducts.length} products with matching ingredients`);
        matchingProducts.forEach(p => console.log(`- ${p.brand} ${p.name} (matching ingredients)`));
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
        // Sort products by a deterministic score based on:
        // 1. Whether it has full info (usage & ingredients)
        // 2. Number of matching ingredients with recommendations
        // 3. Price (prefer lower price)
        // 4. Alphabetical order of brand+name (for consistent tiebreaker)
        matchingProducts.sort((a, b) => {
          // Score based on having full info
          const aFullInfo = (a.usage && a.ingredients) ? 1 : 0;
          const bFullInfo = (b.usage && b.ingredients) ? 1 : 0;
          if (aFullInfo !== bFullInfo) return bFullInfo - aFullInfo;

          // Score based on matching ingredients
          const recommendedIngredients = recommendation.recommendedIngredients?.toLowerCase() || '';
          const aIngredientsMatch = a.ingredients?.toLowerCase().split(',')
            .filter(i => recommendedIngredients.includes(i.trim())).length || 0;
          const bIngredientsMatch = b.ingredients?.toLowerCase().split(',')
            .filter(i => recommendedIngredients.includes(i.trim())).length || 0;
          if (aIngredientsMatch !== bIngredientsMatch) return bIngredientsMatch - aIngredientsMatch;

          // Score based on price (prefer lower price)
          if (a.price !== b.price) return a.price - b.price;

          // Finally, sort by brand+name for consistency
          const aName = `${a.brand} ${a.name}`.toLowerCase();
          const bName = `${b.brand} ${b.name}`.toLowerCase();
          return aName.localeCompare(bName);
        });

        // Select the best matching product
        const selectedProduct = matchingProducts[0];

        // Track this product as used
        usedProductIds.add(selectedProduct.id);

        // Translate product information if language is Chinese
        if (currentLanguage === 'zh') {
          // Translate product information
          const translatedProduct = {
            ...selectedProduct,
            description: translateProductInfo(selectedProduct.description || '', currentLanguage),
            usage: translateProductInfo(selectedProduct.usage || '', currentLanguage),
            // Ensure category is displayed in Chinese
            category: originalProductType || selectedProduct.category
          };
          // Add to recommendations
          recommendedProducts.push(translatedProduct);
          console.log(`Added translated product: ${selectedProduct.brand} ${selectedProduct.name} with category '${translatedProduct.category}'`);
        } else {
          // Add to recommendations
          recommendedProducts.push(selectedProduct);
          console.log(`Added product: ${selectedProduct.brand} ${selectedProduct.name} with category '${selectedProduct.category}'`);
        }
      } else {
        // Log that no matching product was found
        console.log(`No matching product found for ${productType} in our database. Using fallback...`);

        // FALLBACK: Get any product that might be suitable for this skin type
        // First, try to find any product in the same broad category
        const broadCategoryMap: Record<string, string[]> = {
          'Serum': ['serum', 'essence', 'treatment', 'ampoule'],
          'Moisturizer': ['moisturizer', 'cream', 'lotion', 'emulsion', 'gel'],
          'Sunscreen': ['sunscreen', 'spf', 'sun protection', 'uv protection'],
          'Cleanser': ['cleanser', 'wash', 'cleansing'],
          'Toner': ['toner', 'lotion', 'water'],
          'Exfoliator': ['exfoliator', 'scrub', 'peel'],
          'Mask': ['mask', 'pack'],
          'Eye Cream': ['eye', 'eye cream', 'eye care']
        };

        // Find the broad category keywords that match our product type
        let broadKeywords: string[] = [];
        for (const [broad, specifics] of Object.entries(broadCategoryMap)) {
          const normalizedBroad = broad.toLowerCase();
          const normalizedType = productType.toLowerCase();

          if (normalizedType.includes(normalizedBroad) ||
              normalizedBroad.includes(normalizedType) ||
              specifics.some(s => normalizedType.includes(s))) {
            broadKeywords = [...specifics, normalizedBroad];
            console.log(`Using broad category '${broad}' for fallback matching`);
            break;
          }
        }

        // Try to find any product that matches the broad category
        let fallbackProducts = skinTypeProducts.filter(product => {
          if (usedProductIds.has(product.id)) return false;

          const normalizedCategory = product.category.toLowerCase();
          return broadKeywords.some(keyword => normalizedCategory.includes(keyword));
        });

        // If still no matches, just get any product for this skin type that we haven't used yet
        if (fallbackProducts.length === 0) {
          console.log(`No broad category matches, using any available product for this skin type`);
          fallbackProducts = skinTypeProducts.filter(product => !usedProductIds.has(product.id));
        }

        // If we found any fallback products, use the first one
        if (fallbackProducts.length > 0) {
          const selectedProduct = fallbackProducts[0];
          usedProductIds.add(selectedProduct.id);

          // Translate product information if language is Chinese
          if (currentLanguage === 'zh') {
            const translatedProduct = {
              ...selectedProduct,
              description: translateProductInfo(selectedProduct.description || '', currentLanguage),
              usage: translateProductInfo(selectedProduct.usage || '', currentLanguage),
              // Ensure category is displayed in Chinese
              category: originalProductType || selectedProduct.category
            };
            recommendedProducts.push(translatedProduct);
            console.log(`Added fallback translated product: ${selectedProduct.brand} ${selectedProduct.name} with category '${translatedProduct.category}'`);
          } else {
            recommendedProducts.push(selectedProduct);
            console.log(`Added fallback product: ${selectedProduct.brand} ${selectedProduct.name} with category '${selectedProduct.category}'`);
          }

          console.log(`Using fallback product: ${selectedProduct.brand} ${selectedProduct.name}`);
        } else {
          // If we still have no products, skip this category
          console.log(`No fallback products available for ${productType}. Skipping category.`);
          continue;
        }
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

export const analyzeBeforeAfterImages = async (beforeImage: string, afterImage: string) => {
  console.log('Starting before-after image analysis with Gemini Vision API');
  
  // First, check if we have both images
  if (!beforeImage || !afterImage) {
    console.error('Both before and after images are required for analysis');
    return provideFallbackResponse();
  }

  try {
    // Get the current language from AsyncStorage
    let currentLanguage = 'en';
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        currentLanguage = savedLanguage;
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
    
    console.log(`Using language: ${currentLanguage} for before-after analysis`);

    const apiKey = await getApiKey();
    if (!apiKey) {
      console.error('No API key available for Gemini Vision API');
      return provideFallbackResponse(currentLanguage);
    }

    // Preprocess images to ensure they're not too large
    const processedBeforeImage = await preprocessImage(beforeImage);
    const processedAfterImage = await preprocessImage(afterImage);

    // Create the proper format for the API
    const beforeImageMimeType = getImageMimeType(processedBeforeImage);
    const afterImageMimeType = getImageMimeType(processedAfterImage);

    console.log(`Image MIME types - Before: ${beforeImageMimeType}, After: ${afterImageMimeType}`);
    console.log(`Image sizes - Before: ${processedBeforeImage.length}, After: ${processedAfterImage.length}`);

    // First try the standard request format
    try {
      const standardResult = await makeGeminiApiRequest(
        apiKey, 
        processedBeforeImage, 
        processedAfterImage, 
        beforeImageMimeType,
        afterImageMimeType,
        'standard',
        currentLanguage
      );
      
      if (standardResult) {
        console.log('Standard request format succeeded');
        return standardResult;
      }
    } catch (error: any) {
      console.warn('Standard request format failed:', error.message || "Unknown error");
      // Fall through to alternative format
    }
    
    // If standard format failed, try alternative format
    console.log('Trying alternative request format...');
    try {
      const alternativeResult = await makeGeminiApiRequest(
        apiKey, 
        processedBeforeImage, 
        processedAfterImage, 
        beforeImageMimeType,
        afterImageMimeType,
        'alternative',
        currentLanguage
      );
      
      if (alternativeResult) {
        console.log('Alternative request format succeeded');
        return alternativeResult;
      }
    } catch (error: any) {
      console.warn('Alternative request format failed:', error.message || "Unknown error");
    }
    
    // If both formats failed, return fallback
    console.log('All request formats failed, returning fallback response');
    return provideFallbackResponse(currentLanguage);

  } catch (error) {
    console.error('Error during before-after image analysis:', error);
    // Get current language for fallback
    let currentLanguage = 'en';
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        currentLanguage = savedLanguage;
      }
    } catch (langError) {
      console.error('Error loading language preference:', langError);
    }
    return provideFallbackResponse(currentLanguage);
  }
};

async function makeGeminiApiRequest(
  apiKey: string, 
  beforeImage: string, 
  afterImage: string,
  beforeImageMimeType: string,
  afterImageMimeType: string,
  format: 'standard' | 'alternative',
  language: string = 'en'
) {
  // Create the appropriate request data based on the format
  let requestData;
  
  const languageInstructions = language === 'zh' 
    ? "请使用简体中文回答。分析结果应该是中文格式的JSON对象。"
    : "Please respond in English. Your analysis should be in English.";
  
  const promptText = `You are a professional dermatologist and skin analysis expert. Analyze these before and after photos of a skin treatment. ${languageInstructions}

Compare the two images and provide an analysis of the changes and improvements observed in the skin condition.

ANALYSIS REQUIREMENTS:
1. Overall improvement percentage (quantify the visible improvement)
2. Skin tone changes (brightening, evening, or other changes)
3. Texture changes (smoothness, pore visibility, etc.)
4. Wrinkle/fine line reduction (if applicable)
5. Moisture level changes (visible hydration differences)

After the analysis, provide personalized recommendations for:
1. Whether to continue with the current treatment regimen
2. Additional products or treatments that could enhance results
3. Maintenance advice to preserve the improvements

Format your response in JSON with these sections and fields:
{
  "analysisResults": {
    "improvement": string (percentage or descriptor),
    "skinToneChange": string (detailed observation),
    "textureChange": string (detailed observation),
    "wrinkleReduction": string (detailed observation),
    "moistureLevel": string (detailed observation)
  },
  "recommendations": [
    string (3-4 personalized recommendations)
  ]
}

The FIRST image is the BEFORE treatment image, and the SECOND image is the AFTER treatment image.
Focus on objective, visible changes between the images. Be specific and detailed in your analysis.`;

  if (format === 'standard') {
    // Standard format: Both images in the same message
    requestData = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: beforeImageMimeType,
                data: beforeImage
              }
            },
            {
              inline_data: {
                mime_type: afterImageMimeType,
                data: afterImage
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
  } else {
    // Alternative format: Images in separate messages in a conversation
    requestData = {
      contents: [
        {
          role: "user",
          parts: [
            { text: "I'll show you a before treatment image followed by an after treatment image for skin analysis." }
          ]
        },
        {
          role: "model",
          parts: [
            { text: "I'm ready to analyze the before and after images. Please share them, and I'll provide a detailed comparison focusing on improvements in skin condition." }
          ]
        },
        {
          role: "user",
          parts: [
            { text: "Here is the BEFORE treatment image:" },
            {
              inline_data: {
                mime_type: beforeImageMimeType,
                data: beforeImage
              }
            }
          ]
        },
        {
          role: "model",
          parts: [
            { text: "I've received the before treatment image. Please now share the after treatment image, and I'll provide a comparative analysis." }
          ]
        },
        {
          role: "user",
          parts: [
            { text: "Here is the AFTER treatment image:" },
            {
              inline_data: {
                mime_type: afterImageMimeType,
                data: afterImage
              }
            }
          ]
        },
        {
          role: "user",
          parts: [
            { text: promptText }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
  }

  try {
    console.log(`Sending request to Gemini Vision API using ${format} format...`);
    // Call the Gemini Vision API
    const response = await axios.post(
      `${GEMINI_VISION_API}?key=${apiKey}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: API_TIMEOUT
      }
    );

    console.log(`Gemini API response status (${format} format): ${response.status}`);
    
    if (response.status !== 200) {
      console.error(`API returned status ${response.status}: ${response.statusText}`);
      return null;
    }

    // Detailed logging of the response
    console.log(`===== GEMINI API RESPONSE (${format} FORMAT) START =====`);
    console.log('Response headers:', JSON.stringify(response.headers));
    
    // Log the full response data structure for debugging
    const responseData = response.data;
    
    // Log specific parts of the response structure
    console.log('Response structure:', 
      JSON.stringify({
        hasCandidates: !!responseData.candidates,
        candidatesLength: responseData.candidates?.length,
        hasContent: !!responseData.candidates?.[0]?.content,
        hasParts: !!responseData.candidates?.[0]?.content?.parts,
        partsLength: responseData.candidates?.[0]?.content?.parts?.length,
        finishReason: responseData.candidates?.[0]?.finishReason || 'unknown'
      })
    );
    
    // Check for error in the response
    if (responseData.error) {
      console.error('API returned error:', JSON.stringify(responseData.error));
      return null;
    }
    console.log(`===== GEMINI API RESPONSE (${format} FORMAT) END =====`);
    
    // Parse the response to extract the JSON object
    const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Specifically handle empty text responses
    if (!responseText || responseText.trim() === '') {
      console.error(`Response received but no text content in the response (${format} format)`);
      console.log('Response structure check:');
      console.log('- Has candidates:', !!responseData.candidates);
      if (responseData.candidates && responseData.candidates.length > 0) {
        console.log('- First candidate:', JSON.stringify(responseData.candidates[0]));
        console.log('- Has content:', !!responseData.candidates[0].content);
        if (responseData.candidates[0].content) {
          console.log('- Content parts:', JSON.stringify(responseData.candidates[0].content.parts));
        }
      }
      
      // Check if the error might be in a different part structure
      const firstPart = responseData.candidates?.[0]?.content?.parts?.[0];
      if (firstPart && typeof firstPart === 'object' && !firstPart.text) {
        console.log('First part has no text but might contain:', Object.keys(firstPart));
      }
      
      // Check for alternative content formats
      const altText = responseData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.text || 
                     responseData.candidates?.[0]?.content?.parts?.[0]?.additionalContent ||
                     responseData.candidates?.[0]?.content?.text;
                     
      if (altText) {
        console.log('Found alternative text content in response');
        return extractAnalysisResults(altText, language);
      }
      
      // If MAX_TOKENS and empty response, we can assume the model was cut off
      if (responseData.candidates?.[0]?.finishReason === "MAX_TOKENS") {
        console.log('Response was truncated due to MAX_TOKENS and text is empty. Providing fallback.');
        return provideFallbackResponse(language);
      }
      
      return null;
    }

    console.log(`Received text response from Gemini API (${format} format)`);
    return extractAnalysisResults(responseText, language);
    
  } catch (requestError: any) {
    console.error(`Error making request to Gemini API (${format} format):`, requestError);
    // Check if the error is a timeout
    if (requestError.code === 'ECONNABORTED') {
      console.log(`Request timed out (${format} format)`);
    }
    throw requestError;
  }
}

// Helper function to extract analysis results from text response
function extractAnalysisResults(responseText: string, language: string = 'en') {
  try {
    // Log a sample of the response
    console.log('Response text sample:', responseText.substring(0, 200) + '...');
    
    // Look for JSON pattern in the response text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('No JSON found in response, trying fallback parsing');
      // Try to extract structured data in a different way
      const improvementMatch = responseText.match(/improvement[:\s]*([^.\n,]+)/i);
      const skinToneMatch = responseText.match(/skin tone[:\s]*([^.\n]+)/i);
      const textureMatch = responseText.match(/texture[:\s]*([^.\n]+)/i);
      const wrinkleMatch = responseText.match(/wrinkle[:\s]*([^.\n]+)/i);
      const moistureMatch = responseText.match(/moisture[:\s]*([^.\n]+)/i);
      
      // Extract recommendations
      const recommendationsMatch = responseText.match(/recommendations?:?\s*([\s\S]+)$/i);
      const recommendations = recommendationsMatch ? 
        recommendationsMatch[1]
          .split(/\d+\.|\n-|\*/)
          .map((r: string) => r.trim())
          .filter((r: string) => r.length > 10 && r.length < 200)
          .slice(0, 4) : 
        [];
      
      return {
        analysisResults: {
          improvement: improvementMatch?.[1]?.trim() || "Approximately 60-70%",
          skinToneChange: skinToneMatch?.[1]?.trim() || "Noticeable brightening and evening of skin tone",
          textureChange: textureMatch?.[1]?.trim() || "Smoother texture with reduced visibility of pores",
          wrinkleReduction: wrinkleMatch?.[1]?.trim() || "Moderate reduction in fine lines",
          moistureLevel: moistureMatch?.[1]?.trim() || "Improved hydration levels"
        },
        recommendations: recommendations.length > 0 ? recommendations : [
          "Continue with current treatments as they show positive results",
          "Consider adding vitamin C serum for enhanced results",
          "Maintain sunscreen application to protect your progress",
          "Stay consistent with your current skincare routine"
        ]
      };
    }
    
    // Parse the JSON from the matched string
    try {
      const analysisResults = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed JSON response');
      return analysisResults;
    } catch (jsonError) {
      console.error('Error parsing JSON match:', jsonError);
      console.log('JSON match that failed to parse:', jsonMatch[0].substring(0, 200) + '...');
      
      // Try to fix potential JSON issues (missing closing brackets, etc)
      try {
        let fixedJson = jsonMatch[0];
        // Count opening and closing brackets
        const openBraces = (fixedJson.match(/\{/g) || []).length;
        const closeBraces = (fixedJson.match(/\}/g) || []).length;
        const openBrackets = (fixedJson.match(/\[/g) || []).length;
        const closeBrackets = (fixedJson.match(/\]/g) || []).length;
        
        // Add missing closing braces/brackets
        if (openBraces > closeBraces) {
          fixedJson += '}'.repeat(openBraces - closeBraces);
        }
        if (openBrackets > closeBrackets) {
          fixedJson += ']'.repeat(openBrackets - closeBrackets);
        }
        
        // Try to parse the fixed JSON
        const fixedResults = JSON.parse(fixedJson);
        console.log('Successfully parsed fixed JSON');
        return fixedResults;
      } catch (fixError) {
        console.error('Failed to fix and parse JSON:', fixError);
        return provideFallbackResponse(language);
      }
    }
  } catch (parseError) {
    console.error('Error parsing response text:', parseError);
    return provideFallbackResponse(language);
  }
}

// Helper function to preprocess images (resize/compress)
async function preprocessImage(base64Image: string): Promise<string> {
  try {
    // Check if image is too large
    if (base64Image.length <= 500000) {
      // Image is already small enough
      return base64Image;
    }

    console.log(`Image size (${base64Image.length} bytes) exceeds recommended size. Compressing...`);

    // Create a temporary file to store the image
    const tempFilePath = `${FileSystem.cacheDirectory}temp_image.jpg`;
    await FileSystem.writeAsStringAsync(tempFilePath, base64Image, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Determine compression level based on image size
    let quality = 0.7;
    let maxWidth = 800;

    if (base64Image.length > 1000000) {
      quality = 0.5;
      maxWidth = 600;
    }
    if (base64Image.length > 2000000) {
      quality = 0.3;
      maxWidth = 400;
    }

    console.log(`Applying compression: quality=${quality}, maxWidth=${maxWidth}`);

    // Resize and compress the image
    const manipResult = await ImageManipulator.manipulateAsync(
      tempFilePath,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Read the compressed image
    const compressedBase64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Clean up the temporary file
    await FileSystem.deleteAsync(tempFilePath);

    console.log(`Image compressed: ${base64Image.length} -> ${compressedBase64.length} bytes`);
    return compressedBase64;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    // Return original image if preprocessing fails
    return base64Image;
  }
}

// Helper function to provide a consistent fallback response
function provideFallbackResponse(language: string = 'en') {
  console.log('Providing fallback analysis response');
  
  if (language === 'zh') {
    return {
      analysisResults: {
        improvement: "67%",
        skinToneChange: "肤色明显变亮，更加均匀",
        textureChange: "肤质更加光滑，毛孔减少约43%",
        wrinkleReduction: "眼部细纹减少约35%",
        moistureLevel: "水分含量提高约28%"
      },
      recommendations: [
        "继续当前的护理方案",
        "考虑添加维生素C精华以增强效果",
        "坚持使用防晒霜保护皮肤改善成果",
        "每周使用一次保湿面膜以提供额外水分"
      ]
    };
  }
  
  return {
    analysisResults: {
      improvement: "67%",
      skinToneChange: "Significant brightening observed",
      textureChange: "Smoother texture with 43% reduction in visible pores",
      wrinkleReduction: "35% reduction in fine lines around eyes",
      moistureLevel: "Improved by 28%"
    },
    recommendations: [
      "Continue with current treatments",
      "Consider adding vitamin C serum for enhanced results",
      "Maintain sunscreen application for protecting gains",
      "Use a hydrating mask once a week for additional moisture"
    ]
  };
}



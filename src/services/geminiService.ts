// Import necessary modules
// Gemini API integration for facial analysis
import { getApiKey, GEMINI_VISION_API, FALLBACK_API_KEY, GEMINI_API, API_TIMEOUT } from '../config/api';
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/localizationContext';
import { SkincareRecommendation } from '../types';
import { getFacialAnalysisPrompt, getProductRecommendationsPrompt, generateTreatmentsList, getEyeAreaAnalysisPrompt, getHairScalpAnalysisPrompt } from './promptTemplates';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { TREATMENTS } from '../constants/treatments';
import { SkincareProduct, SKINCARE_PRODUCTS } from '../constants/skincareProducts';
import { HairScalpAnalysisResult, HaircareRecommendationsResult } from '../types/hairScalpAnalysis';

const DEFAULT_MAX_OUTPUT_TOKENS = 8192;

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
export const analyzeFacialImage = async (imageUri: string, visitPurpose?: string, appointmentLength?: string, skinType: string = 'all') => {
  let base64Image = '';
  if (imageUri.startsWith('file://')) {
    base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else {
    base64Image = imageUri;
  }

  // Ensure base64 string does not contain the data URI prefix
  const prefixMatchFacial = /^data:image\/(jpeg|png);base64,/.exec(base64Image);
  if (prefixMatchFacial) {
    base64Image = base64Image.substring(prefixMatchFacial[0].length);
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
                text: getFacialAnalysisPrompt(currentLanguage, treatmentsList, visitPurpose, appointmentLength, skinType)
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
          max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
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
 * Analyzes eye area in an image and returns recommendations
 * @param base64Image - Base64 encoded image string
 * @param visitPurpose - Optional purpose of the visit
 * @param appointmentLength - Optional appointment length
 * @returns Analysis results including eye area conditions and treatment recommendations
 */
export const analyzeEyeArea = async (imageUri: string, visitPurpose?: string, appointmentLength?: string, skinType: string = 'all') => {
  let base64Image = '';
  if (imageUri.startsWith('file://')) {
    base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else {
    base64Image = imageUri;
  }

  // Ensure base64 string does not contain the data URI prefix
  const prefixMatchEye = /^data:image\/(jpeg|png);base64,/.exec(base64Image);
  if (prefixMatchEye) {
    base64Image = base64Image.substring(prefixMatchEye[0].length);
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
  const MAX_RETRIES = Math.min(2, Platform.OS === 'ios' && Platform.isPad ? 2 : 1);
  const isIPad = Platform.OS === 'ios' && Platform.isPad;

  // Function for retry logic
  const executeWithRetry = async () => {
    try {
      // Get the API key from storage
      const apiKey = await getApiKey();

      // Make sure the API key is valid
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        throw new Error('Invalid or missing API key. Please enter a valid Gemini API key in the settings.');
      }

      // For iPad: process large images to reduce API issues
      let processedBase64 = base64Image;
      if (isIPad) {
        try {
          processedBase64 = await preprocessImage(base64Image);
        } catch (compressionError) {
          console.error('Error during image compression:', compressionError);
          throw compressionError;
        }
      }

      // Clean the base64 string
      processedBase64 = processedBase64.replace(/[\r\n\t]/g, '').trim();

      // Get the mime type
      const mimeType = getImageMimeType(processedBase64);

      // Generate the treatments list
      const treatmentsList = generateTreatmentsList(TREATMENTS);

      // Prepare the request body for Gemini
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: getEyeAreaAnalysisPrompt(currentLanguage, treatmentsList, visitPurpose, appointmentLength, skinType)
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
          max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
          response_mime_type: "application/json",
          top_p: 0.8,
          top_k: 40
        }
      };

      // Make the API call
      const apiUrl = `${GEMINI_VISION_API}?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT + (isIPad ? 5000 : 0));

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          logAPIResponse('Eye Area Analysis', response.status, errorText);
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();
        
        if (!responseData.candidates || responseData.candidates.length === 0) {
          throw new Error('No response candidates returned from API');
        }

        const textResponse = responseData.candidates[0].content.parts[0].text;
        console.log("Attempting to parse textResponse:", textResponse); // Log the response before parsing
        // Attempt to parse directly, assuming valid JSON based on user confirmation
        return JSON.parse(textResponse);
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('API request timed out. Please try again with a smaller image or better connection.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error in eye area analysis:', error);
      
      // Handle iPad-specific errors
      if (isIPad && error instanceof Error && (
        error.message.includes('iPad') ||
        error.message.includes('timeout') ||
        error.message.includes('large') ||
        error.message.includes('too large') ||
        error.message.includes('reduce')
      )) {
        throw new Error(`iPad compatibility issue: ${error.message}`);
      }
      
      // Handle quota errors
      if (error instanceof Error && error.message.includes('quota')) {
        throw new Error('API_QUOTA_EXCEEDED: You have reached your API quota limit.');
      }
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying eye area analysis (${retryCount}/${MAX_RETRIES})...`);
        return executeWithRetry();
      }
      
      throw error;
    }
  };

  return executeWithRetry();
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

// getGeminiProductRecommendations has been removed - product recommendations 
// should come directly from initial analysis calls

/**
 * Function to find products by ID from the local database
 * Used to look up products recommended by Gemini
 */
export const findProductById = (productId: string): SkincareProduct | undefined => {
  return SKINCARE_PRODUCTS.find(product => product.id === productId);
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
6. IMPORTANT: Identify 2-4 specific facial areas with visible treatment improvements

Format your response in JSON with these sections and fields:
{
  "analysisResults": {
    "improvement": string (percentage or descriptor),
    "skinToneChange": string (detailed observation),
    "textureChange": string (detailed observation),
    "wrinkleReduction": string (detailed observation),
    "moistureLevel": string (detailed observation)
  },
  "improvementAreas": [
    {
      "area": string (facial region name like "forehead", "cheeks", "under eyes", etc.),
      "description": string (detailed description of improvement in this area),
      "coordinates": {
        "x": number (approximate horizontal position as percentage of image width, 0-100),
        "y": number (approximate vertical position as percentage of image height, 0-100),
        "radius": number (approximate size of the area as percentage of image width, 5-20)
      }
    }
  ],
  "recommendations": [
    string (3-4 personalized recommendations)
  ]
}

INSTRUCTIONS FOR IMPROVEMENT AREAS:
- You MUST include the "improvementAreas" array with 2-4 entries
- The "coordinates" object is REQUIRED for each area
- "x" and "y" should be numbers between 0-100 representing percentage positions
- "radius" should be a number between 5-20 representing the percentage size
- Each area should have a clear "description" of what improved in that area

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
        maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
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
        maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
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
    
    // ADDED: Log the full text content for debugging
    const fullTextContent = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('COMPLETE RESPONSE TEXT:');
    console.log(fullTextContent);
    
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
    
    // Look for JSON pattern in the response text - use less greedy regex
    // This first tries to find { ... } that has valid JSON content
    const jsonRegexPatterns = [
      /\{(?:[^{}]|"[^"]*"|\{(?:[^{}]|"[^"]*")*\})*\}/g, // Less greedy pattern to find potential JSON objects
      /\{[\s\S]*\}/g // Fallback to more greedy pattern
    ];
    
    let jsonMatch = null;
    let validJson: any = null;
    // jsonMatch is not used by the primary parsing logic anymore.
    // bestMatchString is also not strictly needed if direct parse is prioritized.

    // 1. Attempt to parse the entire responseText directly
    try {
      // Clean potential markdown backticks before parsing
      const cleanedResponseText = responseText.replace(/^```json\s*|```\s*$/g, '').trim();
      if (cleanedResponseText) { // Ensure not trying to parse an empty string after cleaning
        const parsedDirectly = JSON.parse(cleanedResponseText);
        if (parsedDirectly && typeof parsedDirectly === 'object') {
          validJson = parsedDirectly;
          // console.log('Successfully parsed entire responseText directly.'); // DEBUG
          // console.log('Parsed validJson object (direct parse):', JSON.stringify(validJson, null, 2)); // DEBUG
        }
      } else {
        // console.log('Response text was empty after cleaning markdown, skipping direct parse.'); // DEBUG
      }
    } catch (e) {
      // console.log('Direct parse of entire responseText failed. Will attempt regex matching.', e); // DEBUG
    }

    // 2. If direct parse failed, attempt regex-based search
    if (!validJson) {
      // console.log('Attempting regex-based JSON extraction...'); // DEBUG
      for (const regexPattern of jsonRegexPatterns) {
        const matches = responseText.matchAll(regexPattern);
        let potentialValidJsons: { jsonObject: object, stringValue: string }[] = [];
        
        for (const match of matches) {
          try {
            const possibleJsonString = match[0];
            const possibleJson = JSON.parse(possibleJsonString);
            if (possibleJson && typeof possibleJson === 'object') {
              potentialValidJsons.push({ jsonObject: possibleJson, stringValue: possibleJsonString });
            }
          } catch (regexParseError) {
            // This specific regex match isn't valid JSON, continue
            continue;
          }
        }

        if (potentialValidJsons.length > 0) {
          // Select the longest valid JSON string as the most likely candidate
          potentialValidJsons.sort((a, b) => b.stringValue.length - a.stringValue.length);
          validJson = potentialValidJsons[0].jsonObject;
          // bestMatchString = potentialValidJsons[0].stringValue; // Keep if needed for logging
          // console.log('Selected best valid JSON via regex from response'); // DEBUG
          // console.log('Best parsed validJson object (regex):', JSON.stringify(validJson, null, 2)); // DEBUG
          break; // Found a good candidate with this regex pattern
        }
      }
    }
    
    // If direct parsing or regex parsing worked, validate and return
    if (validJson) {
      return ensureRequiredFields(validJson, language);
    }
    
    // 3. If no valid JSON found by direct parse or regex, try fixing the original responseText
    if (!validJson) { // Ensure this block only runs if validJson is still null
      // console.log('No parseable JSON found by direct or regex methods, attempting to fix original responseText'); // DEBUG
      let jsonString: string = responseText; // Initialize with the original responseText for fixing
        
      // Clean up any control characters or non-printable characters
        jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        
        // Count opening and closing braces/brackets
        const openBraces = (jsonString.match(/\{/g) || []).length;
        const closeBraces = (jsonString.match(/\}/g) || []).length;
        const openBrackets = (jsonString.match(/\[/g) || []).length;
        const closeBrackets = (jsonString.match(/\]/g) || []).length;
        
        // Balance braces and brackets
        if (openBraces > closeBraces) {
          jsonString += '}'.repeat(openBraces - closeBraces);
        }
        if (openBrackets > closeBrackets) {
          jsonString += ']'.repeat(openBrackets - closeBrackets);
        }
        
        // Fix other common JSON syntax errors
        jsonString = jsonString
          .replace(/,\s*[\}\]]/g, '$&') // Fix trailing commas
          .replace(/\]\s*\{/g, '],[{') // Fix missing commas between array items
          .replace(/\}\s*\{/g, '},{') // Fix missing commas between objects
          .replace(/([,\{\[]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Add quotes to unquoted keys
          .replace(/:(\s*)([^",\{\[\]\s][^,\{\[\]\s]*)([\s,\}\]])/g, ':"$2"$3'); // Add quotes to unquoted values
          
          // console.log('Attempting to parse fixed jsonString:', jsonString); // DEBUG
          try {
          // Parse the fixed JSON
          const analysisResults = JSON.parse(jsonString);
          console.log('Successfully parsed JSON after fixes');
          return ensureRequiredFields(analysisResults, language);
        } catch (jsonError) {
          console.error('Error parsing fixed JSON:', jsonError);
          
          // Try a more aggressive fix as a last resort
          try {
            // Convert problematic } to escaped form if they appear in values
            const furtherFixedJson = jsonString.replace(/(?<=[^\\]"[^"]*)}(?=[^"]*")/g, '\\}');
            // console.log('Attempting to parse furtherFixedJson:', furtherFixedJson); // DEBUG
            const lastResults = JSON.parse(furtherFixedJson);
            console.log('Successfully parsed JSON with aggressive fixes');
            return ensureRequiredFields(lastResults, language);
          } catch (lastError) {
            console.error('All JSON parsing attempts failed:', lastError);
            return provideFallbackResponse(language);
          }
        }
    } // This closes the `if (!validJson)` block for step 3.
    
    // This is the ultimate fallback if all prior attempts (direct, regex, fixing) failed.
    console.warn('No JSON structure found in response after all attempts, falling back');
    return provideFallbackResponse(language);
  } catch (parseError) {
    console.error('Error parsing response text:', parseError);
    return provideFallbackResponse(language);
  }
}

// Helper function to ensure all required fields exist with fallbacks if needed
function ensureRequiredFields(analysisResults: any, language: string = 'en') {
  // Ensure analysisResults field exists
  if (!analysisResults.analysisResults) {
    console.warn('Parsed JSON is missing analysisResults object');
    
    // Add fallback analysis results based on language
    analysisResults.analysisResults = language === 'zh' ? {
      improvement: "约67% [FALLBACK]",
      skinToneChange: "肤色明显变亮，更加均匀 [FALLBACK]",
      textureChange: "肤质更加光滑，毛孔减少约43% [FALLBACK]",
      wrinkleReduction: "眼部细纹减少约35% [FALLBACK]",
      moistureLevel: "水分含量提高约28% [FALLBACK]"
    } : {
      improvement: "67% [FALLBACK]",
      skinToneChange: "Significant brightening observed [FALLBACK]",
      textureChange: "Smoother texture with 43% reduction in visible pores [FALLBACK]",
      wrinkleReduction: "35% reduction in fine lines around eyes [FALLBACK]",
      moistureLevel: "Improved by 28% [FALLBACK]"
    };
  }

  // Check if improvementAreas exists and has the correct format
  if (!analysisResults.improvementAreas || !Array.isArray(analysisResults.improvementAreas) || analysisResults.improvementAreas.length === 0) {
    console.warn('Parsed JSON is missing improvementAreas array or it is empty');
    
    // Add fallback improvement areas based on language
    analysisResults.improvementAreas = language === 'zh' ? [
      {
        area: "眼部周围 [FALLBACK]",
        description: "细纹明显减少，皮肤更加紧致 [FALLBACK]",
        coordinates: {
          x: 50,
          y: 40,
          radius: 12
        }
      },
      {
        area: "T区 [FALLBACK]",
        description: "毛孔缩小，油光减少 [FALLBACK]",
        coordinates: {
          x: 50,
          y: 30,
          radius: 15
        }
      }
    ] : [
      {
        area: "Around eyes [FALLBACK]",
        description: "Noticeable reduction in fine lines and increased firmness",
        coordinates: {
          x: 50,
          y: 40,
          radius: 12
        }
      },
      {
        area: "Cheeks [FALLBACK]",
        description: "Improved skin tone and texture",
        coordinates: {
          x: 30,
          y: 50,
          radius: 15
        }
      }
    ];
  }
  
  // Check if recommendations exist and add fallbacks if needed
  if (!analysisResults.recommendations || !Array.isArray(analysisResults.recommendations) || analysisResults.recommendations.length === 0) {
    console.warn('Parsed JSON is missing recommendations array or it is empty');
    
    // Add fallback recommendations based on language
    analysisResults.recommendations = language === 'zh' ? [
      "继续当前的护理方案 [FALLBACK]",
      "考虑添加维生素C精华以增强效果 [FALLBACK]",
      "坚持使用防晒霜保护皮肤改善成果 [FALLBACK]",
      "每周使用一次保湿面膜以提供额外水分 [FALLBACK]"
    ] : [
      "Continue with current treatments [FALLBACK]",
      "Consider adding vitamin C serum for enhanced results [FALLBACK]",
      "Maintain sunscreen application for best results [FALLBACK]",
      "Use a hydrating mask once a week for additional moisture [FALLBACK]"
    ];
  }
  
  return analysisResults;
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
        improvement: "67% [FALLBACK]",
        skinToneChange: "肤色明显变亮，更加均匀 [FALLBACK]",
        textureChange: "肤质更加光滑，毛孔减少约43% [FALLBACK]",
        wrinkleReduction: "眼部细纹减少约35% [FALLBACK]",
        moistureLevel: "水分含量提高约28% [FALLBACK]"
      },
      improvementAreas: [
        {
          area: "眼部周围 [FALLBACK]",
          description: "细纹明显减少，皮肤更加紧致 [FALLBACK]",
          coordinates: {
            x: 50,
            y: 40,
            radius: 12
          }
        },
        {
          area: "T区 [FALLBACK]",
          description: "毛孔缩小，油光减少 [FALLBACK]",
          coordinates: {
            x: 50,
            y: 30,
            radius: 15
          }
        },
        {
          area: "颧骨区域 [FALLBACK]",
          description: "肤色更均匀，红斑减少 [FALLBACK]",
          coordinates: {
            x: 30,
            y: 50,
            radius: 10
          }
        }
      ],
      recommendations: [
        "继续当前的护理方案 [FALLBACK]",
        "考虑添加维生素C精华以增强效果 [FALLBACK]",
        "坚持使用防晒霜保护皮肤改善成果 [FALLBACK]",
        "每周使用一次保湿面膜以提供额外水分 [FALLBACK]"
      ]
    };
  }
  
  return {
    analysisResults: {
      improvement: "67% [FALLBACK]",
      skinToneChange: "Significant brightening observed [FALLBACK]",
      textureChange: "Smoother texture with 43% reduction in visible pores [FALLBACK]",
      wrinkleReduction: "35% reduction in fine lines around eyes [FALLBACK]",
      moistureLevel: "Improved by 28% [FALLBACK]"
    },
    improvementAreas: [
      {
        area: "Around eyes [FALLBACK]",
        description: "Noticeable reduction in fine lines and increased firmness [FALLBACK]",
        coordinates: {
          x: 50,
          y: 40,
          radius: 12
        }
      },
      {
        area: "T-zone [FALLBACK]",
        description: "Reduced pore size and oil production [FALLBACK]",
        coordinates: {
          x: 50,
          y: 30,
          radius: 15
        }
      },
      {
        area: "Cheek area [FALLBACK]",
        description: "More even skin tone with reduced redness [FALLBACK]",
        coordinates: {
          x: 30,
          y: 50,
          radius: 10
        }
      }
    ],
    recommendations: [
      "Continue with current treatments [FALLBACK]",
      "Consider adding vitamin C serum for enhanced results [FALLBACK]",
      "Maintain sunscreen application for protecting gains [FALLBACK]",
      "Use a hydrating mask once a week for additional moisture [FALLBACK]"
    ]
  };
}

/**
 * Analyze hair and scalp images using Gemini API
 * @param imageUris - Array of image URIs (multi-angle)
 * @param visitPurpose - Optional purpose of the visit
 * @param language - UI language
 * @returns HairScalpAnalysisResult
 */
export const analyzeHairScalpImages = async (
  imageUris: string[],
  visitPurpose?: string,
  language: string = 'en'
): Promise<HairScalpAnalysisResult> => {
  const apiKey = await getApiKey();
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    throw new Error('Invalid or missing Gemini API key. Please enter a valid Gemini API key in the settings.');
  }
  
  console.log(`Analyzing hair and scalp images in language: ${language}`);

  // Convert all images to base64
  const base64Images: string[] = [];
  for (const uri of imageUris) {
    let base64: string;
    if (uri.startsWith('file://')) {
      base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    } else {
      base64 = uri; // Assume it's already a base64 string or data URI
    }

    // Ensure base64 string does not contain the data URI prefix
    const prefixMatchHair = /^data:image\/(jpeg|png);base64,/.exec(base64);
    if (prefixMatchHair) {
      base64 = base64.substring(prefixMatchHair[0].length);
    }
    base64Images.push(base64);
  }

  // Compose the prompt
  const prompt = getHairScalpAnalysisPrompt(language, visitPurpose);

  // Prepare Gemini API request (multi-image)
  const contents = [
    {
      role: 'user',
      parts: [
        ...base64Images.map((img, idx) => ({ inline_data: { mime_type: 'image/jpeg', data: img } })),
        { text: prompt }
      ]
    }
  ];

  const apiUrl = `${GEMINI_VISION_API}?key=${apiKey}`;

  try {
    const response = await axios.post(apiUrl, { contents }, { timeout: API_TIMEOUT });
    logAPIResponse('analyzeHairScalpImages', response.status, response.statusText);
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response from Gemini API');
    // Robust JSON extraction
    const result = extractValidJson(text);
    if (!result) {
      console.error('Raw Gemini response (hair/scalp):', text);
      throw new Error('The analysis result could not be processed. Please try again or use different images.');
    }
    // Get current date in YYYY-MM-DD format
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // Add or overwrite the assessmentDate in the result
    const resultWithDate = {
      ...result,
      assessmentDate: formattedDate,
    };

    return resultWithDate;
  } catch (error: any) {
    logNetworkError('analyzeHairScalpImages', error);
    throw new Error(error?.message || 'Failed to analyze hair/scalp images');
  }
};

// Helper: Extract and parse the first valid JSON object from a string
function extractValidJson(text: string): any | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let jsonStr = match[0];
  // Fix common truncation issues
  const openBraces = (jsonStr.match(/\{/g) || []).length;
  const closeBraces = (jsonStr.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    jsonStr += '}'.repeat(openBraces - closeBraces);
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

/**
 * Fallback function to extract or create haircare recommendations from analysis results
 * Note: This function is maintained for compatibility with existing code.
 * New code should use analyzeHairScalpImages which includes recommendations in the initial response.
 */
export const getHaircareRecommendations = async (
  analysisResult: HairScalpAnalysisResult,
  language: string = 'en'
): Promise<HaircareRecommendationsResult> => {
  console.log(`Using fallback function to extract/create haircare recommendations`);
  
  // Return existing haircareRecommendations if available in the analysis result
  if (analysisResult.haircareRecommendations && analysisResult.haircareRecommendations.length > 0) {
    return {
      recommendations: analysisResult.haircareRecommendations,
      overallRecommendation: analysisResult.overallHaircareRecommendation || '',
      careRoutine: analysisResult.careRoutine || '',
      notes: analysisResult.notes || ''
    };
  }
  
  // Otherwise, create a fallback response based on the analysis
  return {
    recommendations: [
      {
        productType: language === 'zh' ? '药用洗发水' : 'Medicated Shampoo',
        recommendedIngredients: language === 'zh' ? '酮康唑，水杨酸，煤焦油' : 'Ketoconazole, Salicylic Acid, Coal Tar',
        recommendedUsage: language === 'zh' ? '每周使用2-3次，使其在头皮上停留3-5分钟后冲洗。' : 'Use 2-3 times per week, allowing it to sit on the scalp for 3-5 minutes before rinsing.',
        reason: language === 'zh' ? '基于您的头皮状况和诊断结果推荐。' : 'Recommended based on your scalp condition and diagnosis.',
        targetConcerns: language === 'zh' ? ['头皮屑', '发痒', '炎症'] : ['Dandruff', 'Itching', 'Inflammation'],
        precautions: language === 'zh' ? '如果出现刺激，请停止使用。' : 'Discontinue use if irritation occurs.'
      },
      {
        productType: language === 'zh' ? '滋养护发素' : 'Nourishing Conditioner',
        recommendedIngredients: language === 'zh' ? '泛醇，蛋白质，生物素，芦荟' : 'Panthenol, Proteins, Biotin, Aloe Vera',
        recommendedUsage: language === 'zh' ? '每次洗发后使用，重点放在发梢，避开头皮。' : 'Use after each shampoo, focusing on the ends and avoiding the scalp.',
        reason: language === 'zh' ? '改善头发质地和保湿。' : 'Improves hair texture and hydration.',
        targetConcerns: language === 'zh' ? ['干燥', '易断', '缺乏光泽'] : ['Dryness', 'Breakage', 'Lack of Shine'],
        precautions: ''
      }
    ],
    overallRecommendation: language === 'zh' 
      ? '遵循温和的头发护理方案，专注于头皮健康和保持水分平衡。' 
      : 'Follow a gentle hair care regimen focused on scalp health and maintaining moisture balance.',
    careRoutine: language === 'zh'
      ? '每周洗发2-3次，使用推荐的产品并避免过热造型。多喝水并考虑添加生物素补充剂。'
      : 'Wash hair 2-3 times weekly using recommended products and avoid excessive heat styling. Stay hydrated and consider biotin supplements.',
    notes: language === 'zh'
      ? '这些建议基于头发分析。严重或持续问题请咨询皮肤科医生。'
      : 'These recommendations are based on your hair analysis. Consult a dermatologist for severe or persistent issues.'
  };
};


/**
 * Simple encryption/decryption utilities for API keys
 * Note: This is a basic implementation for demonstration purposes
 * For production, consider using more robust encryption libraries
 */
import { Platform } from 'react-native';

// The salt/key used for encryption (in a real app, store this more securely)
const ENCRYPTION_KEY = 'AIBeautyLens_SecureKey_2024';

/**
 * Base64 encoding and decoding utility functions for React Native
 * Using a pure JS implementation for cross-platform compatibility
 */
const base64 = {
  encode: (str: string): string => {
    try {
      // Convert string to UTF8 array
      const utf8 = [];
      for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6), 
                    0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12), 
                    0x80 | ((charcode>>6) & 0x3f), 
                    0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18), 
                    0x80 | ((charcode>>12) & 0x3f), 
                    0x80 | ((charcode>>6) & 0x3f), 
                    0x80 | (charcode & 0x3f));
        }
      }

      // Base64 encoding
      const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      for (let i = 0; i < utf8.length; i += 3) {
        const triplet = (utf8[i] << 16) | (utf8[i + 1] << 8) | utf8[i + 2];
        for (let j = 0; j < 4; j++) {
          if (i * 8 + j * 6 > utf8.length * 8) result += '=';
          else result += b64chars.charAt((triplet >>> (6 * (3 - j))) & 0x3F);
        }
      }
      return result;
    } catch (error) {
      console.error('Base64 encoding error:', error);
      return '';
    }
  },
  
  decode: (str: string): string => {
    try {
      // Base64 decoding
      const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      str = str.replace(/=+$/, '');
      let result = '';
      
      // Convert to byte array
      const bytes = [];
      for (let i = 0; i < str.length; i += 4) {
        let decoded = 0;
        for (let j = 0; j < 4; j++) {
          if (i + j < str.length) {
            decoded += b64chars.indexOf(str.charAt(i + j)) << (18 - 6 * j);
          }
        }
        bytes.push((decoded >>> 16) & 0xFF);
        if (i + 2 < str.length) bytes.push((decoded >>> 8) & 0xFF);
        if (i + 3 < str.length) bytes.push(decoded & 0xFF);
      }
      
      // Convert UTF-8 bytes to string
      let i = 0;
      while (i < bytes.length) {
        let c = bytes[i++];
        if (c < 128) {
          result += String.fromCharCode(c);
        } else if (c > 191 && c < 224) {
          result += String.fromCharCode(((c & 31) << 6) | (bytes[i++] & 63));
        } else if (c > 239 && c < 365) {
          // Surrogate pair
          c = ((c & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
          c -= 0x10000;
          result += String.fromCharCode(0xD800 + (c >> 10), 0xDC00 + (c & 0x3FF));
        } else {
          result += String.fromCharCode(((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63));
        }
      }
      
      return result;
    } catch (error) {
      console.error('Base64 decoding error:', error);
      return '';
    }
  }
};

/**
 * Encrypts a string using a simple XOR cipher with a repeating key
 * @param text - The text to encrypt (e.g., API key)
 * @returns Encrypted string in base64 format
 */
export const encrypt = (text: string): string => {
  if (!text) return '';
  
  // Convert text to array of character codes
  const textChars = text.split('').map(char => char.charCodeAt(0));
  
  // Convert key to array of character codes
  const keyChars = ENCRYPTION_KEY.split('').map(char => char.charCodeAt(0));
  
  // XOR each character with corresponding key character
  const encryptedChars = textChars.map((char, index) => {
    const keyChar = keyChars[index % keyChars.length];
    return char ^ keyChar; // XOR operation
  });
  
  // Convert back to string and encode with base64
  const encryptedString = String.fromCharCode(...encryptedChars);
  return base64.encode(encryptedString);
};

/**
 * Decrypts a string that was encrypted with the encrypt function
 * @param encryptedText - The encrypted text in base64 format
 * @returns Decrypted string (original API key)
 */
export const decrypt = (encryptedText: string): string => {
  if (!encryptedText) return '';
  
  try {
    // Decode from base64
    const encryptedString = base64.decode(encryptedText);
    const encryptedChars = encryptedString.split('').map(char => char.charCodeAt(0));
    
    // Convert key to array of character codes
    const keyChars = ENCRYPTION_KEY.split('').map(char => char.charCodeAt(0));
    
    // XOR each character with corresponding key character (same as encryption)
    const decryptedChars = encryptedChars.map((char, index) => {
      const keyChar = keyChars[index % keyChars.length];
      return char ^ keyChar; // XOR operation
    });
    
    return String.fromCharCode(...decryptedChars);
  } catch (error) {
    console.error('Error decrypting text:', error);
    return '';
  }
};

/**
 * Obscures an API key for display purposes (shows only first/last few characters)
 * @param apiKey - The full API key
 * @returns Obscured version of the API key (e.g., "AIza...1a2b3")
 */
export const obscureApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 8) return apiKey;
  
  const firstFew = apiKey.substring(0, 4);
  const lastFew = apiKey.substring(apiKey.length - 5);
  
  return `${firstFew}...${lastFew}`;
}; 
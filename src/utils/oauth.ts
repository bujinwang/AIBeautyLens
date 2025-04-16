import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import axios from 'axios';

// Constants for OAuth2
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';

// Storage keys
export const OAUTH_ACCESS_TOKEN_KEY = 'oauth_access_token';
export const OAUTH_REFRESH_TOKEN_KEY = 'oauth_refresh_token';
export const OAUTH_TOKEN_EXPIRY_KEY = 'oauth_token_expiry';
export const OAUTH_CLIENT_ID_KEY = 'oauth_client_id';
export const OAUTH_CLIENT_SECRET_KEY = 'oauth_client_secret';

// OAuth configuration types
export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
  id_token?: string;
}

/**
 * Generate a random state parameter for OAuth2 flow
 */
export const generateState = async (): Promise<string> => {
  const randomBytes = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Math.random().toString() + Date.now().toString()
  );
  return randomBytes.substring(0, 16);
};

/**
 * Stores the OAuth client credentials
 */
export const storeOAuthCredentials = async (clientId: string, clientSecret?: string): Promise<void> => {
  await AsyncStorage.setItem(OAUTH_CLIENT_ID_KEY, clientId);
  if (clientSecret) {
    await AsyncStorage.setItem(OAUTH_CLIENT_SECRET_KEY, clientSecret);
  }
};

/**
 * Get the OAuth client credentials
 */
export const getOAuthCredentials = async (): Promise<{ clientId: string; clientSecret?: string }> => {
  try {
    // Use timeouts to prevent hanging
    const clientId = await withTimeout(AsyncStorage.getItem(OAUTH_CLIENT_ID_KEY), 2000, '') || '';
    const clientSecret = await withTimeout(AsyncStorage.getItem(OAUTH_CLIENT_SECRET_KEY), 2000, '') || undefined;
    return { clientId, clientSecret };
  } catch (error) {
    // Return empty values on timeout
    return { clientId: '', clientSecret: undefined };
  }
};

/**
 * Store access token and related data
 */
export const storeTokens = async (tokenResponse: TokenResponse): Promise<void> => {
  const expiryTime = Date.now() + tokenResponse.expires_in * 1000;

  await AsyncStorage.setItem(OAUTH_ACCESS_TOKEN_KEY, tokenResponse.access_token);
  await AsyncStorage.setItem(OAUTH_TOKEN_EXPIRY_KEY, expiryTime.toString());

  if (tokenResponse.refresh_token) {
    await AsyncStorage.setItem(OAUTH_REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
  }
};

/**
 * Clear all stored OAuth tokens
 */
export const clearTokens = async (): Promise<void> => {
  await AsyncStorage.removeItem(OAUTH_ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(OAUTH_REFRESH_TOKEN_KEY);
  await AsyncStorage.removeItem(OAUTH_TOKEN_EXPIRY_KEY);
};

/**
 * Check if we have a valid access token
 */
export const hasValidAccessToken = async (): Promise<boolean> => {
  try {
    // Use timeouts to prevent hanging
    const token = await withTimeout(AsyncStorage.getItem(OAUTH_ACCESS_TOKEN_KEY), 2000, null);
    const expiryTimeStr = await withTimeout(AsyncStorage.getItem(OAUTH_TOKEN_EXPIRY_KEY), 2000, null);

    if (!token || !expiryTimeStr) {
      return false;
    }

    const expiryTime = parseInt(expiryTimeStr);
    const currentTime = Date.now();

    // Token is valid if it exists and has not expired (with 5 min buffer)
    return currentTime < expiryTime - 5 * 60 * 1000;
  } catch (error) {
    // Don't log errors for timeouts
    return false;
  }
};

/**
 * Refresh the access token using a refresh token
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await AsyncStorage.getItem(OAUTH_REFRESH_TOKEN_KEY);
    const { clientId, clientSecret } = await getOAuthCredentials();

    if (!refreshToken || !clientId) {
      // No need to log this repeatedly
      return false;
    }

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    const response = await axios.post(GOOGLE_TOKEN_ENDPOINT, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status === 200 && response.data.access_token) {
      // Store the new access token
      await storeTokens(response.data);
      return true;
    } else {
      // Only log on actual failure, not on repeated checks
      return false;
    }
  } catch (error: any) {
    // Only log actual errors, not expected failures
    if (error?.response?.status !== 400) {
      console.error('Error refreshing access token:', error);
    }
    return false;
  }
};

// Cache for access token to prevent excessive storage access
let cachedAccessToken: string | null = null;
let lastTokenFetch = 0;
const TOKEN_CACHE_DURATION = 60000; // 1 minute cache

// Add a timeout wrapper for async operations
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    console.warn('OAuth operation timed out, using fallback value');
    return fallback;
  }
};

/**
 * Get a valid access token (refreshing if necessary)
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    // Return cached token if available and not expired
    const now = Date.now();
    if (cachedAccessToken && (now - lastTokenFetch < TOKEN_CACHE_DURATION)) {
      return cachedAccessToken;
    }

    // First check if we have OAuth credentials before proceeding (with timeout)
    const { clientId } = await withTimeout(getOAuthCredentials(), 2000, { clientId: '' });
    if (!clientId) {
      // No need to log this repeatedly
      return null;
    }

    // Check if we have a valid token (with timeout)
    const isValid = await withTimeout(hasValidAccessToken(), 2000, false);

    if (isValid) {
      const token = await withTimeout(AsyncStorage.getItem(OAUTH_ACCESS_TOKEN_KEY), 2000, null);
      // Cache the token
      cachedAccessToken = token;
      lastTokenFetch = now;
      return token;
    }

    // Check if we have a refresh token before attempting refresh (with timeout)
    const refreshToken = await withTimeout(AsyncStorage.getItem(OAUTH_REFRESH_TOKEN_KEY), 2000, null);

    // Only try to refresh if we have a refresh token
    if (refreshToken) {
      const refreshSuccessful = await refreshAccessToken();

      if (refreshSuccessful) {
        const token = await withTimeout(AsyncStorage.getItem(OAUTH_ACCESS_TOKEN_KEY), 2000, null);
        // Cache the token
        cachedAccessToken = token;
        lastTokenFetch = now;
        return token;
      }
    }

    // If we reach here, we couldn't get a valid token
    cachedAccessToken = null;
    lastTokenFetch = now;
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Create an OAuth authorization URL
 */
export const createAuthorizationUrl = async (config: OAuthConfig): Promise<string> => {
  const state = await generateState();

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
};

/**
 * Handle the OAuth redirect and exchange code for tokens
 */
export const handleOAuthRedirect = async (
  url: string,
  config: OAuthConfig
): Promise<boolean> => {
  try {
    // Extract the authorization code from the URL
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');

    if (!code) {
      console.error('No authorization code found in redirect URL');
      return false;
    }

    // Exchange the code for tokens
    const params = new URLSearchParams();
    params.append('client_id', config.clientId);
    if (config.clientSecret) {
      params.append('client_secret', config.clientSecret);
    }
    params.append('code', code);
    params.append('redirect_uri', config.redirectUri);
    params.append('grant_type', 'authorization_code');

    const response = await axios.post(GOOGLE_TOKEN_ENDPOINT, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status === 200 && response.data.access_token) {
      await storeTokens(response.data);
      console.log('Successfully obtained access token');
      return true;
    } else {
      console.error('Failed to exchange code for tokens:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error handling OAuth redirect:', error);
    return false;
  }
};

/**
 * Initiate the OAuth flow
 */
export const initiateOAuth = async (config: OAuthConfig): Promise<boolean> => {
  try {
    const authUrl = await createAuthorizationUrl(config);

    // Store client credentials for later use
    await storeOAuthCredentials(config.clientId, config.clientSecret);

    if (Platform.OS === 'web') {
      // For web, use Linking which is safe across all platforms
      await Linking.openURL(authUrl);
      return true;
    } else {
      // For mobile, use expo-web-browser
      const result = await WebBrowser.openAuthSessionAsync(authUrl, config.redirectUri);

      if (result.type === 'success' && result.url) {
        return await handleOAuthRedirect(result.url, config);
      }

      return false;
    }
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);
    return false;
  }
};

/**
 * Revoke the current access token
 */
export const revokeToken = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(OAUTH_ACCESS_TOKEN_KEY);

    if (!token) {
      await clearTokens();
      return true;
    }

    const params = new URLSearchParams();
    params.append('token', token);

    const response = await axios.post(GOOGLE_REVOKE_ENDPOINT, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status === 200) {
      await clearTokens();
      return true;
    } else {
      console.error('Failed to revoke token:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error revoking token:', error);
    return false;
  }
};
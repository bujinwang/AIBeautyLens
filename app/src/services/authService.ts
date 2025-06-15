import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ApiClient, ApiError } from './api';
import { 
  LoginCredentials, 
  RegistrationData, 
  AuthTokens, 
  User,
  ResetPasswordData,
  UpdatePasswordData,
  UpdateProfileData
} from '../types/auth';

// Constants for storage keys
const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

class AuthService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await this.apiClient.post('/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data.data;
      
      // Store tokens and user data
      await this.storeTokens({ accessToken, refreshToken });
      await this.storeUserData(user);
      
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegistrationData): Promise<User> {
    try {
      const response = await this.apiClient.post('/auth/register', data);
      const { accessToken, refreshToken, user } = response.data.data;
      
      // Store tokens and user data
      await this.storeTokens({ accessToken, refreshToken });
      await this.storeUserData(user);
      
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Registration failed. Please try again later.');
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        try {
          await this.apiClient.post('/auth/logout', {});
        } catch (error) {
          console.warn('Logout API call failed, proceeding with local logout', error);
        }
      }
    } finally {
      // Always clear local storage, even if API call fails
      await this.clearAuthData();
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  }

  /**
   * Get the current user data
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) return null;
      
      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await this.apiClient.post('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Store new tokens
      await this.storeTokens({ accessToken, refreshToken: newRefreshToken });
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearAuthData();
      return null;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: ResetPasswordData): Promise<void> {
    await this.apiClient.post('/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: UpdatePasswordData): Promise<void> {
    await this.apiClient.post('/auth/reset-password', data);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await this.apiClient.put('/auth/profile', data);
    const updatedUser = response.data.data;
    
    // Update stored user data
    await this.storeUserData(updatedUser);
    
    return updatedUser;
  }

  /**
   * Store authentication tokens securely
   */
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      // Store access token in AsyncStorage for easier access
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      
      // Store refresh token in SecureStore for better security
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
      
      // Also keep a copy in AsyncStorage as fallback
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error('Error storing auth tokens:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Store user data
   */
  private async storeUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  /**
   * Clear all authentication data
   */
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}

export default new AuthService(); 
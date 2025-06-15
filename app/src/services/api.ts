import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Treatment } from '../constants/treatmentTypes';

// Error types
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  UNAUTHORIZED = 'unauthorized',
  BAD_REQUEST = 'bad_request',
  NOT_FOUND = 'not_found',
  FORBIDDEN = 'forbidden',
  UNKNOWN = 'unknown',
}

// Custom error class
export class ApiError extends Error {
  type: ErrorType;
  status?: number;
  data?: any;
  
  constructor(message: string, type: ErrorType, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.data = data;
  }
}

// API response interface
export interface ApiResponse<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  data: T;
  message?: string;
}

// Configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 180000; // 3 minutes - increased from 60 seconds to handle complex image processing

class ApiClient {
  private api: AxiosInstance;
  private authTokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    // Create axios instance
    this.api = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform': Platform.OS,
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Add authorization header if token exists
        const token = await AsyncStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Log requests in development
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, 
            config.params || config.data || {});
        }
        
        return config;
      },
      (error) => {
        if (__DEV__) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        // Log responses in development
        if (__DEV__) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, 
            response.status, response.data);
        }
        
        return response;
      },
      async (error: AxiosError) => {
        // Log errors in development
        if (__DEV__) {
          console.error('❌ API Error:', error);
        }
        
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Only try to refresh token if we're not already doing so
          if (!this.authTokenRefreshPromise) {
            this.authTokenRefreshPromise = this.refreshAuthToken();
          }
          
          try {
            // Wait for token refresh
            const newToken = await this.authTokenRefreshPromise;
            
            // Update original request with new token
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            
            // Retry the request
            originalRequest._retry = true;
            return this.api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear token and throw error
            await AsyncStorage.removeItem('auth_token');
            return Promise.reject(this.normalizeError(error));
          } finally {
            this.authTokenRefreshPromise = null;
          }
        }
        
        // For other errors, normalize and reject
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  // Token refresh logic
  private async refreshAuthToken(): Promise<string> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await this.api.post('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Store new tokens
      await AsyncStorage.setItem('auth_token', accessToken);
      await AsyncStorage.setItem('refresh_token', newRefreshToken);
      
      return accessToken;
    } catch (error) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      throw error;
    }
  }

  // Convert axios errors to our ApiError format
  private normalizeError(error: AxiosError): ApiError {
    let type = ErrorType.UNKNOWN;
    let message = 'An unexpected error occurred';
    let status: number | undefined;
    let data: any;
    
    if (error.response) {
      // Server responded with an error status
      status = error.response.status;
      data = error.response.data;
      
      // Try to extract message from response data
      if (data && typeof data === 'object' && 'message' in data) {
        message = Array.isArray(data.message) 
          ? data.message.join(', ') 
          : String(data.message);
      } else {
        message = `Server error: ${status}`;
      }
      
      // Determine error type based on status
      switch (status) {
        case 400:
          type = ErrorType.BAD_REQUEST;
          break;
        case 401:
          type = ErrorType.UNAUTHORIZED;
          break;
        case 403:
          type = ErrorType.FORBIDDEN;
          break;
        case 404:
          type = ErrorType.NOT_FOUND;
          break;
        default:
          if (status >= 500) {
            type = ErrorType.SERVER;
          }
      }
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED') {
        type = ErrorType.TIMEOUT;
        message = 'Request timed out';
      } else {
        type = ErrorType.NETWORK;
        message = 'Network error, please check your connection';
      }
    }
    
    return new ApiError(message, type, status, data);
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.request<ApiResponse<T>>(config);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // HTTP methods
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'GET',
      url,
      params,
    });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data,
    });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'PUT',
      url,
      data,
    });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'PATCH',
      url,
      data,
    });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'DELETE',
      url,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export const getTreatments = async (): Promise<Treatment[]> => {
  // Fetch from /treatment-types
  const response = await apiClient.get<any[]>('/treatment-types');
  // Map backend fields to frontend Treatment type
  return response.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    category: item.category || '', // If backend adds category
    area: item.area || '',         // If backend adds area
    price: item.price || 0,        // If backend adds price
    contraindications: item.contraindications || [], // If backend adds contraindications
    restrictions: item.restrictions || undefined,    // If backend adds restrictions
  }));
}; 
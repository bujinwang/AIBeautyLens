import { useState, useCallback, useEffect } from 'react';
import { apiClient, ApiError, ErrorType } from '../services/api';
import { useError } from '../contexts/ErrorContext';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface ApiOptions {
  handleErrors?: boolean;
  skipInitialFetch?: boolean;
  autoRetry?: boolean;
  retryCount?: number;
  retryDelay?: number; // in ms
}

type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Custom hook to handle API requests with loading state, error handling, and automatic retries
 * @param method - HTTP method (get, post, put, patch, delete)
 * @param url - API endpoint
 * @param defaultData - Default data
 * @param options - Additional options for API handling
 */
export function useApi<T = any, P = any>(
  method: ApiMethod,
  url: string,
  defaultData: T | null = null,
  options: ApiOptions = {}
) {
  const {
    handleErrors = true,
    skipInitialFetch = false,
    autoRetry = false,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  // Get error handling from context
  const { captureError } = useError();

  // Internal state
  const [state, setState] = useState<ApiState<T>>({
    data: defaultData,
    loading: !skipInitialFetch,
    error: null,
  });

  // Track retry attempts
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [shouldRetry, setShouldRetry] = useState(false);

  // Execute the API request
  const execute = useCallback(
    async (payload?: P): Promise<T | null> => {
      // Update loading state
      setState((prevState) => ({
        ...prevState,
        loading: true,
        error: null,
      }));

      try {
        // Execute appropriate API method
        let response: T;
        switch (method) {
          case 'get':
            response = await apiClient.get<T>(url, payload);
            break;
          case 'post':
            response = await apiClient.post<T>(url, payload);
            break;
          case 'put':
            response = await apiClient.put<T>(url, payload);
            break;
          case 'patch':
            response = await apiClient.patch<T>(url, payload);
            break;
          case 'delete':
            response = await apiClient.delete<T>(url);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        // Update state with successful response
        setState({
          data: response,
          loading: false,
          error: null,
        });

        // Reset retry attempts on success
        setRetryAttempts(0);
        setShouldRetry(false);

        return response;
      } catch (error) {
        // Handle and normalize error
        const apiError = error instanceof ApiError ? error : new ApiError(
          error instanceof Error ? error.message : 'Unknown error',
          ErrorType.UNKNOWN
        );

        // Update state with error
        setState({
          data: null,
          loading: false,
          error: apiError,
        });

        // Handle automatic retries if enabled
        if (autoRetry && retryAttempts < retryCount) {
          setRetryAttempts((prev) => prev + 1);
          setShouldRetry(true);
        } else {
          // Capture error for global handling if enabled
          if (handleErrors) {
            captureError(apiError);
          }
        }

        return null;
      }
    },
    [method, url, handleErrors, captureError, autoRetry, retryCount, retryAttempts]
  );

  // Handle automatic retries
  useEffect(() => {
    let retryTimer: NodeJS.Timeout;
    
    if (shouldRetry) {
      retryTimer = setTimeout(() => {
        execute();
        setShouldRetry(false);
      }, retryDelay * Math.pow(2, retryAttempts - 1)); // Exponential backoff
    }
    
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [shouldRetry, retryAttempts, retryDelay, execute]);

  // Fetch data on initial render if needed
  useEffect(() => {
    if (!skipInitialFetch) {
      execute();
    }
  }, [skipInitialFetch, execute]);

  return {
    ...state,
    execute,
    retry: () => {
      setRetryAttempts(0);
      return execute();
    },
  };
} 
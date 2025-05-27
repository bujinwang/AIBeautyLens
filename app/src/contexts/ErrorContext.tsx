import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import ErrorToast from '../components/ErrorToast';
import { ApiError, ErrorType } from '../services/api';

interface ErrorContextState {
  showError: (message: string, type?: ErrorType | 'success' | 'warning') => void;
  captureError: (error: Error) => void;
  clearErrors: () => void;
}

interface ErrorData {
  id: string;
  message: string;
  type: ErrorType | 'success' | 'warning';
  timestamp: Date;
}

const ErrorContext = createContext<ErrorContextState | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorData[]>([]);

  // Add an error to the queue
  const showError = (message: string, type: ErrorType | 'success' | 'warning' = ErrorType.UNKNOWN) => {
    const newError: ErrorData = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };

    // Add error to queue
    setErrors((prevErrors) => [...prevErrors, newError]);

    // Log error in development
    if (__DEV__) {
      console.log(`[ErrorContext] ${type}: ${message}`);
    }
  };

  // Capture and process an Error instance
  const captureError = (error: Error) => {
    // Log to console in development
    if (__DEV__) {
      console.error('[ErrorContext] Captured error:', error);
    }

    // Format error message based on error type
    let message = error.message || 'An unexpected error occurred';
    let type = ErrorType.UNKNOWN;

    // Handle ApiError specifically
    if (error instanceof ApiError) {
      type = error.type;

      // For validation errors, format the message better
      if (type === ErrorType.BAD_REQUEST && error.data?.message && Array.isArray(error.data.message)) {
        message = error.data.message.join('\n');
      }
    }

    // Show error
    showError(message, type);

    // Here you would normally send to an error tracking service
    // Example: Sentry.captureException(error);
  };

  // Clear all errors
  const clearErrors = () => {
    setErrors([]);
  };

  // Remove a specific error by ID
  const removeError = (id: string) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error.id !== id));
  };

  // The most recent error to show in the toast
  const currentError = errors.length > 0 ? errors[0] : null;

  return (
    <ErrorContext.Provider value={{ showError, captureError, clearErrors }}>
      {children}
      
      {/* Display the current error as a toast */}
      {currentError && (
        <ErrorToast
          message={currentError.message}
          type={currentError.type}
          onClose={() => removeError(currentError.id)}
        />
      )}
    </ErrorContext.Provider>
  );
};

// Custom hook to use the error context
export const useError = (): ErrorContextState => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}; 
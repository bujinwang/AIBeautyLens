import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      errorInfo,
    });
    
    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props): void {
    // If resetKey changes, reset the error state
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <ScrollView style={styles.errorScrollView}>
              <Text style={styles.errorText}>
                {this.state.error?.toString() || 'An unexpected error occurred.'}
              </Text>
              {__DEV__ && this.state.errorInfo && (
                <Text style={styles.stackTrace}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.retryButton} onPress={this.resetError}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.default,
    padding: 20,
  },
  errorCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    ...SHADOWS.medium,
  },
  errorTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.error.main,
    marginBottom: 10,
  },
  errorScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  stackTrace: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
});

export default ErrorBoundary; 
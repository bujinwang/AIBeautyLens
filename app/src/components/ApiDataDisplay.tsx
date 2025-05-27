import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useApi } from '../hooks/useApi';
import { useError } from '../contexts/ErrorContext';
import ErrorBoundary from './ErrorBoundary';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

interface ApiDataDisplayProps<T> {
  endpoint: string;
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  payload?: any;
  renderItem: (item: T) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  title: string;
  autoRetry?: boolean;
  handleErrorsLocally?: boolean;
}

function ApiDataDisplayInner<T>({
  endpoint,
  method = 'get',
  payload,
  renderItem,
  renderEmpty,
  title,
  autoRetry = false,
  handleErrorsLocally = false,
}: ApiDataDisplayProps<T>) {
  const { showError } = useError();
  
  // Use our API hook
  const { data, loading, error, execute, retry } = useApi<T>(method, endpoint, null, {
    handleErrors: !handleErrorsLocally, // If handling locally, don't show global errors
    autoRetry,
  });

  // Handle local errors if needed
  useEffect(() => {
    if (handleErrorsLocally && error) {
      // Show custom error handling for this component
      console.log(`Local error handling for ${title}:`, error);
    }
  }, [error, handleErrorsLocally, title]);

  // Component to render when there's an error
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        {error?.message || 'An error occurred while loading data'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Component to render when loading
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary.main} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  // Component to render when there's no data
  const renderNoData = () => {
    if (renderEmpty) {
      return renderEmpty();
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  };

  // Render main content
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : !data ? (
        renderNoData()
      ) : (
        <View style={styles.dataContainer}>
          {renderItem(data)}
        </View>
      )}
      
      {/* Demo of manually showing an error */}
      <TouchableOpacity
        style={styles.demoButton}
        onPress={() => showError('This is a demo error message!', 'warning')}
      >
        <Text style={styles.demoButtonText}>Show Demo Error</Text>
      </TouchableOpacity>
    </View>
  );
}

// Wrap the component with ErrorBoundary
function ApiDataDisplay<T>(props: ApiDataDisplayProps<T>) {
  return (
    <ErrorBoundary>
      <ApiDataDisplayInner {...props} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    ...SHADOWS.medium,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error.light,
    borderRadius: 8,
  },
  errorText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.error.dark,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.error.main,
    borderRadius: 4,
  },
  retryText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  dataContainer: {
    marginTop: 8,
  },
  demoButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: COLORS.warning.main,
    borderRadius: 4,
    alignItems: 'center',
  },
  demoButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
});

export default ApiDataDisplay; 
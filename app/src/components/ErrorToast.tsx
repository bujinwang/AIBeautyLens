import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { ErrorType } from '../services/api';

interface ErrorToastProps {
  message: string;
  type?: ErrorType | 'success' | 'warning';
  duration?: number;
  onClose?: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  type = ErrorType.UNKNOWN,
  duration = 3000,
  onClose,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after duration
    const timer = setTimeout(() => {
      hide();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  // Get color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return COLORS.success.main;
      case 'warning':
        return COLORS.warning.main;
      case ErrorType.BAD_REQUEST:
      case ErrorType.UNAUTHORIZED:
      case ErrorType.FORBIDDEN:
      case ErrorType.NOT_FOUND:
        return COLORS.warning.main;
      case ErrorType.NETWORK:
      case ErrorType.SERVER:
      case ErrorType.TIMEOUT:
      case ErrorType.UNKNOWN:
      default:
        return COLORS.error.main;
    }
  };

  // Get icon based on type
  const getIconText = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
      case ErrorType.BAD_REQUEST:
      case ErrorType.UNAUTHORIZED:
      case ErrorType.FORBIDDEN:
      case ErrorType.NOT_FOUND:
        return '⚠️';
      case ErrorType.NETWORK:
      case ErrorType.SERVER:
      case ErrorType.TIMEOUT:
      case ErrorType.UNKNOWN:
      default:
        return '✕';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity,
            transform: [{ translateY }],
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>{getIconText()}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={hide}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    ...SHADOWS.medium,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    ...TYPOGRAPHY.h5,
    color: COLORS.white,
    marginRight: 8,
  },
  message: {
    flex: 1,
    ...TYPOGRAPHY.body2,
    color: COLORS.white,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  closeText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.white,
    opacity: 0.8,
  },
});

export default ErrorToast; 
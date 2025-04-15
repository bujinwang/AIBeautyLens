/**
 * AIBeautyLens Premium Theme
 * Enterprise-grade styling system for high-end aesthetic software
 */

export const COLORS = {
  // Primary brand colors
  primary: {
    main: '#1E3A8A',     // Rich deep blue - main brand color
    light: '#3151B7',    // Lighter variant for hover states
    dark: '#142A66',     // Darker variant for pressed states
    contrast: '#FFFFFF'  // Text color on primary background
  },

  // Secondary accent colors
  secondary: {
    main: '#9061FF',     // Luxurious purple - secondary brand color
    light: '#A77EFF',    // Lighter variant
    dark: '#7D4FE1',     // Darker variant
    contrast: '#FFFFFF'  // Text color on secondary background
  },

  // Gold accent for premium elements
  gold: {
    main: '#D4AF37',     // Luxury gold
    light: '#E5C158',    // Lighter gold accent
    dark: '#BF9B30'      // Darker gold accent
  },

  // Success states
  success: {
    main: '#34D399',     // Emerald green success
    light: '#6EE7B7',
    dark: '#10B981',
    contrast: '#FFFFFF'
  },

  // Error states
  error: {
    main: '#EF4444',     // Modern red
    light: '#F87171',
    dark: '#DC2626',
    contrast: '#FFFFFF'
  },

  // Warning states
  warning: {
    main: '#F59E0B',     // Amber warning
    light: '#FBBF24',
    dark: '#D97706',
    contrast: '#000000'
  },

  // Info states
  info: {
    main: '#3B82F6',     // Blue info
    light: '#60A5FA',
    dark: '#2563EB',
    contrast: '#FFFFFF'
  },

  // Grayscale palette
  gray: {
    50: '#F9FAFB',       // Nearly white
    100: '#F3F4F6',      // Very light gray (background shade)
    200: '#E5E7EB',      // Light gray (subtle borders)
    300: '#D1D5DB',      // Light-medium gray
    400: '#9CA3AF',      // Medium gray
    500: '#6B7280',      // Medium-dark gray
    600: '#4B5563',      // Dark gray (secondary text)
    700: '#374151',      // Very dark gray (primary text)
    800: '#1F2937',      // Nearly black (headings)
    900: '#111827',      // Almost black
  },

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',

  // Specialized UI colors
  background: {
    default: '#F9FAFB',  // Default page background
    paper: '#FFFFFF',    // Card/surface backgrounds
    dark: '#111827',     // Dark mode background
  },

  text: {
    primary: '#1F2937',   // Main text color
    secondary: '#4B5563', // Secondary text color
    disabled: '#9CA3AF',  // Disabled text color
    hint: '#6B7280',      // Hint text color
  },

  confidence: {
    high: '#34D399',      // Green for high confidence
    medium: '#F59E0B',    // Amber for medium confidence
    low: '#EF4444',       // Red for low confidence
  }
};

// Shadows for elevation
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  xlarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  }
};

// Typography scale
export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  body1: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'none',
  },
  caption: {
    fontSize: 12,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  }
};

// Spacing scale (in pixels)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

// Animation durations
export const ANIMATION = {
  shortest: 150,
  shorter: 200,
  short: 250,
  standard: 300,
  complex: 400,
  long: 500,
};

// Z-index scale
export const Z_INDEX = {
  mobileStepper: 1000,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Export the entire theme object
export default {
  COLORS,
  SHADOWS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  ANIMATION,
  Z_INDEX
}; 
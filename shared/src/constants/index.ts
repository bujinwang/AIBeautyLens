// Shared constants for AI Beauty Lens

export const API_ENDPOINTS = {
  ANALYSIS: '/api/analysis',
  USER: '/api/user',
  UPLOAD: '/api/upload',
} as const;

export const ANALYSIS_TYPES = {
  SKIN: 'skin',
  HAIR: 'hair',
  EYE: 'eye',
  BEFORE_AFTER: 'before_after',
} as const;

export const IMAGE_FORMATS = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  WEBP: 'image/webp',
} as const;

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de'] as const;

export const DEFAULT_LANGUAGE = 'en';

export const SEVERITY_LEVELS = {
  NONE: 0,
  MILD: 1,
  MODERATE: 2,
  SEVERE: 3,
} as const;
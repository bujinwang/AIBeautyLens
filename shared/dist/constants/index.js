"use strict";
// Shared constants for AI Beauty Lens
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEVERITY_LEVELS = exports.DEFAULT_LANGUAGE = exports.SUPPORTED_LANGUAGES = exports.MAX_IMAGE_SIZE = exports.IMAGE_FORMATS = exports.ANALYSIS_TYPES = exports.API_ENDPOINTS = void 0;
exports.API_ENDPOINTS = {
    ANALYSIS: '/api/analysis',
    USER: '/api/user',
    UPLOAD: '/api/upload',
};
exports.ANALYSIS_TYPES = {
    SKIN: 'skin',
    HAIR: 'hair',
    EYE: 'eye',
    BEFORE_AFTER: 'before_after',
};
exports.IMAGE_FORMATS = {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    WEBP: 'image/webp',
};
exports.MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
exports.SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de'];
exports.DEFAULT_LANGUAGE = 'en';
exports.SEVERITY_LEVELS = {
    NONE: 0,
    MILD: 1,
    MODERATE: 2,
    SEVERE: 3,
};
//# sourceMappingURL=index.js.map
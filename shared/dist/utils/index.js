"use strict";
// Shared utilities for AI Beauty Lens
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidImageType = exports.debounce = exports.calculateAge = exports.sanitizeFilename = exports.validateEmail = exports.generateId = exports.formatDate = void 0;
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};
exports.formatDate = formatDate;
const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};
exports.generateId = generateId;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
};
exports.sanitizeFilename = sanitizeFilename;
const calculateAge = (birthDate) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
};
exports.calculateAge = calculateAge;
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
exports.debounce = debounce;
const isValidImageType = (mimeType) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return validTypes.includes(mimeType);
};
exports.isValidImageType = isValidImageType;
//# sourceMappingURL=index.js.map
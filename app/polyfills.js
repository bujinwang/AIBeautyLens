// Add polyfills for missing functionality in Hermes
// This polyfill file should be imported before any other imports

// Polyfill global.S directly (likely related to Symbol)
if (typeof global !== 'undefined') {
  if (!global.S) global.S = {};
}

// Fix "Cannot read property 'default' of undefined"
// This could be caused by problematic ES module/CommonJS interop
if (typeof module !== 'undefined') {
  const originalRequire = global.require;
  if (originalRequire) {
    global.require = function(id) {
      try {
        const exports = originalRequire(id);
        if (exports && typeof exports === 'object' && !exports.default) {
          exports.default = exports;
        }
        return exports;
      } catch (error) {
        console.warn(`Require error for: ${id}`, error);
        return {};
      }
    };
    // Preserve properties of original require
    Object.assign(global.require, originalRequire);
  }
}

// Fix prototype methods that might be missing
if (typeof String.prototype.padStart !== 'function') {
  String.prototype.padStart = function(targetLength, padString) {
    padString = padString || ' ';
    if (this.length >= targetLength) {
      return String(this);
    }
    const padding = padString.repeat(Math.ceil((targetLength - this.length) / padString.length));
    return padding.slice(0, targetLength - this.length) + String(this);
  };
}

// Ensure Symbol exists
if (typeof global.Symbol === 'undefined') {
  global.Symbol = function(description) {
    return description || '';
  };
  global.Symbol.for = function(key) {
    return key;
  };
}

// Add any additional polyfills needed for your specific project here 
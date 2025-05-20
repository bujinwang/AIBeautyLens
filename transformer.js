const metro = require('metro-react-native-babel-transformer');
const fs = require('fs');
const path = require('path');

// Read the polyfill content once to reuse
let polyfillContent = '';
try {
  polyfillContent = fs.readFileSync(path.join(__dirname, 'polyfills.js'), 'utf8');
  // Strip out any import/export statements from the polyfill
  polyfillContent = polyfillContent.replace(/import\s+.*?;/g, '').replace(/export\s+.*?;/g, '');
  // Convert to inline code that doesn't rely on imports
  polyfillContent = `
// Polyfill injected by transformer.js
(function() {
  ${polyfillContent}
})();
`;
} catch (e) {
  console.warn('Failed to read polyfills.js:', e);
}

module.exports.transform = async function transform(props) {
  // Skip injecting polyfill for certain files to avoid issues
  const skipFiles = [
    'node_modules/react-native/Libraries/Core/InitializeCore.js',
    'node_modules/react-native/Libraries/Core/setUpGlobals.js',
    'node_modules/react-native/Libraries/Core/setUpPerformance.js',
    'node_modules/react-native/Libraries/Utilities/PolyfillFunctions.js',
    'node_modules/hermes-engine/',
    'polyfills.js',
  ];
  
  // Don't inject into files in the skip list
  const shouldInjectPolyfill = !skipFiles.some(skipPath => props.filename.includes(skipPath));
  
  // Transform the source code
  const result = await metro.transform(props);
  
  // Inject polyfill at the beginning of transformed code if needed
  if (shouldInjectPolyfill && polyfillContent && !result.code.includes('// Polyfill injected by transformer.js')) {
    result.code = polyfillContent + result.code;
  }
  
  return result;
}; 
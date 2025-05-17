const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Customize the config before returning it
  if (config.mode === 'development') {
    config.devServer.hot = false;
  }
  
  config.resolve.alias = {
    ...config.resolve.alias, // Preserve existing aliases
    'react-native$': 'react-native-web',
    crypto: require.resolve('react-native-crypto'),
  };

  config.resolve.fallback = {
    ...config.resolve.fallback, // Preserve existing fallbacks
    "stream": require.resolve("stream-browserify"),
    "vm": require.resolve("vm-browserify"),
  };
  return config;
};
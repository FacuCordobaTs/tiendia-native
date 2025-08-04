const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
  
const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle react-dom imports
config.resolver.alias = {
  'react-dom': 'react-native',
};

// Ensure proper platform resolution
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Add resolver configuration for problematic packages
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = withNativeWind(config, { input: './global.css' });
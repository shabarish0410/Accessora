const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'mjs' to the list of source extensions
config.resolver.sourceExts.push('mjs');

module.exports = config;

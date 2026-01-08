const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add .wasm as an asset extension for expo-sqlite web support
config.resolver.assetExts.push("wasm");

// exclude Cypress test files from bundler - tests only used by cypress
config.resolver.blockList = [
  /.*\.cy\.(js|jsx|ts|tsx)$/,
  /cypress\//,
  /\.test\.(js|jsx|ts|tsx)$/,
  /\.spec\.(js|jsx|ts|tsx)$/,
];

module.exports = withNativeWind(config, { input: "./global.css" });

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add .wasm as an asset extension for expo-sqlite web support
config.resolver.assetExts.push("wasm");

module.exports = withNativeWind(config, { input: "./global.css" });

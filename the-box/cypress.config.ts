import { defineConfig } from "cypress";
import webpackConfig from "./webpack.config";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig,
    },
    specPattern: "{components,app}/**/*.cy.{js,jsx,ts,tsx}",
    excludeSpecPattern: ["cypress/e2e/**", "temp/**"],
    supportFile: "cypress/support/component.ts",
  },

  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:8081",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 375,
    viewportHeight: 667,
    video: false,
    screenshotOnRunFailure: true,
  },

  // timeout settings for expo - slower
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  pageLoadTimeout: 30000,
  retries: {
    runMode: 2,
    openMode: 0,
  },
});

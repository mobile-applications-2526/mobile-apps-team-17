import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import type { Configuration as WebpackConfiguration } from "webpack";
import type { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";

// translate react native to web
interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
  mode: "development",
  entry: "./app/_layout.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "react-native$": "react-native-web",
      "@": path.resolve(__dirname, "."),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: { browsers: ["last 2 versions"] },
                  useBuiltIns: "usage",
                  corejs: 3,
                },
              ],
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  regenerator: true,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 3000,
  },
};

export default config;

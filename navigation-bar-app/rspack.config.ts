import { defineConfig } from "@rspack/cli";
import {DefinePlugin, rspack} from "@rspack/core";
import * as RefreshPlugin from "@rspack/plugin-react-refresh";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import 'dotenv/config';
import { mfConfig } from "./module-federation.config";
import * as path from "node:path";

const isDev = process.env.NODE_ENV === "development";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
  context: __dirname,
  entry: {
    main: "./src/index.tsx",
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".jsx"],
  },

  devServer: {
    port: 3005,
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, "src")],
  },
  output: {
    // You need to set a unique value that is not equal to other applications
    uniqueName: "navigation_bar_app",
    // publicPath must be configured if using manifest
    // publicPath: "http://localhost:3005/",
    publicPath: `${ process.env.MFE_PUBLIC_SERVICE }/` ,
  },

  experiments: {
    css: true,
  },

  module: {
    rules: [
      {
        test: /\.svg$/,
        type: "asset",
      },
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        type: "asset/resource",
        generator: { filename: "assets/[name].[contenthash:6][ext]" }
      },
      {
        test: /\.css$/,
        use: ["postcss-loader"],
        type: "css",
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: { targets },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: "./index.html",
    }),
    new DefinePlugin({

      "process.env.REACT_APP_BASE_URL": JSON.stringify(process.env.REACT_APP_BASE_URL),
      "process.env.MFE_PUBLIC_SERVICE": JSON.stringify(process.env.MFE_PUBLIC_SERVICE),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.SPRING_SERVER_API_URL": JSON.stringify(process.env.SPRING_SERVER_API_URL)
    }),
    new ModuleFederationPlugin(mfConfig),
    isDev ? new RefreshPlugin() : null,
  ].filter(Boolean),
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
});

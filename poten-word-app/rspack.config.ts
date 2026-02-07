import * as path from "node:path";
import { defineConfig } from "@rspack/cli";
import {DefinePlugin, rspack} from "@rspack/core";
import * as RefreshPlugin from "@rspack/plugin-react-refresh";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import 'dotenv/config';

import { mfConfig } from "./module-federation.config";

const isDev = process.env.NODE_ENV === "development";

const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

module.exports = defineConfig({
  context: __dirname,
  entry: {
    main: "./src/index.tsx",
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".jsx"],
  },

  devServer: {
    port: 3006,
    static: {
      directory: path.resolve(__dirname, "public"),
      publicPath: "/",
      watch: true,
    },
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        {
          from: /^\/pdfjs\/.*$/,
          to: (ctx) => (ctx.parsedUrl && ctx.parsedUrl.pathname) ? ctx.parsedUrl.pathname : "/pdfjs/",
        },
        {
          from: /^\/samples\/.*$/,
          to: (ctx) => (ctx.parsedUrl && ctx.parsedUrl.pathname) ? ctx.parsedUrl.pathname : "/samples/",
        },
      ],
    },
    watchFiles: [path.resolve(__dirname, "src"), path.resolve(__dirname, "public")],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization",
    },
  },
  output: {
    // You need to set a unique value that is not equal to other applications
    uniqueName: "spoon_word_app",
    // publicPath must be configured if using manifest
    publicPath: `${ process.env.MFE_PUBLIC_SERVICE }/` ,
    crossOriginLoading: "anonymous",
    path: path.resolve(__dirname, "dist"),
    filename: isDev ? "assets/[name].js" : "assets/[name].[contenthash:8].js",
    chunkFilename: isDev ? "assets/[name].js" : "assets/[name].[contenthash:8].js",
    assetModuleFilename: "assets/[name].[hash][ext][query]",
    clean: true,
  },

  experiments: {
    css: true,
  },

  module: {
    rules: [
      // 이미지 (svg는 여기서 처리하므로 아래 별도 svg rule은 삭제)
      {
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        type: "asset",
        parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
        generator: { filename: "static/media/[name].[contenthash][ext]" }
      },

      // 폰트
      {
        test: /\.(woff2?|ttf|otf|eot)$/i,
        type: "asset/resource",
        generator: { filename: "static/fonts/[name].[contenthash][ext]" }
      },

      // CSS (중복 rule 있던 거 하나만 남기기)
      {
        test: /\.css$/i,
        use: ["postcss-loader"],
        type: "css",
      },

      // TS/JS
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: { syntax: "typescript", tsx: true },
                transform: {
                  react: { runtime: "automatic", development: isDev, refresh: isDev },
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
      "process.env.REACT_APP_API_BASE_URL": JSON.stringify(process.env.REACT_APP_API_BASE_URL ?? ""),
      "process.env.MFE_PUBLIC_SERVICE": JSON.stringify(process.env.MFE_PUBLIC_SERVICE ?? "http://localhost:3006"),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
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

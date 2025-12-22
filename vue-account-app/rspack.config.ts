//rspack.config.ts
import * as path from "node:path";
import { defineConfig } from "@rspack/cli";
import { DefinePlugin, rspack } from "@rspack/core";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import { VueLoaderPlugin } from "vue-loader";
import 'dotenv/config';

import { mfConfig } from "./module-federation.config";

console.log("🌐 MFE_CORS_ORIGIN:", process.env.MFE_CORS_ORIGIN);

const isDev = process.env.NODE_ENV === "development";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
  context: __dirname,
  entry: {
    main: "./src/index.tsx",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: ["...", ".ts", ".tsx", ".jsx"],
  },

  devServer: {
    port: 3000,
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, "src")],

    setupMiddlewares: (middlewares, devServer) => {
      const envOrigins = process.env.MFE_CORS_ORIGIN ?? "";
      const allowedOrigins = envOrigins
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      if (devServer?.app) {
        devServer.app.use((req, res, next) => {
          // const origin = req.headers.origin;
          // if (origin && allowedOrigins.includes(origin)) {
          //   res.setHeader("Access-Control-Allow-Origin", origin);
          // }

          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader(
            "Access-Control-Allow-Methods",
            "GET,OPTIONS,POST,PUT,DELETE"
          );
          res.setHeader("Access-Control-Allow-Headers", "*");

          if (req.method === "OPTIONS") {
            res.sendStatus(200);
          } else {
            next();
          }
        });
      }

      return middlewares;
    },
  },

  output: {
    // You need to set a unique value that is not equal to other applications
    uniqueName: "vue_account_app",
    // publicPath must be configured if using manifest
    publicPath: `${ process.env.MFE_PUBLIC_SERVICE }/` ,
  },

  experiments: {
    css: true,
  },

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
        type: "asset", // 또는 type: 'asset/resource'
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          experimentalInlineMatchResource: true,
        },
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
              },
              env: { targets },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new rspack.HtmlRspackPlugin({
      template: "./index.html",
    }),
    new DefinePlugin({
      "process.env.VUE_APP_BASE_URL": JSON.stringify(
        process.env.VUE_APP_BASE_URL
      ),
      "process.env.MAIN_CONTAINER_URL": JSON.stringify(process.env.MAIN_CONTAINER_URL),
      "process.env.ORIGIN": JSON.stringify(process.env.ORIGIN),
      "process.env.VUE_APP_DJANGO_API_BASE_URL": JSON.stringify(process.env.VUE_APP_DJANGO_API_BASE_URL),
      "process.env.VUE_APP_SPRING_API_BASE_URL": JSON.stringify(process.env.VUE_APP_SPRING_API_BASE_URL),
      "process.env.VUE_APP_AI_API_BASE_URL": JSON.stringify(process.env.VUE_APP_AI_API_BASE_URL),
      // "process.env.MFE_CORS_ORIGIN": JSON.stringify(process.env.MFE_CORS_ORIGIN),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.ADMIN_SESSION_TTL_MINUTES": JSON.stringify(process.env.ADMIN_SESSION_TTL_MINUTES || "60"),
    }),
    new ModuleFederationPlugin(mfConfig),
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

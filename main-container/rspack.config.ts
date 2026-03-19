// main-container/rspack.config.ts
import * as path from "node:path";
import { defineConfig } from "@rspack/cli";
import { DefinePlugin, rspack } from "@rspack/core";
import * as RefreshPlugin from "@rspack/plugin-react-refresh";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import "dotenv/config";
import { mfConfig } from "./module-federation.config";

const isDev = process.env.NODE_ENV === "development";
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

// ── manifest 플러그인 안전 로더 ──────────────────────────────────────────────
function loadAssetsManifestCtor() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require("webpack-assets-manifest");
    const ctor =
      m?.default?.default ??
      m?.default ??
      m?.WebpackAssetsManifest ??
      m;
    if (typeof ctor === "function") return ctor;
    console.warn("[WAM] webpack-assets-manifest가 생성자가 아닙니다. (스킵)");
    return null;
  } catch (e) {
    console.warn("[WAM] webpack-assets-manifest 로딩 실패(스킵):", (e as Error).message);
    return null;
  }
}
const WebpackAssetsManifest = loadAssetsManifestCtor();
// ───────────────────────────────────────────────────────────────────────────

export default defineConfig({
  context: __dirname,
  entry: { main: "./src/index.ts" },
  resolve: { extensions: ["...", ".ts", ".tsx", ".jsx"] },

  devServer: {
    host: "localhost",
    port: 80,

    static: {
      directory: path.resolve(__dirname, "public"),
      publicPath: "/",
      watch: true
    },

    historyApiFallback: {
      rewrites: [
        { from: /^\/vue-account\/kakao_oauth\/kakao-access-token$/, to: "/index.html" },
        { from: /^\/vue-account\/.*$/, to: "/index.html" },
        { from: /^\/vue-ai-interview\/.*$/, to: "/index.html" },
        { from: /^\/studies\/.*$/, to: "/index.html" },
        { from: /^\/poten-word\/.*$/, to: "/index.html" },
        { from: /^\/mypage\/.*$/, to: "/index.html" },
        { from: /./, to: "/index.html" }
      ]
    },
    watchFiles: [path.resolve(__dirname, "src")]
  },

  output: {
    uniqueName: "main_container",
    publicPath: "/",
    path: path.resolve(__dirname, "dist"),
    // ✅ dev는 무해시 파일명(boot-host.js 폴백과 일치)
    filename: isDev ? "assets/[name].js" : "assets/[name].[contenthash:8].js",
    chunkFilename: isDev ? "assets/[name].js" : "assets/[name].[contenthash:8].js",
    assetModuleFilename: "assets/[name].[hash][ext][query]",
    clean: true
  },

  experiments: { css: true },

  module: {
    rules: [
      { test: /\.svg$/, type: "asset" },
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        type: "asset/resource",
        generator: { filename: "assets/[name].[contenthash:6][ext]" }
      },
      { test: /\.css$/, use: ["postcss-loader"], type: "css" },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [{
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: { syntax: "typescript", tsx: true },
              transform: { react: { runtime: "automatic", development: isDev, refresh: isDev } }
            },
            env: { targets }
          }
        }]
      }
    ]
  },

  plugins: [
    new rspack.HtmlRspackPlugin({ template: "./index.html" }),
    new RefreshPlugin(),
    new DefinePlugin({
      "process.env.MFE_PUBLIC_SERVICE": JSON.stringify(process.env.MFE_PUBLIC_SERVICE),
      "process.env.VUE_ACCOUNT_APP": JSON.stringify(process.env.VUE_ACCOUNT_APP),
      "process.env.VUE_AI_INTERVIEW_APP": JSON.stringify(process.env.VUE_AI_INTERVIEW_APP),
      "process.env.REACT_NAVIGATION_APP": JSON.stringify(process.env.REACT_NAVIGATION_APP),
      "process.env.REACT_STUDYROOM_APP": JSON.stringify(process.env.REACT_STUDYROOM_APP),
      "process.env.REACT_MYPAGE_APP": JSON.stringify(process.env.REACT_MYPAGE_APP),
      "process.env.REACT_POTEN_WORD_APP": JSON.stringify(process.env.REACT_POTEN_WORD_APP),
      "process.env.REACT_APP_API_BASE_URL": JSON.stringify(process.env.REACT_APP_API_BASE_URL),
    }),
    new ModuleFederationPlugin(mfConfig),

    // ✅ 프로드에선 manifest 생성(가능하면). dev는 없어도 부팅 가능(boot-host 폴백)
    ...(WebpackAssetsManifest
      ? [new WebpackAssetsManifest({
        output: "assets/manifest.json",
        publicPath: true,
        writeToDisk: true,
        entrypoints: true
      })]
      : [])
  ].filter(Boolean),

  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({ minimizerOptions: { targets } })
    ]
  }
});

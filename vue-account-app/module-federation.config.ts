//module-federation.config.ts
export const mfConfig = {
  name: "vueAccountApp",
  filename: "remoteEntry.js",
  exposes: {
    "./bootstrap": "./src/bootstrap",
  },
  shared: {
    vue: { singleton: true, requiredVersion: "^3.2.19", eager: true },
    vuetify: { singleton: true, requiredVersion: "^3.8.8", eager: true },
    pinia: { singleton: true, requiredVersion: "^3.0.3" },
    "vue-router": { singleton: true, requiredVersion: "^4.5.1" },
    '@jobspoon/theme-bridge': { singleton: true, eager: true },
  },
  dts: false,
};

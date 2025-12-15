export const mfConfig = {
  name: "navigationBarApp",
  filename: "remoteEntry.js",
  exposes: {
    "./App": "./src/App",
  },
  shared: {
    react: { singleton: true, requiredVersion: "^18.2.0", eager: true },
    "react-dom": { singleton: true, requiredVersion: "^18.2.0", eager: true },
    "@mui/material": { singleton: true, requiredVersion: "^7.0.1" },
    "@mui/icons-material": { singleton: true, requiredVersion: "^7.0.1" },
    "react-router-dom": { singleton: true, requiredVersion: "^6.30.0" },
    three: { singleton: true, requiredVersion: "^0.177.0" },
    '@jobspoon/app-state': { singleton: true, eager: true },
    '@jobspoon/theme-bridge': { singleton: true, eager: true },
    "styled-components": { singleton: true, requiredVersion: "^6.1.19" },
  },
  dts: false
};
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const container = document.getElementById("app");
if (!container) throw new Error("Root container #app not found");

const root = ReactDOM.createRoot(container);
root.render(<App />);

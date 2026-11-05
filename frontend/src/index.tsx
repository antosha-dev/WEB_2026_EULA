import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthInit } from "./components/AuthInit";
import { store } from "./store/store";
import "./styles.css";
import "./styles/wireframe.css";
import "./styles/wireframe-banner.css";
import { WIREFRAME_MODE } from "./config/mode";

if (WIREFRAME_MODE) {
  document.documentElement.classList.add("wireframe-mode");
  document.title = "Школьная столовая — вайрфрейм";
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthInit>
          <App />
        </AuthInit>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

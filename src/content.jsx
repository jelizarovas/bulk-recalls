/* global chrome */

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const host = document.createElement("div");
document.body.appendChild(host);

const shadowRoot = host.attachShadow({ mode: "open" });
const container = document.createElement("div");
shadowRoot.appendChild(container);

// If you have a separate CSS chunk (e.g. content.css), inject it:
const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href = chrome.runtime.getURL("content.css");
shadowRoot.appendChild(styleLink);

// Then createRoot on `container`:
const root = createRoot(container);
root.render(<App />);

// Listen for the toggle message from background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.togglePanel) {
    togglePanelVisibility();
  }
});

// Toggle container visibility: if hidden, show it; if shown, hide it.
function togglePanelVisibility() {
  if (container.style.display === "none") {
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
}

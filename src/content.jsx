/* global chrome */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import tailwindStyles from "./index.css?inline";

// Create a host element and append it to the body
const host = document.createElement("div");
// Initially hide the host; you can set it to "block" if you want it visible by default
host.style.display = "block";
document.body.appendChild(host);

// Attach a shadow root to the host
const shadowRoot = host.attachShadow({ mode: "open" });

// Inject Tailwind CSS into the shadow root
const styleEl = document.createElement("style");
styleEl.textContent = tailwindStyles;
shadowRoot.appendChild(styleEl);

// If a separate CSS file is generated, inject it as well (adjust filename if needed)
// const styleLink = document.createElement("link");
// styleLink.rel = "stylesheet";
// styleLink.href = chrome.runtime.getURL("content.css");
// shadowRoot.appendChild(styleLink);

// Create a container element for your React app inside the shadow root
const container = document.createElement("div");
shadowRoot.appendChild(container);

// Render the App component into the container
const root = createRoot(container);
root.render(<App />);

// Listen for the toggle message from background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.togglePanel) {
    togglePanelVisibility();
  }
});

// Toggle the host element's visibility and update the page margin-right.
// When visible, the margin-right is set to the panel width (350px), so the page content is pushed left.
function togglePanelVisibility() {
  if (host.style.display === "none") {
    host.style.display = "block";
    document.body.style.marginRight = "350px";
  } else {
    host.style.display = "none";
    document.body.style.marginRight = "";
  }
}

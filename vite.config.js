import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        // popup: resolve(__dirname, "src/popup.html"), // update path here
        background: resolve(__dirname, "src/background.js"),
        content: resolve(__dirname, "src/content.jsx"),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            // Always name the CSS file "content.css" (or any fixed name you choose)
            return "assets/[name].css";
          }
          return "assets/[name]-[hash][extname]";
        },
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") return "background.js";
          if (chunkInfo.name === "content") return "content.js";
          return "[name].js";
        },
      },
    },
  },
});

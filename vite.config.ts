import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    origin: "https://fd0f-83-144-23-156.ngrok-free.app",
    cors: {
      origin: "https://fd0f-83-144-23-156.ngrok-free.app",
      credentials: true,
    },
  },
  define: {
    // Some libraries use the global object, even though it doesn't exist in the browser.
    global: "globalThis",
    // Add process.env for Node.js compatibility
    "process.env": {},
  },
  resolve: {
    alias: {
      "@": "/src",
      buffer: "buffer",
      process: "process/browser",
      util: "util",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      assert: "assert",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify",
      url: "url",
    },
  },
  optimizeDeps: {
    include: [
      "buffer",
      "process",
      "crypto-browserify",
      "stream-browserify",
      "assert",
      "stream-http",
      "https-browserify",
      "os-browserify",
      "url",
      "util",
    ],
  },
});

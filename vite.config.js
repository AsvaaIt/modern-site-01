import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    open: true,
    proxy: {
      // Forwards all /api requests to your backend
      "/api": {
        target: "http://localhost:3000", // <-- CHANGE THIS to your backend's actual port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
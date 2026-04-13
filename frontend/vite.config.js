import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-icons")) return "icons";
          if (id.includes("node_modules/@supabase")) return "supabase";
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "react-vendor";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      react: fileURLToPath(new URL("./node_modules/react", import.meta.url)),
      "react-dom": fileURLToPath(new URL("./node_modules/react-dom", import.meta.url)),
    },
  },
});

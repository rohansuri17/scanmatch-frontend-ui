import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Ensure the componentTagger is properly initialized
  const tagger = await componentTagger();
  
  return {
    server: {
      host: "::",
      port: 8080,
      watch: {
        usePolling: true
      }
    },
    plugins: [
      react({
        jsxImportSource: 'react'
      }),
      mode === 'development' ? tagger : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

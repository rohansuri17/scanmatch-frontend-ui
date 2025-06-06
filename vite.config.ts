
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [react()];
  
  if (mode === 'development') {
    try {
      const tagger = await componentTagger();
      if (tagger) {
        plugins.push(tagger);
      }
    } catch (error) {
      console.warn('Failed to load component tagger:', error);
    }
  }
  
  return {
    server: {
      host: "::",
      port: 8080,
      watch: {
        usePolling: true
      }
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

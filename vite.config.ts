import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT) || 3000;
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          (async () => {
            const [cartographer, banner, errorModal] = await Promise.all([
              import("@replit/vite-plugin-cartographer").catch(() => null),
              import("@replit/vite-plugin-dev-banner").catch(() => null),
              import("@replit/vite-plugin-runtime-error-modal").catch(() => null),
            ]);
            return [
              cartographer?.cartographer({ root: path.resolve(import.meta.dirname, "..") }),
              banner?.devBanner(),
              errorModal?.default(),
            ].filter(Boolean);
          })()
        ].flat()
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

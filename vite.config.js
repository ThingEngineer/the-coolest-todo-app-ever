import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    // Enable gzip compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files larger than 10kb
      algorithm: "gzip",
      ext: ".gz",
    }),
    // Enable brotli compression (better compression ratio)
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],
  server: {
    port: 3000,
    open: true,
    allowedHosts: ["fd8aba022f8b.ngrok-free.app"],
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: true,
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          vendor: ["preact", "preact/hooks"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
});

import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    port: 3000,
    open: true,
    allowedHosts: ["fd8aba022f8b.ngrok-free.app"],
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: true,
  },
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
});

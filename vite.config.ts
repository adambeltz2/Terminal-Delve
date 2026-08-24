import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { fileURLToPath } from "node:url";

// Terminal Delve is a fully static, local-first app: it is built to run
// entirely client-side (GitHub Pages, or `npm run build` + open the folder)
// with no backend server. Pyodide's runtime assets are copied out of
// node_modules into /pyodide at build time so the game never depends on a
// CDN to execute player code.
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: fileURLToPath(
            new URL("node_modules/pyodide/*", import.meta.url),
          ),
          dest: "pyodide",
        },
      ],
    }),
  ],
});

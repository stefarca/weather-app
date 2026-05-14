import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages the site is served from /<repo-name>/.
// During GitHub Actions, GITHUB_REPOSITORY = "owner/repo".
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS && repo ? `/${repo}/` : "/",
  build: {
    target: "es2022",
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});

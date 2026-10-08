import { defineConfig } from "vite";

// Builds the web UI in web/ for GitHub Pages. `base: "./"` keeps asset paths relative,
// so the site works under https://<user>.github.io/<repo>/.
export default defineConfig({
  root: "web",
  base: "./",
  build: { outDir: "../dist", emptyOutDir: true },
  define: {
    __BUILD__: JSON.stringify({
      sha: process.env.GITHUB_SHA ?? "local",
      time: new Date().toISOString(),
      repo: process.env.GITHUB_REPOSITORY ?? "",
    }),
  },
});

import path from "path";
import {defineConfig} from "vite";

export default defineConfig({
  root: "./test/plots",
  publicDir: path.resolve("./test"),
  resolve: {
    alias: {
      "@observablehq/plot": path.resolve("./src/index.js")
    }
  },
  server: {
    port: 8008,
    open: "/"
  }
});

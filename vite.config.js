import {resolve} from "node:path";
import {defineConfig} from "vite";

export default defineConfig({
  root: "./test/plots",
  publicDir: resolve("./test"),
  resolve: {
    alias: {
      "test/plot": resolve("./test/plot")
    }
  },
  server: {
    port: 8008,
    open: "/"
  }
});

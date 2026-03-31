import path from "path";
import {defineConfig} from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@observablehq/plot": path.resolve("./src/index.js")
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
    include: ["test/**/*-test.{js,ts}"],
    includeSource: ["test/plots/**.{js,ts}"],
    coverage: {include: ["src/**/*.js"]}
  }
});

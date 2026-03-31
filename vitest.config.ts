import {resolve} from "node:path";
import {defineConfig} from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "test/plot": resolve(__dirname, "./test/plot-snapshot.js")
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
    include: [
      "test/**/*-test.{js,ts}",
      "test/plots/**.{js,ts}",
      "!test/plots/d3-survey-2015.ts",
      "!test/plots/index.ts"
    ],
    coverage: {include: ["src/**/*.js"]}
  }
});

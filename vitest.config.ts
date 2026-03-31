import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
    include: ["test/**/*-test.{js,ts}"],
    includeSource: ["test/plots/**.{js,ts}"],
    coverage: {include: ["src/**/*.js"]}
  }
});

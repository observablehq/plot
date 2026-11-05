import js from "@eslint/js";
import ts from "typescript-eslint";
import globals from "globals";
import {defineConfig} from "eslint/config";

export default defineConfig([
  {ignores: ["dist/", "docs/"]},
  {files: ["**/*.{js,ts}"], extends: [js.configs.recommended, ts.configs.recommended]},
  {files: ["src/**/*.{js,ts}"], languageOptions: {globals: globals.browser}},
  {
    rules: {
      "no-cond-assign": 0,
      "no-constant-condition": 0,
      "no-sparse-arrays": 0,
      "no-unexpected-multiline": 0,
      "no-useless-assignment": 0,
      "@typescript-eslint/no-empty-function": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-this-alias": 0,
      "@typescript-eslint/no-unused-expressions": 0,
      "@typescript-eslint/no-unused-vars": ["error", {ignoreRestSiblings: true}]
    }
  },
  {files: ["test/**/*.js"], languageOptions: {globals: {...globals.node, ...globals.mocha}}}
]);

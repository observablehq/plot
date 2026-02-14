import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import {fileURLToPath} from "node:url";
import js from "@eslint/js";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      },
      parser: tsParser
    },
    rules: {
      "no-cond-assign": 0,
      "no-constant-condition": 0,
      "no-sparse-arrays": 0,
      "no-unexpected-multiline": 0,
      "@typescript-eslint/no-empty-function": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-this-alias": 0,
      "@typescript-eslint/no-unused-expressions": 0,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true
        }
      ]
    }
  },
  {
    files: ["src/react/**/*.tsx", "src/react/**/*.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-nocheck": "allow-with-description",
        "ts-expect-error": "allow-with-description"
      }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  },
  {
    files: ["test/**/*.js", "test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-nocheck": "allow-with-description",
        "ts-expect-error": "allow-with-description"
      }]
    }
  }
];

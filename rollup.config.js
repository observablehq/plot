import fs from "fs";
import path from "path";
import {terser} from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import node from "@rollup/plugin-node-resolve";
import jsesc from "jsesc";
import CleanCSS from "clean-css";
import * as meta from "./package.json";

const filename = meta.name.split("/").pop();

// Resolve D3 dependency.
const d3 = require("d3/package.json");
if (typeof d3.jsdelivr === "undefined") throw new Error("unable to resolve d3");
const d3Path = `d3@${d3.version}/${d3.jsdelivr}`;

// A lil’ Rollup plugin to allow importing of style.css.
const cssPath = path.resolve("./src/style.css");
const css = {
  load(id) {
    if (id !== cssPath) return;
    return fs.readFileSync(id, "utf8");
  },
  transform(input, id) {
    if (id !== cssPath) return;
    return {
      code: `if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = '${jsesc(new CleanCSS().minify(input).styles)}';
  document.head.appendChild(style);
}
`
    };
  }
};

const config = {
  input: "bundle.js",
  external: ["d3"],
  output: {
    indent: false,
    banner: `// ${meta.name} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`
  },
  plugins: [
    css,
    json(),
    node()
  ]
};

export default [
  {
    ...config,
    output: {
      ...config.output,
      format: "cjs",
      file: `dist/${filename}.cjs.js`
    }
  },
  {
    ...config,
    output: {
      ...config.output,
      name: "Plot",
      format: "umd",
      extend: true,
      file: `dist/${filename}.umd.js`,
      globals: {"d3": "d3"},
      paths: {"d3": d3Path}
    }
  },
  {
    ...config,
    output: {
      ...config.output,
      name: "Plot",
      format: "umd",
      extend: true,
      file: `dist/${filename}.umd.min.js`,
      globals: {"d3": "d3"},
      paths: {"d3": d3Path}
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]
  }
];

import fs from "fs";
import path from "path";
import {terser} from "rollup-plugin-terser";
import jsesc from "jsesc";
import CleanCSS from "clean-css";
import * as meta from "./package.json";

const filename = meta.name.split("/").pop();
const external = Object.keys(meta.dependencies || {}).filter(key => /^d3-/.test(key));

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
  input: "src/index.js",
  external,
  output: {
    indent: false,
    banner: `// ${meta.name} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`
  },
  plugins: [
    css
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
      globals: Object.fromEntries(external.map(key => [key, "d3"])),
      paths: Object.fromEntries(external.map(key => [key, "d3@6"]))
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
      globals: Object.fromEntries(external.map(key => [key, "d3"])),
      paths: Object.fromEntries(external.map(key => [key, "d3@6"]))
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

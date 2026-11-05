import fs from "node:fs";
import RollupCommonJs from "@rollup/plugin-commonjs";
import RollupJson from "@rollup/plugin-json";
import RollupNode from "@rollup/plugin-node-resolve";
import RollupTerser from "@rollup/plugin-terser";
import meta from "./package.json" with {type: "json"};

const filename = meta.name.split("/").pop();

// Resolve D3 dependency.
const d3 = JSON.parse(fs.readFileSync("./node_modules/d3/package.json", "utf-8"));
if (typeof d3.jsdelivr === "undefined") throw new Error("unable to resolve d3");
const d3Path = `d3@${d3.version}/${d3.jsdelivr}`;

// Extract copyrights from the LICENSE.
const copyrights = fs
  .readFileSync("./LICENSE", "utf-8")
  .split(/\n/g)
  .filter((line) => /^copyright\s+/i.test(line))
  .map((line) => line.replace(/^copyright\s+/i, ""));

const banner = `// ${meta.name} v${meta.version} Copyright ${copyrights.join(", ")}`;
const terser = RollupTerser({output: {preamble: banner}});

const config = {
  input: "bundle.js",
  external: ["d3"],
  output: {indent: false, banner},
  plugins: [RollupCommonJs(), RollupJson(), RollupNode()],
  onwarn(message, warn) {
    if (message.code === "CIRCULAR_DEPENDENCY") return;
    warn(message);
  }
};

export default [
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${filename}.js`
    }
  },
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${filename}.min.js`
    },
    plugins: [...config.plugins, terser]
  },
  {
    ...config,
    output: {
      ...config.output,
      name: "Plot",
      format: "umd",
      extend: true,
      file: `dist/${filename}.umd.js`,
      globals: {d3: "d3"},
      paths: {d3: d3Path}
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
      globals: {d3: "d3"},
      paths: {d3: d3Path}
    },
    plugins: [...config.plugins, terser]
  }
];

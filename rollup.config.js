import {terser} from "rollup-plugin-terser";
import * as meta from "./package.json";

const external = Object.keys(meta.dependencies || {}).filter(key => /^d3-/.test(key));

const config = {
  input: "src/index.js",
  external,
  output: {
    indent: false,
    banner: `// ${meta.name} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`,
  },
  plugins: []
};

export default [
  {
    ...config,
    output: {
      ...config.output,
      format: "cjs",
      file: `dist/${meta.name}.cjs.js`
    }
  },
  {
    ...config,
    output: {
      ...config.output,
      name: "Plot",
      format: "umd",
      extend: true,
      file: `dist/${meta.name}.umd.js`,
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

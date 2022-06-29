import path from "path";
import {defineConfig} from "vite";
import glob from "glob";

// Vite will automatically try to resolve to .ts files when an imported .js file
// doesn't exist, but only if the importer is .ts. In order to fall back on .ts
// for all.js imports that don't exist, we provide a customResolver below that
// will do this based on the js and ts files we have in src/. Once all of the
// files in src/ are converted to TypeScript we can remove this customLoader.
const typescriptPaths = new Set(glob.sync(`${path.resolve("./src")}/**/*.ts`));
const javascriptPaths = new Set(glob.sync(`${path.resolve("./src")}/**/*.js`));

export default defineConfig({
  root: "./test/plots",
  publicDir: path.resolve("./test"),
  resolve: {
    alias: [
      {find: "@observablehq/plot", replacement: path.resolve("./src/index.js")},
      {
        find: /^(.*)\.js$/,
        replacement: "$1",
        customResolver: (importee, importer) => {
          const base = path.join(path.dirname(importer), importee);
          const js = `${base}.js`;
          const ts = `${base}.ts`;
          if (javascriptPaths.has(js)) return js;
          if (typescriptPaths.has(ts)) return ts;
        }
      }
    ]
  },
  server: {
    port: 8008,
    open: "/"
  }
});

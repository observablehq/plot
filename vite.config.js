import path from "path";
import {defineConfig} from "vite";
import glob from "glob";

// Vite will automatically fallback on .ts files when resolving .js, but only if the importer
// is .ts. In order to fall-back on .ts for all .js imports that don't exist, we have a
// customResolver below that will do this.
const typescriptPaths = new Set(glob.sync(`${path.resolve("./src")}/**/*.ts`));
const javascriptPaths = new Set(glob.sync(`${path.resolve("./src")}/**/*.js`));

export default defineConfig({
  root: "./test/plots",
  publicDir: path.resolve("./test"),
  resolve: {
    alias: [
      { find: "@observablehq/plot", replacement: path.resolve("./src/index.js") },
      {
        find: RegExp(`^(.*)\.js$`), replacement: "$1", customResolver: (importee, importer) => {
          const base = path.join(path.dirname(importer), importee);
          const ts = `${base}.ts`;
          const js = `${base}.js`;
          if (typescriptPaths.has(ts)) return ts;
          if (javascriptPaths.has(js)) return js;
        }
      }
    ]
  },
  server: {
    port: 8008,
    open: "/"
  }
});

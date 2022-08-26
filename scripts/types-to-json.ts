import {mkdirSync, readFileSync, rmSync, writeFileSync} from "fs";
import glob from "glob";

const TYPES_DIRECTORY = "types";

function vfsPath(p: string) {
  return `/plot${p.slice(TYPES_DIRECTORY.length)}`;
}

const paths = glob.sync(`${TYPES_DIRECTORY}/**/*.d.ts`);

if (paths.length === 0) throw Error("No d.ts files found, make sure to run tsc first.");

// An object of d.ts paths to file contents.
const contentsByPath = Object.fromEntries(paths.map((p) => [vfsPath(p), readFileSync(p, {encoding: "utf-8"})]));

// Remove all of the d.ts files until we're ready to publish them.
rmSync(`./${TYPES_DIRECTORY}`, {recursive: true});
mkdirSync(`./${TYPES_DIRECTORY}`);

// Write the types.json file.
writeFileSync(`./${TYPES_DIRECTORY}/types.json`, JSON.stringify(contentsByPath));

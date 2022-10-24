import {readFileSync, writeFileSync} from "fs";
import {dirname} from "path";
import glob from "glob";
import mkdirp from "mkdirp";

// Extract the documentation from the README.
const readme = readFileSync("./README.md", "utf-8");
const docmap = new Map<string, string[]>();
let doc: {name: string; lines: string[]} | null = null;
for (const [i, line] of readme.split("\n").entries()) {
  if (/<!--\s*jsdoc/.test(line)) {
    let match: RegExpExecArray | null;
    if ((match = /^<!--\s+jsdoc\s+(\w+)\s+-->$/.exec(line))) {
      const [, name] = match;
      if (doc) {
        throw new Error(`nested jsdoc directive on line ${i}: ${line}`);
      }
      if (docmap.has(name)) {
        throw new Error(`duplicate jsdoc directive on line ${i}: ${line}`);
      }
      doc = {name, lines: []};
    } else if ((match = /^<!--\s+jsdocEnd\s+(\w+)\s+-->$/.exec(line))) {
      const [, name] = match;
      if (!doc) {
        throw new Error(`orphaned jsdocEnd directive on line ${i}: ${line}`);
      }
      if (doc.name !== name) {
        throw new Error(`mismatched jsdocEnd ${doc.name} directive on line ${i}: ${line}`);
      }
      docmap.set(doc.name, doc.lines);
      doc = null;
    } else {
      throw new Error(`malformed jsdoc directive on line ${i}: ${line}`);
    }
  } else if (doc) {
    doc.lines.push(line);
  }
}

// Make relative and anchor links absolute.
for (const lines of docmap.values()) {
  for (let i = 0, n = lines.length; i < n; ++i) {
    lines[i] = lines[i]
      .replace(/\]\(#([^)]+)\)/g, "](./README.md#$1)")
      .replace(/\]\(\.\/([^)]+)\)/g, "](https://github.com/observablehq/plot/blob/main/$1)");
  }
}

// Copy files from build/ to dist/, replacing /** @jsdoc name */ directives.
const unused = new Set(docmap.keys());
for (const file of glob.sync("build/**/*.js")) {
  process.stdout.write(`\x1b[2m${file}\x1b[0m`);
  const lines = readFileSync(file, "utf-8").split("\n");
  let count = 0;
  for (let i = 0, n = lines.length; i < n; ++i) {
    let match: RegExpExecArray | null;
    if ((match = /^\/\*\*\s+@jsdoc\s+(\w+)\s+\*\/$/.exec(lines[i]))) {
      const [, name] = match;
      const docs = docmap.get(name);
      if (!docs) throw new Error(`missing @jsdoc definition: ${name}`);
      if (!unused.has(name)) throw new Error(`duplicate @jsdoc reference: ${name}`);
      unused.delete(name);
      ++count;
      lines[i] = docs
        .map((line, i, lines) => (i === 0 ? `/** ${line}` : i === lines.length - 1 ? ` * ${line}\n */` : ` * ${line}`))
        .join("\n");
    }
  }
  const ofile = file.replace(/^build\//, "dist/");
  process.stdout.write(` → \x1b[36m${ofile}\x1b[0m${count ? ` (${count} jsdoc${count === 1 ? "" : "s"})` : ""}\n`);
  const odir = dirname(ofile);
  mkdirp.sync(odir);
  writeFileSync(ofile, lines.join("\n"), "utf-8");
}

for (const name of unused) {
  console.warn(`\x1b[33m[warning] unused @jsdoc directive:\x1b[0m ${name}`);
}

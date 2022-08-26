import {readFileSync, writeFileSync} from "fs";
import type {ExportedDeclarations, FunctionDeclaration} from "ts-morph";
import {Project} from "ts-morph";

/**
 * This script will find html comments in the README of the below shape and
 * inject the corresponding JSDoc from that exported symbol.
 *
 * <!-- jsdoc column -->
 * <!-- jsdocEnd -->
 */

const readmePath = "README.md";
let indexPath = "src/index.js";
const project = new Project({tsConfigFilePath: "tsconfig.json"});

let index = project.getSourceFile(indexPath);
if (!index) {
  indexPath = "src/index.ts";
  index = project.getSourceFile(indexPath);
  if (!index) throw new Error(`index file not found in src/`);
}

const exported = index.getExportedDeclarations();
function getByApiName(name: string) {
  for (const [exportedName, declarations] of exported) {
    if (name === exportedName) {
      return declarations[0];
    }
  }
}

function injectJsDoc(readme: string) {
  const lines = readme.split("\n");
  const output: string[] = [];
  let insideReplacement = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let replacement = "";
    let isReplacementDelimiter = false;
    if (line.startsWith("<!-- jsdocEnd")) {
      if (!insideReplacement) throw new Error(`Unexpected jsdocEnd on line ${i}.`);
      isReplacementDelimiter = true;
      insideReplacement = false;
    } else if (line.startsWith("<!-- jsdoc ")) {
      isReplacementDelimiter = true;
      insideReplacement = true;
      const parts = [""];
      const match = line.match(/jsdoc\s+(#+)?\s?(.+)\s/);
      if (!match || match.length < 2) throw new Error(`Malformed jsdoc comment in README.md on line ${i}.`);
      const [, prefix, name] = match;
      const declaration = getByApiName(name);
      if (!declaration) throw new Error(`${name} is not exported by src/index`);
      parts.push(getJsDocs(name, declaration, prefix));
      parts.push("");
      replacement = parts.join("\n");
    }
    if (!insideReplacement || isReplacementDelimiter) output.push(line);
    if (replacement) output.push(replacement);
  }
  return output.join("\n");
}

function getJsDocs(name: string, declaration: ExportedDeclarations, prefix = "####") {
  if ("getParameters" in declaration) {
    return getJsDocsForFunction(name, declaration, prefix);
  }
  if ("getJsDocs" in declaration) {
    return `${prefix} Plot.${name}\n${declaration
      .getJsDocs()
      .map((doc) => makeRelativeUrls(doc.getDescription()))
      .join("\n\n")}`;
  }
  return `JSDoc extraction for ${declaration.getKindName()} not yet implemented.`;
}

function getJsDocsForFunction(name: string, declaration: FunctionDeclaration, prefix = "####") {
  const parameters = declaration.getParameters();
  const title = `${prefix} Plot.${name}(${parameters
    .map((param) => `${param.getDotDotDotToken() ? "..." : ""}*${param.getName()}*`)
    .join(", ")})`;
  const parts = [title];
  const docs = declaration.getJsDocs();
  if (docs.length) {
    parts.push(docs.map((doc) => makeRelativeUrls(doc.getDescription())).join("\n\n"));
    return parts.join("\n");
  }
  // If we didn't find docs on the implementation, it's probably on one of the
  // overloads.
  const overloads = declaration.getOverloads();
  for (const overload of overloads) {
    const docs = overload.getJsDocs();
    if (!docs.length) continue;
    parts.push(docs.map((doc) => makeRelativeUrls(doc.getDescription())).join("\n\n"));
    return parts.join("\n");
  }

  return "No JSDocs found.";
}

function makeRelativeUrls(description: string) {
  return description.replace(new RegExp("https://github.com/observablehq/plot/blob/main/README.md#", "g"), "#");
}

const check = process.argv[process.argv.length - 1] === "--check";
const original = readFileSync(readmePath, {encoding: "utf-8"});
const output = injectJsDoc(original);

if (original !== output) {
  if (check) {
    console.log("README.md is out of sync. Please run `yarn readme:update`");
    process.exit(1);
  } else {
    writeFileSync(readmePath, output);
    console.log("README.md has been updated based on the JSDoc annotations.");
  }
} else {
  console.log("README.md requires no changes.");
}

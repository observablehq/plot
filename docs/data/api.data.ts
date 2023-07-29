import {rollup, sort} from "d3";
import {FunctionDeclaration, Node, Project, VariableStatement} from "ts-morph";
import {readMarkdownFiles, readMarkdownSource, getAnchors} from "../components/links.js";

// These interfaces tend to represent things that Plot constructs internally,
// rather than objects that the user is expected to provide.
function isInternalInterface(name) {
  return (
    name === "AutoSpec" ||
    name === "Channel" ||
    name === "ChannelDomainOptions" || // TODO
    name === "ChannelTransform" ||
    name === "Context" ||
    name === "Dimensions" ||
    name === "Plot" ||
    name === "Scale"
  );
}

// This tries to get a brief human-readable, one-sentence summary description of
// the exported symbol. We might want to formalize this so that we can be more
// intentional when authoring documentation.
function getDescription(node: FunctionDeclaration | VariableStatement): string {
  return node
    .getJsDocs()[0]
    ?.getDescription()
    .replace(/\n/g, " ") // replace newlines with spaces
    .replace(/[*_]/g, "") // remove bold and italics formatting
    .replace(/[.:]($|\s+).*/g, "") // truncate at the first period or colon
    .replace(/\[([^[]+)\]\[\d+\]/g, "$1") // strip links (assuming [1] syntax)
    .trim();
}

// While we try to keep the source code file structure as close as possible to
// the documentation URL structure, there are some inevitable deviations that
// are codified by this function. When new files are added, please try to keep
// this function up-to-date, and try to generalize patterns so that we
// automatically generate correct links. (TODO Verify that the links are valid.)
function getHref(name: string, path: string): string {
  path = path.replace(/\.d\.ts$/, ""); // drop trailing .d.ts
  path = path.replace(/([a-z0-9])([A-Z])/, (_, a, b) => `${a}-${b.toLowerCase()}`); // camel case conversion
  if (path.split("/").length === 1) path = `features/${path}`; // top-level declarations are features
  switch (path) {
    case "features/curve":
    case "features/format":
    case "features/mark":
    case "features/marker":
    case "features/plot":
    case "features/projection":
      return `${path}s`;
    case "features/inset":
      return "features/scales";
    case "features/options":
      return "features/transforms";
    case "marks/axis": {
      switch (name) {
        case "gridX":
        case "gridY":
        case "gridFx":
        case "gridFy":
          return "marks/grid";
      }
      break;
    }
    case "marks/crosshair":
      return "interactions/crosshair";
    case "transforms/basic": {
      switch (name) {
        case "filter":
          return "transforms/filter";
        case "reverse":
        case "shuffle":
        case "sort":
          return "transforms/sort";
      }
      return "features/transforms";
    }
  }
  return path;
}

function getInterfaceName(name: string, path: string): string {
  name = name.replace(/(Transform|Corner|X|Y|Output)?(Defaults|Options|Styles)$/, "");
  name = name.replace(/([a-z0-9])([A-Z])/, (_, a, b) => `${a} ${b}`); // camel case conversion
  name = name.toLowerCase();
  if (name === "curve auto") name = "curve";
  if (name === "plot facet") name = "plot";
  if (path.startsWith("marks/")) name += " mark";
  else if (path.startsWith("transforms/")) name += " transform";
  return name;
}

export default {
  watch: [],
  async load() {
    // Parse the TypeScript declarations to get exported symbols.
    const project = new Project({tsConfigFilePath: "tsconfig.json"});
    const allMethods: {name: string; comment: string; href: string}[] = [];
    const allOptions: {name: string; context: {name: string; href: string}}[] = [];
    const index = project.getSourceFile("src/index.d.ts")!;
    for (const [name, declarations] of index.getExportedDeclarations()) {
      for (const declaration of declarations) {
        if (Node.isInterfaceDeclaration(declaration)) {
          if (isInternalInterface(name)) continue;
          for (const property of declaration.getProperties()) {
            const path = index.getRelativePathTo(declaration.getSourceFile());
            const href = getHref(name, path);
            if (property.getJsDocs().some((d) => d.getTags().some((d) => Node.isJSDocDeprecatedTag(d)))) continue;
            allOptions.push({name: property.getName(), context: {name: getInterfaceName(name, path), href}});
          }
        } else if (Node.isFunctionDeclaration(declaration)) {
          const comment = getDescription(declaration);
          if (comment) {
            const href = getHref(name, index.getRelativePathTo(declaration.getSourceFile()));
            allMethods.push({name, comment, href});
          }
        } else if (Node.isVariableDeclaration(declaration)) {
          const comment = getDescription(declaration.getVariableStatement()!);
          if (comment) {
            const href = getHref(name, index.getRelativePathTo(declaration.getSourceFile()));
            allMethods.push({name, comment, href});
          }
        }
      }
    }
    // Parse the Markdown files to get all known anchors.
    const root = "docs";
    const anchors = new Map();
    for await (const file of readMarkdownFiles(root)) {
      const text = await readMarkdownSource(root + file);
      anchors.set(file, getAnchors(text));
    }
    // Cross-reference the generated links.
    for (const {name, href} of allMethods) {
      if (!anchors.has(`/${href}.md`)) {
        throw new Error(`file not found: ${href}`);
      }
      if (!anchors.get(`/${href}.md`).includes(name)) {
        throw new Error(`anchor not found: ${href}#${name}`);
      }
    }
    for (const {context: {href}} of allOptions) {
      if (!anchors.has(`/${href}.md`)) {
        throw new Error(`file not found: ${href}`);
      }
    }
    return {
      methods: sort(allMethods, ({name}) => name),
      options: sort(
        rollup(
          allOptions,
          (D) =>
            sort(
              rollup(
                D.map((d) => d.context),
                ([d]) => d,
                (d) => d.name
              ).values(),
              (d) => d.name
            ),
          (d) => d.name
        ),
        ([name]) => name
      )
    };
  }
};

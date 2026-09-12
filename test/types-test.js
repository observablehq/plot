import {Project} from "ts-morph";
import {it} from "vitest";
import assert from "./assert.js";

it("ScaleOptions.transform accepts null under strictNullChecks", () => {
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {strictNullChecks: true, noEmit: true}
  });
  project.addSourceFilesAtPaths("src/**/*.d.ts");
  project.createSourceFile(
    "check-scale-transform-null.ts",
    `import type {ScaleOptions} from "./src/scales.js";
const options: ScaleOptions = {interval: "6 hours", transform: null};
`
  );
  const diagnostics = project
    .getPreEmitDiagnostics()
    .filter((d) => d.getSourceFile()?.getFilePath().endsWith("check-scale-transform-null.ts"))
    .map((d) => String(d.getMessageText()));
  assert.deepStrictEqual(diagnostics, []);
});

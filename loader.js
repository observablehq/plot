import {transform, applySourceMap, installSourceMapSupport, resolveTsPath} from "@esbuild-kit/core-utils";
import {getTsconfig} from "get-tsconfig";

const sourcemaps = installSourceMapSupport();
const tsExtensionsPattern = /\.([cm]?ts|[tj]sx)$/;
const tsconfig = getTsconfig();
const tsconfigRaw = tsconfig?.config;

export async function resolve(specifier, context, defaultResolve) {
  const tsPath = resolveTsPath(specifier);
  if (tsPath) {
    try {
      return await resolve(tsPath, context, defaultResolve, true);
    } catch (error) {
      if (error.code !== "ERR_MODULE_NOT_FOUND") {
        throw error;
      }
    }
  }
  const resolved = await defaultResolve(specifier, context, defaultResolve);
  return resolved.format === undefined ? {...resolved, format: "module"} : resolved;
}

export async function load(url, context, defaultLoad) {
  const loaded = await defaultLoad(url, context, defaultLoad);
  if (tsExtensionsPattern.test(url)) {
    const code = loaded.source.toString();
    const transformed = await transform(code, url, {tsconfigRaw});
    return {
      format: "module",
      source: applySourceMap(transformed, url, sourcemaps)
    };
  }
  return loaded;
}

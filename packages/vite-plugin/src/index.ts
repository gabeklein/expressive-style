import { relative } from "path";
import { ModuleGraph, Plugin } from "vite";

import { transform, TransformOptions, TransformResult } from "./transform";

const VIRTUAL_CSS = "\0virtual:css:";
const CSS_MODULE_IMPORT = "__EXPRESSIVE_CSS_MODULE__";

const getCssId = (path: string) => VIRTUAL_CSS + localize(path) + ".css";
const getCssModuleId = (path: string) => localize(path) + ".module.css";
const localize = (path: string) => {
  const cwd = process.cwd();
  return path.startsWith(cwd) ? "/" + relative(cwd, path) : path;
};

const DEFAULT_SHOULD_TRANSFORM = (id: string) =>
  !/node_modules/.test(id) && id.endsWith(".jsx");

export interface Options {
  test?: RegExp | ((uri: string) => boolean);
  cssModules?: boolean;
  transform?: TransformOptions;
}

function jsxPlugin(options: Options = {}): Plugin {
  const { test, cssModules } = options;
  const transformOptions = options.transform || {};

  if (cssModules)
    transformOptions.cssModule = CSS_MODULE_IMPORT;

  const accept: (id: string) => boolean =
    typeof test == "function"
      ? test
      : test instanceof RegExp
      ? (id) => test.test(id)
      : DEFAULT_SHOULD_TRANSFORM;

  const CACHE = new Map<string, TransformResult>();
  let moduleGraph!: ModuleGraph;

  async function transformCache(id: string, code: string) {
    const result = await transform(id, code, transformOptions);

    if (!cssModules && result.css)
      result.code += `\nimport "__EXPRESSIVE_CSS__";`;

    CACHE.set(id, result);
    CACHE.set(cssModules ? getCssModuleId(id) : getCssId(id), result);

    return result;
  }

  return {
    name: "expressive-jsx-plugin",
    enforce: "pre",
    configureServer(server) {
      moduleGraph = server.moduleGraph;
    },
    resolveId(id, importer = "") {
      if (id === "__EXPRESSIVE_CSS__") return getCssId(importer);
      if (id === CSS_MODULE_IMPORT && importer) return getCssModuleId(importer);
    },
    load(path: string) {
      const cached = CACHE.get(path);

      if (!cached) return;

      if (path.startsWith(VIRTUAL_CSS) || path.endsWith(".module.css"))
        return cached.css;
    },
    async transform(code, id) {
      if (id.startsWith(VIRTUAL_CSS)) {
        const result = CACHE.get(id);
        return result ? result.css : null;
      }

      // Let Vite's CSS plugin handle CSS modules
      if (id.endsWith(".module.css")) return null;

      const result = CACHE.get(id);

      if (result) return result;

      if (accept(id)) return transformCache(id, code);

      return null;
    },
    async handleHotUpdate(context) {
      const { file, modules } = context;
      const cached = CACHE.get(file);

      if (!cached) return;

      const source = await context.read();
      const result = await transformCache(file, source);

      if (cached.code == result.code) modules.pop();

      if (cached.css == result.css) return;

      const cssId = cssModules ? getCssModuleId(file) : getCssId(file);
      const cssMod = moduleGraph.getModuleById(cssId);

      if (cssMod) modules.push(cssMod);
    },
  };
}

export { jsxPlugin as default, jsxPlugin };

import { relative } from "path";
import { HotChannel, Plugin } from "vite";

import { log } from "./log";
import {
  shouldTransform,
  transform,
  TransformOptions,
  TransformResult,
} from "./transform";

const VIRTUAL = "virtual:css:";
const RESOLVED = "\0" + VIRTUAL;

const ext = (module?: boolean) => module ? ".module.css" : ".css";
const getCssId = (path: string, module?: boolean) => RESOLVED + localize(path) + ext(module);
const getCssImport = (path: string, module?: boolean) => VIRTUAL + localize(path) + ext(module);

const localize = (path: string) => {
  const cwd = process.cwd();
  return path.startsWith(cwd) ? "/" + relative(cwd, path) : path;
};

const stripQuery = (id: string) => id.split("?")[0];

interface CacheEntry extends TransformResult {
  source: string;
}

export interface PluginOptions extends TransformOptions {
  cssModules?: boolean;
}

function jsxPlugin(options: PluginOptions = {}): Plugin {
  const { cssModules, ...transformOptions } = options;
  const accept = shouldTransform(options);

  const CACHE = new Map<string, CacheEntry>();
  let hot: HotChannel | undefined;

  async function transformCache(id: string, source: string) {
    const cssImport = getCssImport(id, cssModules);
    const opts = cssModules
      ? { ...transformOptions, cssModule: cssImport }
      : transformOptions;

    const result = await transform(id, source, opts);
    const cssId = getCssId(id, cssModules);

    if (result.css && !cssModules) {
      result.code = `import "${cssImport}";\n` + result.code;

      log.green("transform", `generated CSS for ${localize(id)}`, {
        cssImport,
        cssLength: result.css.length,
        cssPreview: result.css.slice(0, 120),
      });
    } else {
      log.dim("transform", `no CSS for ${localize(id)}`);
    }

    const entry: CacheEntry = { ...result, source };

    CACHE.set(id, entry);
    CACHE.set(cssId, entry);

    return entry;
  }

  return {
    name: "expressive-jsx-plugin",
    enforce: "pre",
    configureServer(server) {
      hot = server.hot;
      log.cyan("init", "configureServer called");
    },
    resolveId(id, importer = "", options) {
      const clean = stripQuery(id);
      const { ssr } = options || {};

      if (clean.startsWith(VIRTUAL)) {
        const resolved = RESOLVED + id.slice(VIRTUAL.length);
        log.gold("resolveId", `"${id}" → ${resolved}`, {
          ssr,
        });
        return resolved;
      }

      if (id === "__EXPRESSIVE_CSS__") {
        const resolved = getCssId(importer);
        log.gold("resolveId", `legacy __EXPRESSIVE_CSS__ → ${resolved}`, {
          importer: localize(importer),
          ssr,
        });
        return resolved;
      }
    },
    load(path: string, options) {
      const clean = stripQuery(path);
      if (!clean.includes(VIRTUAL)) return;

      const cached = CACHE.get(clean);
      const ssr = !!(options as any)?.ssr;

      if (cached && clean.endsWith(".css")) {
        log.green("load", `serving CSS for ${localize(clean)}`, {
          ssr,
          cssLength: cached.css.length,
        });
        return cached.css;
      }

      log.red("load", `CACHE MISS for ${clean.replace("\0", "\\0")}`, { ssr });
    },
    async transform(code, id, options) {
      const ssr = !!(options as any)?.ssr;
      const clean = stripQuery(id);

      const cached = CACHE.get(clean);

      if (cached) {
        if (clean.endsWith(".css")) {
          log.cyan("transform", `returning cached CSS for ${localize(clean)}`, {
            ssr,
          });
          return cached.css;
        }

        if (cached.source === code) {
          log.cyan(
            "transform",
            `returning cached code for ${localize(clean)}`,
            { ssr },
          );
          return cached;
        }

        log.gold(
          "transform",
          `source changed, re-transforming ${localize(id)}`,
          { ssr },
        );
        return transformCache(id, code);
      }

      if (accept(id)) {
        log.gold("transform", `transforming ${localize(id)}`, { ssr });
        return transformCache(id, code);
      }

      return null;
    },
    async handleHotUpdate(context) {
      const { file, modules, server } = context;
      const cached = CACHE.get(file);

      if (!cached) return;

      log.pink("hmr", `file changed: ${localize(file)}`, {
        moduleCount: modules.length,
      });

      const source = await context.read();
      const result = await transformCache(file, source);

      const codeChanged = cached.code !== result.code;
      const cssChanged = cached.css !== result.css;

      log.pink("hmr", `changes detected`, { codeChanged, cssChanged });

      if (!codeChanged && !cssChanged) return [];

      const hmrModules = codeChanged ? [...modules] : [];

      if (cssChanged) {
        const cssId = getCssId(file, cssModules);
        const cssMod = server.moduleGraph.getModuleById(cssId);

        if (cssMod) {
          log.pink("hmr", `server component CSS changed → invalidating module`, {
            cssId: localize(cssId),
          });
          server.moduleGraph.invalidateModule(cssMod);
          hmrModules.push(cssMod);
        }
        else if (hot) {
          log.pink("hmr", `server component CSS changed → full-reload`);
          hot?.send?.({ type: "full-reload", path: "*" });
        }
      }

      return hmrModules;
    },
  };
}

export type Options = PluginOptions;
export { jsxPlugin as default, jsxPlugin };

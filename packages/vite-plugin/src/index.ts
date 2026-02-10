import { relative } from "path";
import { ModuleGraph, Plugin } from "vite";

import { shouldTransform, transform, TransformOptions, TransformResult } from "./transform";

const VIRTUAL_PREFIX = "virtual:css:";
const RESOLVED_PREFIX = "\0" + VIRTUAL_PREFIX;

const getCssId = (path: string) => RESOLVED_PREFIX + localize(path) + ".css";
const getCssImport = (path: string) => VIRTUAL_PREFIX + localize(path) + ".css";

const localize = (path: string) => {
  const cwd = process.cwd();
  return path.startsWith(cwd) ? "/" + relative(cwd, path) : path;
};

const stripQuery = (id: string) => id.split("?")[0];

interface CacheEntry extends TransformResult {
  source: string;
}

// ── Diagnostic logging ──────────────────────────────────────────────
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";

function log(hook: string, color: string, msg: string, extra?: Record<string, unknown>) {
  const now = new Date();
  const t = `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
  const parts = [`${DIM}${t}${RESET}`, `${MAGENTA}[expressive]${RESET}`, `${color}${hook}${RESET}`, msg];
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      parts.push(`${DIM}${k}=${JSON.stringify(v)}${RESET}`);
    }
  }
  console.log(parts.join(" "));
}
// ─────────────────────────────────────────────────────────────────────

export interface PluginOptions extends TransformOptions {
}

function jsxPlugin(options: PluginOptions = {}): Plugin {
  const accept = shouldTransform(options);

  const CACHE = new Map<string, CacheEntry>();
  let moduleGraph!: ModuleGraph;

  async function transformCache(id: string, source: string) {
    const result = await transform(id, source, options);
    const cssId = getCssId(id);

    if (result.css) {
      const cssImport = getCssImport(id);
      result.code += `\nimport "${cssImport}";`;

      log("transform", GREEN, `generated CSS for ${localize(id)}`, {
        cssImport,
        cssLength: result.css.length,
        cssPreview: result.css.slice(0, 120),
      });
    } else {
      log("transform", DIM, `no CSS for ${localize(id)}`);
    }

    const entry: CacheEntry = { ...result, source };

    CACHE.set(id, entry);
    CACHE.set(cssId, entry);

    return entry;
  }

  function invalidateCssModule(fileId: string) {
    if (!moduleGraph) return null;

    const cssId = getCssId(fileId);
    const cssModule = moduleGraph.getModuleById(cssId);

    if (cssModule) {
      moduleGraph.invalidateModule(cssModule);
      log("hmr", MAGENTA, `invalidated CSS module ${localize(cssId)}`);
    }

    return cssModule;
  }

  return {
    name: "expressive-jsx-plugin",
    enforce: "pre",
    configureServer(server) {
      moduleGraph = server.moduleGraph;
      log("init", CYAN, "configureServer called");
    },
    resolveId(id, importer = "", options) {
      const clean = stripQuery(id);

      if (clean.startsWith(VIRTUAL_PREFIX)) {
        const resolved = RESOLVED_PREFIX + clean.slice(VIRTUAL_PREFIX.length);
        log("resolveId", YELLOW, `"${clean}" → resolved`, {
          ssr: !!(options as any)?.ssr,
        });
        return resolved;
      }

      if (id === "__EXPRESSIVE_CSS__") {
        const resolved = getCssId(importer);
        log("resolveId", YELLOW, `legacy __EXPRESSIVE_CSS__ → resolved`, {
          importer: localize(importer),
          ssr: !!(options as any)?.ssr,
        });
        return resolved;
      }
    },
    load(path: string, options) {
      const clean = stripQuery(path);
      if (!clean.includes(VIRTUAL_PREFIX)) return;

      const cached = CACHE.get(clean);
      const ssr = !!(options as any)?.ssr;

      if (cached && clean.endsWith(".css")) {
        log("load", GREEN, `serving CSS for ${localize(clean)}`, {
          ssr,
          cssLength: cached.css.length,
        });
        return cached.css;
      }

      log("load", RED, `CACHE MISS for ${clean.replace("\0", "\\0")}`, { ssr });
    },
    async transform(code, id, options) {
      const ssr = !!(options as any)?.ssr;
      const clean = stripQuery(id);

      const cached = CACHE.get(clean);

      if (cached) {
        // Virtual CSS modules — always return from cache
        if (clean.endsWith(".css")) {
          log("transform", CYAN, `returning cached CSS for ${localize(clean)}`, { ssr });
          return cached.css;
        }

        // JSX file — check if source changed since last transform
        if (cached.source === code) {
          log("transform", CYAN, `returning cached code for ${localize(clean)}`, { ssr });
          return cached;
        }

        // Source changed! Re-transform.
        log("transform", YELLOW, `source changed, re-transforming ${localize(id)}`, { ssr });
        invalidateCssModule(clean);
        return transformCache(id, code);
      }

      if (accept(id)) {
        log("transform", YELLOW, `transforming ${localize(id)}`, { ssr });
        return transformCache(id, code);
      }

      return null;
    },
    async handleHotUpdate(context) {
      const { file, modules } = context;
      const cached = CACHE.get(file);

      if (!cached) return;

      log("hmr", MAGENTA, `file changed: ${localize(file)}`);

      const source = await context.read();
      const result = await transformCache(file, source);

      const codeChanged = cached.code !== result.code;
      const cssChanged = cached.css !== result.css;

      log("hmr", MAGENTA, `changes detected`, { codeChanged, cssChanged });

      if (!codeChanged && !cssChanged) return [];

      const updates = codeChanged ? [...modules] : [];

      if (cssChanged) {
        const cssModule = invalidateCssModule(file);
        if (cssModule) updates.push(cssModule);
      }

      log("hmr", MAGENTA, `sending ${updates.length} module(s) for HMR`);
      return updates;
    },
  };
}

export { jsxPlugin as default, jsxPlugin };

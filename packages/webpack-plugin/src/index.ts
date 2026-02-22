import JSXPreset from "@expressive/babel-preset";
import VirtualModulesPlugin from "webpack-virtual-modules";
import type { Compiler } from "webpack";

import { log } from "./log";

const BABEL_LOADER = require.resolve("babel-loader");

export interface Options extends JSXPreset.Options {
  test?: RegExp | ((uri: string) => boolean);
}

declare namespace ExpressiveJSXPlugin {
  export { Options };
}

function shouldTransform(test: Options["test"]): (id: string) => boolean {
  if (typeof test === "function") return test;
  if (test instanceof RegExp) return (id: string) => test.test(id);

  return (id: string) => !/node_modules/.test(id) && /\.jsx$/.test(id);
}

class ExpressiveJSXPlugin {
  constructor(private options: Options = {}) {}

  apply(compiler: Compiler) {
    const { test, ...presetOptions } = this.options;
    const virtual = new VirtualModulesPlugin();
    const accept = shouldTransform(test);

    // Persistent across compilations for change detection
    const cssCache = new Map<string, string>();

    const target = compiler.options.target;
    const ssr =
      target === "node" || (Array.isArray(target) && target.includes("node"));

    virtual.apply(compiler);

    log.cyan("init", "plugin applied", { target, ssr });

    compiler.hooks.compilation.tap("ExpressiveJSXPlugin", (compilation) => {
      // Scoped per-compilation so files are re-processed on HMR rebuilds
      const handled = new Set<string>();

      const { loader } =
        compiler.webpack.NormalModule.getCompilationHooks(compilation);

      loader.tap("ExpressiveJSXPlugin", (_context: any, module) => {
        const { resource } = module;

        if (handled.has(resource) || !accept(resource)) return;

        handled.add(resource);

        const cssModule = resource + ".module.css";

        log.gold("loader", resource, { ssr });

        // Pre-register so the path exists when webpack resolves the import
        virtual.writeModule(cssModule, "");

        function afterLoader({ metadata }: { metadata: JSXPreset.Meta }) {
          const { css } = metadata;
          const prev = cssCache.get(resource);

          if (css) {
            cssCache.set(resource, css);
            virtual.writeModule(cssModule, css);

            if (prev === css) {
              log.dim("css", `unchanged ${resource}`);
            } else {
              log.green("css", resource, { ssr });
            }
          } else if (prev) {
            cssCache.delete(resource);
            virtual.writeModule(cssModule, "");
            log.gold("css", `removed ${resource}`);
          }
        }

        module.loaders.push({
          type: null,
          ident: null,
          loader: BABEL_LOADER,
          options: {
            presets: [[JSXPreset, { ...presetOptions, cssModule }]],
            plugins: [{ post: afterLoader }],
          },
        });
      });
    });
  }
}

export default ExpressiveJSXPlugin;

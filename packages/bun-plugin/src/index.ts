import type { BunPlugin, Loader } from "./bun";
import { createCssStore } from "./css";
import { shouldTransform, transform, type TransformOptions } from "./transform";

declare const Bun: {
  file(path: string): { text(): Promise<string> };
};

export interface PluginOptions extends TransformOptions {
  cssModules?: boolean;
}

export function expressiveJSX(options: PluginOptions = {}): BunPlugin {
  const { cssModules = false, ...transformOptions } = options;
  const filter = /^(?!.*\/node_modules\/).*\.(jsx|tsx)$/;
  const accept = shouldTransform(options);
  const store = createCssStore();

  return {
    name: "expressive-bun-style-plugin",
    target: "browser",
    setup(build) {
      store.setup(build);

      build.onLoad({ filter, namespace: "file" }, async (args) => {
        if (!accept(args.path)) return;

        const source = await Bun.file(args.path).text();
        const loader = args.loader as Loader;

        if (cssModules) {
          const cssModuleId = store.cssModuleIdFor(args.path, source);
          const result = await transform(args.path, source, {
            ...transformOptions,
            cssModule: cssModuleId,
          });

          if (result.css)
            store.registerCssModule(cssModuleId, args.path, result.css);

          return { contents: result.code, loader };
        }

        const result = await transform(args.path, source, transformOptions);

        if (!result.css)
          return { contents: result.code, loader };

        const cssId = store.registerCss(args.path, result.css);

        return {
          contents: `import ${JSON.stringify(cssId)};\n${result.code}`,
          loader,
        };
      });
    },
  };
}

export type Options = PluginOptions;
export default expressiveJSX();

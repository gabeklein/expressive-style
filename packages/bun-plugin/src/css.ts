import type { BunBuild } from "./bun";

const CSS_NAMESPACE = "expressive-css";
const CSS_MODULE_NAMESPACE = "expressive-css-module";
const CSS_PREFIX = `${CSS_NAMESPACE}:`;
const CSS_MODULE_PREFIX = `${CSS_MODULE_NAMESPACE}:`;
const CLASS_NAME = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g;

interface CssModuleEntry {
  cssId: string;
  classes: Record<string, string>;
}

export function createCssStore() {
  const cssById = new Map<string, string>();
  const modulesById = new Map<string, CssModuleEntry>();

  function virtualId(prefix: string, filePath: string, content: string, ext: string) {
    return `${prefix}${encodeURIComponent(filePath)}${ext}?v=${hash(content)}`;
  }

  return {
    cssModuleIdFor(filePath: string, source: string) {
      return virtualId(CSS_MODULE_PREFIX, filePath, source, ".js");
    },

    registerCss(filePath: string, css: string) {
      const id = virtualId(CSS_PREFIX, filePath, css, ".css");
      cssById.set(id, css);
      return id;
    },

    registerCssModule(cssModuleId: string, filePath: string, css: string) {
      const cssId = this.registerCss(filePath, css);
      modulesById.set(cssModuleId, { cssId, classes: extractClasses(css) });
    },

    setup(build: BunBuild) {
      build.onResolve({ filter: new RegExp(`^${CSS_PREFIX}`) }, (args) => ({
        path: args.path,
        namespace: CSS_NAMESPACE,
      }));

      build.onResolve({ filter: new RegExp(`^${CSS_MODULE_PREFIX}`) }, (args) => ({
        path: args.path,
        namespace: CSS_MODULE_NAMESPACE,
      }));

      build.onLoad({ filter: /.*/, namespace: CSS_NAMESPACE }, (args) => ({
        contents: cssById.get(args.path) ?? "",
        loader: "css",
      }));

      build.onLoad({ filter: /.*/, namespace: CSS_MODULE_NAMESPACE }, (args) => {
        const entry = modulesById.get(args.path);

        if (!entry)
          return { contents: "export default {};", loader: "js" };

        return {
          contents:
            `import ${JSON.stringify(entry.cssId)};\n` +
            `export default ${JSON.stringify(entry.classes)};`,
          loader: "js",
        };
      });
    },
  };
}

function extractClasses(css: string) {
  const classes: Record<string, string> = {};
  let match: RegExpExecArray | null;

  while ((match = CLASS_NAME.exec(css)))
    classes[match[1]] = match[1];

  return classes;
}

function hash(input: string) {
  let h = 5381;

  for (let i = 0; i < input.length; i++)
    h = ((h << 5) + h) ^ input.charCodeAt(i);

  return (h >>> 0).toString(36);
}

# Plan: Ship `@expressive/bun-plugin`

Date: 2026-05-17

## Goal

Create a Bun-native integration for Expressive JSX that gives Bun users the same core behavior as `@expressive/vite-plugin`:

- transform JSX/TSX files through `@expressive/babel-preset`
- extract generated CSS at build time
- inject the extracted CSS into Bun's browser bundle with zero application runtime dependency
- support Bun's HTML/static/fullstack development server through `bunfig.toml`
- support production builds through the `Bun.build()` JavaScript API

This should be a dedicated package, likely:

```txt
packages/bun-plugin/
```

Package name:

```txt
@expressive/bun-plugin
```

## Current Project Facts

The Expressive JSX architecture is already portable:

- `packages/vite-plugin/src/transform.ts` calls Babel with `@expressive/babel-preset`.
- The transform returns `{ code, map, css }`.
- The Vite plugin is mostly adapter glue: cache transform output, inject a virtual CSS import, serve virtual CSS, and integrate with Vite HMR.
- The Babel preset already supports a `cssModule` option. When set, it injects an import of the generated CSS module and references `css.<className>` values in JSX.

Relevant current files:

```txt
packages/vite-plugin/src/index.ts
packages/vite-plugin/src/transform.ts
packages/babel-preset/src/index.ts
packages/babel-preset/src/cssPlugin/index.ts
packages/rollup-plugin-jsx/src/index.ts
packages/webpack-plugin/src/index.ts
```

## Bun API Facts To Design Around

As of 2026-05-17, Bun supports bundler plugins with:

- `setup(build)`
- `build.onResolve()`
- `build.onLoad()`
- `build.onStart()`
- `build.onEnd()`
- `target?: "browser" | "bun" | "node"`
- custom namespaces for virtual modules

Bun's HTML/static/fullstack dev server can load bundler plugins from:

```toml
[serve.static]
plugins = ["@expressive/bun-plugin"]
```

Bun supports CSS Modules with `.module.css` imports.

Important limitation: Bun docs currently say plugins configured through `[serve.static]` work for static route bundling, and plugins work in `Bun.build()`'s JavaScript API, but are not yet supported through the `bun build` CLI plugin config path. For production builds that need this plugin, document a `build.ts` using `Bun.build({ plugins: [...] })`.

Primary docs:

- https://bun.com/docs/bundler/plugins
- https://bun.com/docs/bundler/fullstack
- https://bun.com/docs/bundler/html-static
- https://bun.com/docs/bundler/css

## Non-Goals

- Do not try to run Vite plugins inside Bun.
- Do not mimic Vite's `configureServer`, `moduleGraph`, or `handleHotUpdate` APIs.
- Do not add SSR support beyond what Bun's browser bundler path naturally supports.
- Do not rewrite the Babel preset.
- Do not add a runtime CSS injector unless the CSS import path cannot work.
- Do not solve TypeScript language service/editor support here. That remains in `packages/typescript-plugin-jsx`.

## Proposed User Experience

### Dev Server Usage

Install:

```sh
bun add -d @expressive/bun-plugin
```

Configure:

```toml
# bunfig.toml
[serve.static]
plugins = ["@expressive/bun-plugin"]
```

Then run a Bun HTML app normally:

```sh
bun ./src/index.html
```

Or in a fullstack Bun app:

```ts
import { serve } from "bun";
import index from "./index.html";

serve({
  routes: {
    "/*": index,
  },
  development: {
    hmr: true,
  },
});
```

### Custom Options Usage

Because `bunfig.toml` plugin entries are strings, custom options should use a local wrapper file:

```ts
// expressive.bun.ts
import { expressiveJSX } from "@expressive/bun-plugin";

export default expressiveJSX({
  test: /\.[jt]sx?$/,
  cssModules: false,
});
```

```toml
[serve.static]
plugins = ["./expressive.bun.ts"]
```

### Production Build Usage

Until Bun supports plugin config for the `bun build` CLI path, document a build script:

```ts
// build.ts
import { expressiveJSX } from "@expressive/bun-plugin";

await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  target: "browser",
  minify: true,
  sourcemap: "linked",
  plugins: [expressiveJSX()],
});
```

Run:

```sh
bun ./build.ts
```

## Package Layout

Add:

```txt
packages/bun-plugin/
├── package.json
├── tsup.config.ts
├── CHANGELOG.md
├── README.md
├── types/
│   └── index.d.ts              # only if needed; prefer generated d.ts
└── src/
    ├── index.ts                # Bun plugin entry
    ├── transform.ts            # copy/adapt shared Vite transform
    ├── ids.ts                  # virtual CSS id helpers
    ├── hash.ts                 # small stable hash helper
    └── tests/
        ├── basic.test.ts
        ├── css-module.test.ts
        ├── hmr-id.test.ts
        └── build.test.ts
```

Optional future cleanup:

```txt
packages/build-transform/
```

The Vite, Bun, Rollup, Webpack, and Parcel packages all duplicate some version of the Babel transform wrapper. A shared internal package would reduce drift, but it is not required for the first Bun plugin.

## API Design

```ts
import type { BunPlugin } from "bun";
import type BabelPreset from "@expressive/babel-preset";

export interface PluginOptions extends BabelPreset.Options {
  test?: RegExp | ((uri: string) => boolean);
  cssModules?: boolean;
}

export function expressiveJSX(options?: PluginOptions): BunPlugin;

declare const plugin: BunPlugin;
export default plugin;
```

Default export must be a zero-config plugin object so this works:

```toml
[serve.static]
plugins = ["@expressive/bun-plugin"]
```

Named factory must support options:

```ts
import { expressiveJSX } from "@expressive/bun-plugin";
export default expressiveJSX({ cssModules: true });
```

## Core Implementation Strategy

Use Bun's plugin model directly:

1. `onLoad` intercepts source files.
2. The plugin runs the existing Babel transform.
3. If CSS is generated, store CSS in an in-memory map under a virtual CSS specifier.
4. Prepend an import of that virtual CSS specifier to the transformed code.
5. `onResolve` maps virtual CSS imports into a custom namespace.
6. `onLoad` for that namespace returns the generated CSS with loader `"css"`.

### Minimal Non-CSS-Modules Flow

```ts
build.onLoad({ filter: /\.[jt]sx?$/, namespace: "file" }, async args => {
  if (!accept(args.path)) return;

  const source = await Bun.file(args.path).text();
  const result = await transform(args.path, source, transformOptions);

  if (!result.css) {
    return {
      contents: result.code,
      loader: args.loader,
    };
  }

  const cssId = createVirtualCssId(args.path, result.css, false);
  cssById.set(cssId, result.css);

  return {
    contents: `import ${JSON.stringify(cssId)};\n${result.code}`,
    loader: args.loader,
  };
});
```

### Virtual CSS Flow

```ts
build.onResolve({ filter: /^expressive-css:/ }, args => ({
  path: args.path,
  namespace: "expressive-css",
}));

build.onLoad({ filter: /.*/, namespace: "expressive-css" }, args => {
  return {
    contents: cssById.get(args.path) ?? "",
    loader: "css",
  };
});
```

## Virtual Module ID Strategy

Vite currently uses:

```txt
virtual:css:<path>.css
\0virtual:css:<path>.css
```

Bun should use a Bun-specific specifier to avoid coupling to Vite conventions:

```txt
expressive-css:<encoded-file-path>.css?v=<content-hash>
expressive-css:<encoded-file-path>.module.css?v=<content-hash>
```

Reasons:

- The `expressive-css:` prefix is easy to match in `onResolve`.
- Encoded file paths avoid bad characters in module specifiers.
- The CSS content hash makes the import ID change when CSS changes.
- The hash is the Bun replacement for Vite's `handleHotUpdate`/module graph invalidation.

Recommended helpers:

```ts
export const CSS_NAMESPACE = "expressive-css";
export const CSS_PREFIX = "expressive-css:";

export function createVirtualCssId(
  filePath: string,
  css: string,
  cssModules: boolean,
) {
  const encoded = encodeURIComponent(filePath);
  const ext = cssModules ? ".module.css" : ".css";
  return `${CSS_PREFIX}${encoded}${ext}?v=${hash(css)}`;
}
```

Hash requirements:

- stable across platforms
- short enough for readable module IDs
- no dependency required

Example:

```ts
export function hash(input: string) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}
```

## CSS Modules Strategy

Support two modes:

### Mode 1: Default Global CSS

This matches the current Vite default:

- Babel generates literal class names.
- Plugin prepends `import "expressive-css:...css?v=<hash>"`.
- Bun bundles the generated CSS as regular CSS.

This should be the default.

### Mode 2: CSS Modules

When `cssModules: true`:

- compute a virtual `.module.css` import ID
- pass that ID to the Babel preset as `cssModule`
- Babel injects `import css from "<virtual-id>"`
- JSX references `css.<generatedClass>`
- Bun's CSS Modules bundler should turn the virtual `.module.css` into a class map

Pseudo-code:

```ts
const cssId = createVirtualCssId(args.path, result.css, true);
const presetOptions = cssModules
  ? { ...transformOptions, cssModule: cssId }
  : transformOptions;

const result = await transform(args.path, source, presetOptions);
cssById.set(cssId, result.css);
```

Risk:

Bun's CSS Modules support is documented for real `.module.css` files. Verify it also works for virtual CSS modules returned from `onLoad({ loader: "css" })` when the virtual path ends in `.module.css`.

Fallback if Bun does not module-map virtual CSS:

1. Keep default global CSS as the supported path.
2. Mark `cssModules: true` as experimental.
3. Investigate returning a JS module that exports the class map and separately imports regular virtual CSS. This requires matching whatever class names Bun generates, so it is not ideal.

## HMR Strategy

Do not port Vite's `handleHotUpdate`.

Vite-specific behavior currently does:

- read changed file
- recompute transform
- compare previous and next code/CSS
- invalidate Vite module graph entries
- send full reload if needed

Bun does not expose the same plugin-level dev-server module graph API.

Instead:

- keep virtual CSS imports inside transformed JS
- include a content hash in the virtual CSS ID
- when source changes and generated CSS changes, the transformed JS changes too
- Bun's normal browser HMR sees the changed JS module and refreshes/reloads as needed

Acceptance criteria:

- changing component markup updates browser
- changing Expressive CSS labels updates browser styling
- changing only a CSS value changes the transformed module because the injected import hash changes
- if CSS changes but transformed JSX output would otherwise be identical, the hash still forces a module update

## Sourcemap Strategy

The existing transform returns `map`, but Bun's `onLoad` return type currently accepts source contents and loader, not a Rollup/Vite-style `{ code, map }` transform result.

Initial approach:

- return `contents: result.code`
- rely on Bun's own source maps for the post-Babel code path
- document this as a limitation for the first release

Follow-up:

- inspect whether current Bun versions support plugin-provided source maps through `onLoad`
- if not, consider inline source map comments generated from Babel's `result.map`

Do not block the initial plugin on perfect source maps unless tests show debugging is unusable.

## File Filter Strategy

Reuse the Vite package behavior:

```ts
export function shouldTransform(options: TransformOptions) {
  const { test } = options;

  if (typeof test === "function") return test;
  if (test instanceof RegExp) return (id: string) => test.test(id);

  return (id: string) =>
    !/node_modules/.test(id) && /\.[jt]sx?$/.test(id);
}
```

Open question:

`AGENTS.md` says "No TSX support" in the gotchas, but the current Vite `shouldTransform()` accepts `.tsx`. Before release, verify the actual preset behavior on `.tsx` and align docs/tests with reality.

Recommended first release default:

- match current Vite package for compatibility
- add explicit tests for `.jsx`, `.tsx`, and `.ts`
- if `.tsx` is not supported, change the default filter to `.jsx` and document why

## Implementation Steps

### Phase 1: Scaffold Package

Create:

```txt
packages/bun-plugin/package.json
packages/bun-plugin/tsup.config.ts
packages/bun-plugin/src/index.ts
packages/bun-plugin/src/transform.ts
packages/bun-plugin/src/ids.ts
packages/bun-plugin/src/hash.ts
packages/bun-plugin/README.md
packages/bun-plugin/CHANGELOG.md
```

`package.json` should mirror the Vite plugin style but depend on Bun types instead of Vite:

```json
{
  "name": "@expressive/bun-plugin",
  "version": "0.8.0",
  "description": "Expressive JSX Bun Plugin",
  "type": "module",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest"
  },
  "dependencies": {
    "@babel/core": "^7.22.20",
    "@expressive/babel-preset": "workspace:*",
    "@expressive/css": "workspace:*"
  },
  "devDependencies": {
    "@types/babel__core": "^7.20.2",
    "@types/bun": "latest",
    "tsup": "^8.0.1",
    "vitest": "^1.5.0"
  },
  "peerDependencies": {
    "bun": ">=1.3.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

Note:

`bun` is not a normal npm runtime dependency. If the package manager complains about a `bun` peer dependency, remove it and document the minimum Bun version in the README instead.

### Phase 2: Port Transform Wrapper

Copy/adapt `packages/vite-plugin/src/transform.ts`.

Keep:

- `@babel/core`
- `@expressive/babel-preset`
- `@expressive/css`
- default macro injection
- source parser options
- `shouldTransform()`

Remove:

- Vite-specific imports/types

### Phase 3: Implement Bun Plugin

Core responsibilities in `src/index.ts`:

- split `cssModules` from transform options
- initialize `Map<string, string>` for virtual CSS
- register `onResolve` for `expressive-css:`
- register `onLoad` for `expressive-css` namespace
- register `onLoad` for source files
- read source with `Bun.file(args.path).text()`
- call transform
- store CSS
- return transformed code with CSS import

Recommended implementation skeleton:

```ts
import type { BunPlugin, Loader } from "bun";
import {
  shouldTransform,
  transform,
  type TransformOptions,
} from "./transform";
import {
  CSS_NAMESPACE,
  CSS_PREFIX,
  createVirtualCssId,
} from "./ids";

export interface PluginOptions extends TransformOptions {
  cssModules?: boolean;
}

export function expressiveJSX(options: PluginOptions = {}): BunPlugin {
  const { cssModules = false, ...transformOptions } = options;
  const accept = shouldTransform(options);
  const cssById = new Map<string, string>();

  return {
    name: "expressive-jsx-bun-plugin",
    target: "browser",
    setup(build) {
      build.onResolve({ filter: /^expressive-css:/ }, args => ({
        path: args.path,
        namespace: CSS_NAMESPACE,
      }));

      build.onLoad({ filter: /.*/, namespace: CSS_NAMESPACE }, args => ({
        contents: cssById.get(args.path) ?? "",
        loader: "css",
      }));

      build.onLoad({ filter: /\.[jt]sx?$/, namespace: "file" }, async args => {
        if (!accept(args.path)) return;

        const source = await Bun.file(args.path).text();

        if (cssModules) {
          const provisionalCssId = createVirtualCssId(args.path, source, true);
          const result = await transform(args.path, source, {
            ...transformOptions,
            cssModule: provisionalCssId,
          });
          const cssId = createVirtualCssId(args.path, result.css, true);

          if (cssId !== provisionalCssId) {
            const finalResult = await transform(args.path, source, {
              ...transformOptions,
              cssModule: cssId,
            });
            cssById.set(cssId, finalResult.css);
            return {
              contents: finalResult.code,
              loader: args.loader as Loader,
            };
          }

          cssById.set(cssId, result.css);
          return {
            contents: result.code,
            loader: args.loader as Loader,
          };
        }

        const result = await transform(args.path, source, transformOptions);

        if (!result.css) {
          return {
            contents: result.code,
            loader: args.loader as Loader,
          };
        }

        const cssId = createVirtualCssId(args.path, result.css, false);
        cssById.set(cssId, result.css);

        return {
          contents: `import ${JSON.stringify(cssId)};\n${result.code}`,
          loader: args.loader as Loader,
        };
      });
    },
  };
}

export default expressiveJSX();
```

Important refinement:

The CSS Modules path above does a provisional transform because the CSS ID includes a hash of generated CSS, but generated code also needs to import the final hash-bearing ID. This can be simplified by not hashing CSS module imports, or by hashing source instead of generated CSS for CSS Modules. Choose one after testing.

Recommended first implementation:

- hash generated CSS for default global CSS mode
- hash source path/source text for CSS Modules mode to avoid double transform

### Phase 4: Add Tests

Prefer tests that call `Bun.build()` directly. They are closer to Bun's actual plugin contract than isolated transform tests.

Create fixtures under:

```txt
packages/bun-plugin/src/tests/fixtures/
```

Test cases:

1. Basic transform
   - entry imports a `.jsx` component
   - Expressive labels are removed from output JS
   - generated class names appear in JS
   - generated CSS appears in build outputs

2. No CSS
   - source with no Expressive styles transforms without injecting virtual CSS

3. CSS change hash
   - same component shape with different CSS value yields different virtual CSS import ID

4. CSS Modules mode
   - `cssModules: true`
   - output uses CSS module mapping
   - verify Bun accepts virtual `.module.css` returned from plugin

5. Filter
   - excludes `node_modules`
   - custom `test` RegExp works
   - custom `test` function works

6. HTML entry
   - `Bun.build({ entrypoints: ["./index.html"], plugins: [expressiveJSX()] })`
   - HTML references a `.tsx` or `.jsx` script
   - CSS is emitted or bundled as expected

7. Dev server smoke test, optional
   - create temp project with `bunfig.toml`
   - run `bun ./index.html`
   - fetch served page/assets
   - only add this if it is stable in CI

Example test pattern:

```ts
import { describe, expect, it } from "vitest";
import { expressiveJSX } from "..";

it("bundles extracted CSS through a virtual module", async () => {
  const result = await Bun.build({
    entrypoints: [fixture("basic.jsx")],
    outdir: tempdir(),
    target: "browser",
    plugins: [expressiveJSX()],
  });

  expect(result.success).toBe(true);

  const js = await readOutput(result, ".js");
  const css = await readOutput(result, ".css");

  expect(js).not.toContain("color:");
  expect(js).toContain("className");
  expect(css).toContain("color");
});
```

## README Content

README should include:

- what the package does
- Bun version requirement
- install command
- `bunfig.toml` dev server setup
- custom options wrapper setup
- `Bun.build()` production setup
- note that `bun build` CLI plugin config is not yet supported by Bun
- `cssModules` option
- `test` option
- limitations

Suggested limitations text:

```md
## Limitations

- This package is a Bun-native plugin, not a Vite plugin compatibility layer.
- Bun does not expose Vite's dev-server module graph APIs, so CSS HMR is handled by content-hashed virtual CSS imports.
- Production builds that need this plugin should use `Bun.build({ plugins })`. Bun's CLI plugin configuration for this path is still evolving.
- Source maps are initially best-effort because Bun's plugin `onLoad` API does not expose a Vite/Rollup-style transform map return.
```

## Release Checklist

1. Add package to monorepo.
2. Add package to Lerna/workspace config if needed.
3. Build package with `npm run build` or monorepo build command.
4. Run package tests.
5. Add README examples.
6. Add changelog entry.
7. Verify package exports:
   - ESM import
   - CommonJS require, if keeping CJS build
   - default export plugin object
   - named `expressiveJSX`
8. Test in a real Bun app:
   - `bun ./src/index.html`
   - `Bun.serve()` HTML import route
   - `Bun.build()` JS API production build
9. Publish as `@expressive/bun-plugin`.

## Open Questions Before Coding

1. Should default filtering include `.tsx`?
   - Vite plugin currently does.
   - AGENTS gotcha says no TSX support.
   - Decide based on tests.

2. Should `cssModules` be stable in v1 of the Bun plugin?
   - Bun documents CSS Modules for `.module.css`.
   - Need to verify virtual CSS Modules through `onLoad`.

3. Should the Bun plugin share transform code with Vite?
   - Not required for first release.
   - Worth doing later to avoid differences in macro defaults.

4. Should the plugin default export be zero-config?
   - Recommended yes, because Bun's `bunfig.toml` plugin list expects string module references.

5. How strict should source maps be?
   - Initial release can be best-effort.
   - Revisit after validating Bun's current source map behavior with plugin transforms.

## Acceptance Criteria

The plugin is ready when:

- A Bun React SPA can use Expressive JSX labels without Vite.
- Generated CSS is bundled by Bun as real CSS, not injected by application runtime code.
- `bunfig.toml` usage works with Bun's dev server.
- `Bun.build({ plugins: [expressiveJSX()] })` works for production.
- CSS-only changes cause browser updates during Bun dev server usage.
- Existing Vite plugin behavior remains unchanged.
- README clearly explains the Bun-specific build path and limitations.


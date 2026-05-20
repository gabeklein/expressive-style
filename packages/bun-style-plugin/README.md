# @expressive/bun-style-plugin

Bun-native build plugin for Expressive JSX. It transforms JSX through `@expressive/babel-preset`, extracts generated CSS at build time, and lets Bun bundle that CSS without adding an application runtime dependency.

## Install

```sh
bun add -d @expressive/bun-style-plugin
```

Requires Bun 1.3 or newer.

## Dev Server

For Bun HTML/static/fullstack development, add the package to `bunfig.toml`:

```toml
[serve.static]
plugins = ["@expressive/bun-style-plugin"]
```

Then run your HTML app normally:

```sh
bun ./src/index.html
```

## Custom Options

`bunfig.toml` plugin entries are strings. Use a wrapper module when you need options:

```ts
// expressive.bun.ts
import { expressiveJSX } from "@expressive/bun-style-plugin";

export default expressiveJSX({
  test: /\.[jt]sx?$/,
  cssModules: false,
});
```

```toml
[serve.static]
plugins = ["./expressive.bun.ts"]
```

## Production Builds

Bun's CLI plugin configuration for production builds is still evolving. Use the JavaScript API when a production build needs this plugin:

```ts
import { expressiveJSX } from "@expressive/bun-style-plugin";

await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  target: "browser",
  minify: true,
  sourcemap: "linked",
  plugins: [expressiveJSX()],
});
```

Run it with:

```sh
bun ./build.ts
```

## Options

```ts
import { expressiveJSX } from "@expressive/bun-style-plugin";

expressiveJSX({
  test: /\.[jt]sx?$/,
  cssModules: false,
});
```

- `test`: `RegExp` or `(uri: string) => boolean` filter. Defaults to non-`node_modules` `.js`, `.jsx`, `.ts`, and `.tsx` files.
- `cssModules`: when `true`, generated CSS is exposed through a virtual `.module.css` import and passed to the Babel preset as `cssModule`.
- Other options are passed through to `@expressive/babel-preset`.

## Limitations

- This package is a Bun-native plugin, not a Vite plugin compatibility layer.
- Bun does not expose Vite's dev-server module graph APIs, so CSS HMR is handled by content-hashed virtual CSS imports.
- Production builds that need this plugin should use `Bun.build({ plugins })`.
- Source maps are best-effort because Bun's plugin `onLoad` API does not expose a Vite/Rollup-style transform map return.

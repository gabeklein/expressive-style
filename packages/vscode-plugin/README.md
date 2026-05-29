# Expressive JSX for VS Code

Language support for [Expressive JSX](https://github.com/gabeklein/expressive-jsx) in TypeScript and JavaScript files.

This extension contributes a TypeScript Server Plugin - no separate language server, no activation events. Once installed, `.ts`, `.tsx`, `.js`, and `.jsx` files in your workspace are analyzed by `@expressive@expressive/typescript-plugin-style` automatically via the built-in TypeScript extension.

## How it works

The extension declares a `typescriptServerPlugins` contribution. VS Code's bundled TypeScript extension loads the plugin into its `tsserver` process. There is no `main` entry, no extension activation code, and no runtime cost until you open a TypeScript/JavaScript file.

## Workspace TypeScript

`enableForWorkspaceTypeScriptVersions` is set to `true`, so the plugin also activates when your workspace uses its own TypeScript version (via `typescript.tsdk` or the workspace's `node_modules`).

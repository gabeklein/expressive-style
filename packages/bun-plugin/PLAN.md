# `expressive` CLI - Design & Implementation Plan

> Working document. Delete before merging. Captures the design rationale so it survives across chat sessions.

## Goal

Replace the current `expressive-bun` flag-passthrough CLI with a rigid, convention-driven `expressive` bin that gives users a turn-key React app: zero config files, one entry, `expressive dev` boots a working app with HMR. This is the standalone, lean version. A separate framework project (the Bun successor to `@entangled/vite`) will sit on top of `defineApp` to add file-based API routes, RPC, SSR, etc.

## Context & motivation

- Current `cli.ts` is a thin wrapper over `Bun.build` exposing roughly every flag. Useful but not opinionated.
- The bigger vision: a Next-like full-stack framework where `*/api/*` modules are auto-wired as RPC endpoints (a Vite-based prototype of this exists in a separate project). That work happens in a separate repo and depends on this one.
- This repo's job: ship the **lean opinionated base** - JSX/CSS transform plugin, a dev server, a build command, and a `defineApp` contract that the upstream framework can extend without forking.
- Side benefit: once `expressive dev` / `expressive build` are the entrypoints, the `bunfig.toml` plugin registration becomes legacy. Users never touch a config file.

## Rubicons crossed (and not crossed)

Crossed:
- We are now a CLI tool that boots a dev server, not just a build plugin.
- We define a convention for project layout (`src/main.tsx`, `src/index.ts`).
- We own HMR wiring.

Not crossed (deferred to the framework layer):
- File-based routing (`src/app/` directory mode) - convention reserved, errors in v1.
- File-based API route discovery.
- RPC / virtual `*/api/*` modules.
- SSR / RSC.
- Production server (`expressive start`).
- Multiple entries / routing beyond one HTML page.

## Conventions (rigid first pass)

| Path | Required | Role |
|---|---|---|
| `app.tsx` *or* `src/app.tsx` | one required | Default-exports the root React component. Framework owns `createRoot` + render. HMR boundary. Pure browser context. CLI checks root first, then `src/`; errors if both exist. |
| `app/` | reserved | Routed mode (framework layer). Root only - `src/app/` is **not** a valid alternative. Bun-plugin errors if present in v1. |
| `index.ts` | optional | Server/boot context at root. Default-exports an `AppConfig` (typed via `satisfies AppConfig`). Runs once in Bun. Edits cause dev-server restart, not HMR. Absent = defaults. |
| `index.html` | optional | If present at root, used as HTML entry. If absent, CLI serves a virtual default that references the browser app entry. |
| `dist/` | - | Output dir. Fixed. |

Mental model: **root = server/package perspective, `src/` (optional) = browser subtree.** `index.ts` is the file Bun would naturally run, so it lives at root. `app.tsx` is browser-bundled, so it can live at root *or* under `src/`. Routed `app/` mode is root-only because once you go routed, you've committed to root-level conventions (Next-style).

Justifications:
- **`app.tsx` is the whole point.** User writes a component, framework renders it. No `createRoot` boilerplate, no separate bootstrap file. The CLI wraps with `<StrictMode>` and that's it - providers, error boundaries, etc. live *inside* `App`.
- **`app.tsx` vs `app/` encodes routing intent.** Single file = SPA, single root. Directory = file-based routing (Next-style). The filesystem shape *is* the toggle - no flag, no config. Bun-plugin v1 implements only `app.tsx` mode and errors clearly if `app/` exists, reserving the convention for the framework layer.
- **`index.ts` is the server slot, optional.** Exists precisely because `app.tsx` is browser-only and can't carry server config. Next-`instrumentation.ts` analogue. Absent when not needed - no `defineApp({})` ceremony. Lives at root because it's the file Bun would naturally run.
- **Type via `satisfies`, not a helper.** `export default { ... } satisfies AppConfig` gets full type checking + literal inference without a runtime indirection. `defineApp` is still exported for users who prefer the call form, but docs lead with `satisfies`.
- **No `expressive.config.ts`.** Config-via-default-export. Footgun analysis ruled out static analysis (breaks on any expression) and eval-app.tsx (any top-level browser code crashes). `index.ts` as server-context config carrier sidesteps both.

## CLI surface

```
expressive          # alias for `dev`
expressive dev      # Bun.serve + HMR, port from defineApp or 3000
expressive build    # Bun.build static SPA → dist/
```

No flag passthrough. If a user needs more than `defineApp` exposes, they write their own `Bun.build` / `Bun.serve` script - that's an explicit graduation from the opinionated path.

## `defineApp` contract

Thin passthrough over `Bun.serve` config (superset, not replacement). User retains full Bun.serve power - `routes`, `fetch`, `websocket`, `error`, anything Bun adds later.

```ts
// @expressive/bun-plugin
import type { Serve } from "bun";

export interface AppConfig extends Omit<Serve, "development" | "fetch"> {
  // Allow either route map or fetch; CLI fills in development/HMR.
  // No expressive-specific fields in the first pass.
}

export function defineApp(config: AppConfig): AppConfig {
  return config;
}
```

CLI behavior with the config:
- **dev**: merge `{ development: { hmr: true, console: true }, plugins: [expressiveJSX()] }`, auto-inject `"/*": <html>` route if user didn't define one, call `Bun.serve`.
- **build**: ignore `routes`/`fetch`. Run `Bun.build({ entrypoints: ["src/index.html"], outdir: "dist", plugins: [expressiveJSX()], target: "browser", minify: true, sourcemap: "linked" })`. API routes in `defineApp` are no-ops in build - the framework layer adds `expressive start` for prod servers.

## Example: feather-demo-style usage

```ts
// index.ts (root, optional)
import type { AppConfig } from "@expressive/bun-plugin";

export default {
  routes: {
    "/api/hello": {
      async GET() {
        return Response.json({ message: "Hello, world!" });
      },
    },
    "/api/hello/:name": req =>
      Response.json({ message: `Hello, ${req.params.name}!` }),
  },
} satisfies AppConfig;
```

```tsx
// app.tsx (root) or src/app.tsx
export default function App() {
  return <h1>hi</h1>;
}
```

Minimum viable app is `app.tsx` alone. No `index.ts`, no `index.html`, no `bunfig.toml`, no config file, no `createRoot` call. `expressive dev` boots it.

## File changes

**Modified:**
- `package.json`: `"bin": { "expressive": "dist/cli.js" }`. Drop `expressive-bun`.
- `src/index.ts`: export `defineApp` and `AppConfig`.
- `src/cli.ts`: replace flag parser with subcommand dispatcher. Delegate to `app.ts`.

**New:**
- `src/runtime.ts` (browser-side bootstrap, virtual or shipped):
  - Imports `src/app.tsx`'s default export, wraps in `<StrictMode>`, calls `createRoot(document.getElementById("root")!).render(...)`. This is what the virtual HTML's `<script>` points to.
- `src/serve.ts`:
  - `runDev(cwd)`: resolves browser entry (`./app.tsx` then `./src/app.tsx`, error if both or neither), dynamic-imports `./index.ts` if present (else uses defaults), reads default export, errors if `./app/` exists, merges dev defaults + plugin + virtual HTML, calls `Bun.serve`.
  - `runBuild(cwd)`: same entry/config resolution as `runDev`, calls `Bun.build` with fixed defaults.
  - `resolveEntries(cwd)`: shared resolver. Returns `{ appPath, configPath?, htmlPath? }` or throws with a clear message.
  - `defaultHtml()`: returns the virtual HTML string. Script tag points at the bundled runtime which imports the resolved `app.tsx`.

Net LOC: ~150 added, ~120 removed. Roughly flat.

## Open questions / known unknowns

1. **Virtual HTML + virtual bootstrap wiring in Bun.serve.** Both the HTML shell and the `createRoot` bootstrap that imports `src/app.tsx` are framework-owned and don't exist on disk. Need to either (a) write them to a temp dir, (b) use Bun's `HTMLBundle` programmatic API + a plugin-resolved virtual module for the bootstrap, or (c) ship the bootstrap as a real file in this package and reference it by absolute path. (c) is simplest. Decide during implementation.
2. **HMR and CSS modules.** The babel-emitted CSS needs to participate in HMR. Likely already works via Bun's CSS HMR, but verify in a smoke test.
3. **`index.ts` edits → restart vs HMR.** Bun.serve has no "restart on this file change" hook out of the box. May need `--hot` (`bun --hot`) for the CLI itself, or a manual watcher. Decide during implementation.
4. **Tests.** None in this first pass. Per global rule: after implementation, ask whether tests are wanted before considering done.

## Out of scope (explicit)

- API route discovery from filesystem.
- RPC / `defineService` equivalent.
- Production server.
- Multiple HTML entries / multi-page apps.
- Plugin options pass-through from CLI flags.
- Config file (`expressive.config.ts`).
- Programmatic API beyond `defineApp` + `expressiveJSX`.

## Migration / breaking changes

- Bin renamed: `expressive-bun` → `expressive`. Package is at 0.8.0 and presumably has near-zero external users; treat as breaking but unannounced.
- `bunfig.toml` plugin registration still works (the `expressiveJSX()` export is unchanged). The CLI just makes it unnecessary.

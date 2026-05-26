# `expressive` CLI - Design & Implementation Plan

> Working document. Captures the design rationale so it survives across chat sessions.

## Status

`@expressive/bun-dev` is the first dev-tooling proof of concept. It currently lives in this repo but will migrate out to a dedicated `expressive-dev` monorepo (alongside future `node-dev`, `deno-dev`, shared `dev-core`, and `dev-contract`) once the design stabilizes. Nothing about its public surface should assume permanent residence here.

## Goal

Replace flag-passthrough CLIs with a rigid, convention-driven `expressive` bin that gives users a turn-key React app: zero config files, one entry, `expressive dev` boots a working app with HMR.

This is the lean opinionated base. File-based routing, RPC, SSR, and the full framework story live above this layer (see "Layering" below).

## Layering (big picture)

The wider ecosystem splits along these axes, kept in separate repos so churn in one doesn't bleed into the others:

| Repo | Concern |
|---|---|
| `expressive-state` (existing) | Reactive primitives + renderer adapters (react/preact/solid/web). Foundation. |
| `expressive-jsx` (this repo) | JSX/CSS source transforms, style-contract, bundler plugins (`bun-style-plugin`, webpack/next). |
| `expressive-ui` (future) | Component-based primitives: Router, Form, Dialog, etc. Style-engine-agnostic where possible. Will host `@expressive/router` long term. |
| `expressive-dev` (future) | Dev/build tooling per host: `bun-dev`, `node-dev`, `deno-dev`, file-based routing codegen, file-based RPC codegen, `dev-contract`. Will be `bun-dev`'s permanent home. |
| `expressive-relay` (existing) | RPC protocol, client, server-binding adapters. |
| `expressive-web` (eventual) | DOM reconciler + state adapter. |

Discipline:
- A repo's code changes only when its concern changes. Host change -> only `expressive-dev`. Renderer change -> only `expressive-state` adapters. Style sink change -> only `expressive-jsx`.
- Workspace within a repo, npm across repos. No path-deps across boundaries.
- Contracts live with consumers (style-contract here; dev-contract in expressive-dev).
- Implementations follow the `Runtime` pattern already proven in `expressive-state`: a small injection seam, multiple adapters fulfill it.

`bun-dev` is therefore designed as if it already lived in `expressive-dev`: separate `dev-core` (host-agnostic conventions, resolver, codegen) and `dev-contract` (renderer adapter interface) seams, even while colocated here.

## Rubicons crossed (and not crossed)

Crossed:
- We are now a CLI tool that boots a dev server, not just a build plugin.
- We define a convention for project layout (`app.tsx` / `src/app.tsx`, `index.ts`).
- We own HMR wiring.

Deferred (to `expressive-dev` + framework layer):
- File-based routing (`app/` directory mode). Convention reserved; bun-dev errors if present in v1. Implementation will use `@expressive/router` (Component-based, lives in `expressive-ui` long-term).
- File-based API route discovery (consumes `expressive-relay`).
- RPC / virtual `*/api/*` modules.
- SSR / RSC.
- Production server (`expressive start`).
- Multiple entries / routing beyond one HTML page.

## Conventions (rigid first pass)

| Path | Required | Role |
|---|---|---|
| `app.tsx` *or* `src/app.tsx` | one required | Default-exports the root React component. Framework owns `createRoot` + render. HMR boundary. Pure browser context. CLI checks root first, then `src/`; errors if both exist. |
| `app/` | reserved | Routed mode (future). Root only - `src/app/` is **not** a valid alternative. Errors if present in v1. |
| `index.ts` | optional | Server/boot context at root. Default-exports an `AppConfig` (typed via `satisfies AppConfig`). Runs once in Bun. Edits cause dev-server restart, not HMR. Absent = defaults. |
| `index.html` | optional | If present at root, used as HTML entry. If absent, CLI serves a virtual default that references the browser app entry. |
| `dist/` | - | Output dir. Fixed. |

Mental model: **root = server/package perspective, `src/` (optional) = browser subtree.** `index.ts` is the file Bun would naturally run, so it lives at root. `app.tsx` is browser-bundled, so it can live at root *or* under `src/`. Routed `app/` mode is root-only because once you go routed, you've committed to root-level conventions (Next-style).

Justifications:
- **`app.tsx` is the whole point.** User writes a component, framework renders it. No `createRoot` boilerplate, no separate bootstrap file. CLI wraps with `<StrictMode>` and that's it - providers, error boundaries live *inside* `App`.
- **`app.tsx` vs `app/` encodes routing intent.** Single file = SPA. Directory = file-based routing. The filesystem shape *is* the toggle - no flag, no config.
- **`index.ts` is the server slot, optional.** Exists because `app.tsx` is browser-only and can't carry server config. Next-`instrumentation.ts` analogue.
- **Type via `satisfies`, not a helper.** `export default { ... } satisfies AppConfig` gets full type checking + literal inference without a runtime indirection. `defineApp` is still exported, but docs lead with `satisfies`.
- **No `expressive.config.ts`.** Config-via-default-export.

## CLI surface

```
expressive          # alias for `dev`
expressive dev      # Bun.serve + HMR, port from defineApp or 3000
expressive build    # Bun.build static SPA -> dist/
```

No flag passthrough. Graduation path: write your own `Bun.build` / `Bun.serve` script.

## `defineApp` contract

Thin passthrough over `Bun.serve` config (superset, not replacement). User retains full `Bun.serve` power - `routes`, `fetch`, `websocket`, `error`, anything Bun adds later.

```ts
import type { Serve } from "bun";

export interface AppConfig extends Omit<Serve, "development" | "fetch"> {}

export function defineApp(config: AppConfig): AppConfig {
  return config;
}
```

CLI behavior:
- **dev**: merge `{ development: { hmr: true, console: true }, plugins: [expressiveJSX()] }`, auto-inject `"/*": <html>` route if user didn't define one, call `Bun.serve`.
- **build**: ignore `routes`/`fetch`. Run `Bun.build({ entrypoints: ["src/index.html"], outdir: "dist", plugins: [expressiveJSX()], target: "browser", minify: true, sourcemap: "linked" })`. API routes in `defineApp` are no-ops in build - the framework layer adds `expressive start` for prod servers.

## Example

```ts
// index.ts (root, optional)
import type { AppConfig } from "@expressive/bun-dev";

export default {
  routes: {
    "/api/hello": { async GET() { return Response.json({ message: "Hello, world!" }); } },
    "/api/hello/:name": req => Response.json({ message: `Hello, ${req.params.name}!` }),
  },
} satisfies AppConfig;
```

```tsx
// app.tsx (root) or src/app.tsx
export default function App() {
  return <h1>hi</h1>;
}
```

Minimum viable app: `app.tsx` alone. No `index.ts`, no `index.html`, no `bunfig.toml`, no config file, no `createRoot` call.

## File changes

**Modified:**
- `package.json`: `"bin": { "expressive": "dist/cli.js" }`.
- `src/index.ts`: export `defineApp` and `AppConfig`.
- `src/cli.ts`: subcommand dispatcher delegating to `serve.ts`.

**New:**
- `src/runtime.ts`: browser-side bootstrap. Imports `app.tsx`'s default export, wraps in `<StrictMode>`, calls `createRoot(document.getElementById("root")!).render(...)`. Referenced by the virtual HTML's `<script>`.
- `src/serve.ts`:
  - `runDev(cwd)`: resolves browser entry (`./app.tsx` then `./src/app.tsx`, error if both or neither), dynamic-imports `./index.ts` if present, reads default export, errors if `./app/` exists, merges dev defaults + plugin + virtual HTML, calls `Bun.serve`.
  - `runBuild(cwd)`: same resolution, calls `Bun.build` with fixed defaults.
  - `resolveEntries(cwd)`: shared resolver. Returns `{ appPath, configPath?, htmlPath? }` or throws.
  - `defaultHtml()`: virtual HTML string.

## Shared interface to consumers

`AppConfig` and `defineApp` are useful to projects whether or not they ultimately consume `bun-dev`. Long-term these graduate to a small `@expressive/dev` interface package (zero-dep, types + helper) that `bun-dev` re-exports. Until `expressive-dev` exists, ship them from `@expressive/bun-dev` directly; consumers import from there.

## Open questions

1. **Virtual HTML + virtual bootstrap wiring in `Bun.serve`.** Both the HTML shell and the `createRoot` bootstrap are framework-owned and don't exist on disk. Options: (a) temp dir, (b) `HTMLBundle` programmatic API + plugin-resolved virtual module, (c) ship bootstrap as a real file by absolute path. (c) is simplest; decide during implementation.
2. **HMR and CSS modules.** Babel-emitted CSS needs to participate in HMR. Likely already works via Bun's CSS HMR; verify in smoke test.
3. **`index.ts` edits -> restart vs HMR.** No built-in hook in `Bun.serve`. Options: `bun --hot` for the CLI itself, or manual watcher.
4. **Tests.** None first pass. Per global rule, ask before considering done.

## Out of scope (explicit)

- API route discovery from filesystem.
- RPC / `defineService` equivalent.
- Production server.
- Multiple HTML entries / multi-page apps.
- Plugin options pass-through from CLI flags.
- Config file (`expressive.config.ts`).
- Programmatic API beyond `defineApp` + `expressiveJSX`.
- File-based routing (will be added in `expressive-dev` using `@expressive/router`).

## Migration / breaking changes

- Bin renamed: `expressive-bun` -> `expressive`. Treat as breaking but unannounced (near-zero external users at 0.8.x).
- `bunfig.toml` plugin registration still works (`expressiveJSX()` export unchanged). CLI just makes it unnecessary.
- Package will eventually be republished from `expressive-dev` repo. Name stays `@expressive/bun-dev`.

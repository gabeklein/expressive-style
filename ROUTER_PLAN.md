# `@expressive/router` - Design & Implementation Plan

> Portable plan. Intended initial home: `expressive-state` (mvc) monorepo as `packages/router`. Long-term home: `expressive-ui` (alongside Form, Dialog, etc.). Nothing in the design assumes either location.

## Goal

A client-side router built on `Component` from `@expressive/state`. Headless behavior + overridable rendering. Renderer-agnostic in the same way state itself is: a small core plus thin adapters where the host renderer matters.

Non-goals (v1):
- SSR / streaming.
- Data loaders / route-level data APIs (use `set(async () => ...)` on the page's Component - same mechanism state already provides).
- Server-side route definitions / file-based discovery. That belongs to dev tooling (`expressive-dev`), which consumes this router.

## Why Component is the substrate

`Component` already provides almost every routing primitive:

| Routing need | Component feature |
|---|---|
| Nested layouts | Component children passthrough + auto context provider |
| Access current route from anywhere | `get(Router)` / `get(Route)` |
| Per-route loading state | `fallback` field + Suspense placement |
| Per-route error UI | `catch()` |
| Reactive params | reactive fields + computed getters |
| Subclasses customize rendering | core inheritance pattern |

The router is therefore very small: a `Router` Component that owns location, a `Route` Component that matches a pattern and renders its page, a `Link` Component for navigation. No external router runtime to write. No bespoke Suspense/error machinery.

## Public API

```ts
import {
  Router,
  Route,
  Link,
  useRouter,
  useParams,
  useSearchParams,
  redirect,
  notFound,
} from '@expressive/router';
```

### `Router`

Headless Component (no `render`). Owns `location.pathname` + `location.search` as reactive state. Listens to `popstate`. Exposes `navigate(to, { replace })`. Provides itself to context.

```ts
export class Router extends Component {
  path = window.location.pathname;
  search = window.location.search;

  protected new() {
    const sync = () => {
      this.path = window.location.pathname;
      this.search = window.location.search;
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }

  navigate(to: string, opts: { replace?: boolean } = {}) {
    const url = new URL(to, location.origin);
    history[opts.replace ? 'replaceState' : 'pushState'](null, '', url);
    this.path = url.pathname;
    this.search = url.search;
  }
}
```

Children pass through; tree under `<Router>` may include any mix of `<Route>` nodes and ordinary JSX.

### `Route`

Abstract Component. Concrete routes either subclass `Route` directly or are produced by codegen (in dev tooling layer). v1 ships two extension shapes:

**Page route** - matches a pattern, renders its page:

```ts
export abstract class Route extends Component {
  router = get(Router);
  parent = get(Route, false);   // optional - undefined at top level

  abstract pattern: string;     // "/blog/:slug" relative to parent base

  get base(): string {
    return this.parent ? this.parent.base + this.parent.segment : '';
  }

  get segment(): string {
    return stripParams(this.pattern); // for prefix nesting
  }

  get match() {
    return matchPattern(this.base + this.pattern, this.router.path);
  }

  get params(): Record<string, string> {
    return this.match?.params ?? {};
  }
}
```

Subclasses override `render()` to gate on `this.match`:

```ts
class HomeRoute extends Route {
  pattern = '/';
  render() {
    if (!this.match) return null;
    return <h1>Home</h1>;
  }
}
```

**Layout route** - matches a *prefix*, wraps children when active:

```ts
class LayoutRoute extends Route {
  pattern = '/blog';
  get prefixMatch() {
    return this.router.path === this.base + this.pattern
        || this.router.path.startsWith(this.base + this.pattern + '/');
  }
  render(props = {} as { children: ReactNode }) {
    if (!this.prefixMatch) return null;
    return <BlogChrome>{props.children}</BlogChrome>;
  }
}
```

Layout vs page distinction can be a single base class with a `layout: boolean` flag, or two abstract subclasses. Lean toward the flag - one fewer concept.

### `Link`

Component handling pushState navigation while preserving native semantics (meta/ctrl click, middle click).

```ts
export class Link extends Component {
  to = '';
  replace = false;
  private router = get(Router);

  private go = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    this.router.navigate(this.to, { replace: this.replace });
  };

  render(props = {} as { children: ReactNode; className?: string }) {
    return (
      <a href={this.to} onClick={this.go} className={props.className}>
        {props.children}
      </a>
    );
  }
}
```

Subclassable for `NavLink` (active-state class), `PrefetchLink`, etc.

### Hooks

Thin wrappers; ergonomics only:

```ts
export const useRouter = () => Router.get();
export const useParams = <T,>() => Route.get($ => $.params as T);
export const useSearchParams = () =>
  Router.get($ => new URLSearchParams($.search));
```

### Imperative helpers

```ts
export function redirect(to: string, opts?: { replace?: boolean }): never;
export function notFound(): never;
```

Throw sentinel errors caught by the nearest `Route.catch()`, which sets fallback / navigates. Detail TBD during implementation; keep behavior unsurprising.

## Pattern matching

Hand-rolled. Rules:

- `/foo/bar` - literal segments
- `/blog/:slug` - named param, single segment
- `/files/*rest` - catch-all, captures remainder (empty string allowed)
- Trailing slashes are normalized (treated as equivalent)
- Case-insensitive matching of literal segments (configurable later if needed)
- Match returns `{ params: Record<string, string> } | null`

Implementation: split both pattern and path on `/`, walk in lockstep, collect params. Catch-all (`*name`) consumes the rest. Roughly 30 lines.

`(group)` segments in patterns are stripped during normalization - they exist only in route nesting (file-based codegen concern), not in URL space.

## Layout composition

Layouts compose via React tree nesting, *not* a route table. The router doesn't own a manifest; it owns Component context. The mounted tree dictates which routes are even considered.

```tsx
<Router>
  <RootLayoutRoute>
    <HomeRoute />
    <BlogLayoutRoute>
      <BlogIndexRoute />
      <BlogPostRoute />
    </BlogLayoutRoute>
    <NotFoundRoute />
  </RootLayoutRoute>
</Router>
```

Each route gates its own render on its match. Layouts render only when their prefix matches. The 404 route is just a `Route` whose `match` is "no sibling claimed this path" - implementable via a small per-parent coordinator (parent layout exposes a `claimed` flag siblings set during render; the 404 reads it).

Open question: 404 coordination via shared mutable state during render is workable but subtle (render order matters). Alternative: precompute which sibling will match by giving the parent layout a `routes = get(Route, true)` downstream collection and a single match-resolver pass per location change. Decide during implementation; the downstream-collection approach feels more "Expressive" and avoids order dependence.

## Suspense + errors come free

```tsx
class PostRoute extends Route {
  pattern = '/:slug';
  fallback = <Skeleton />;
  post = set(async () =>
    fetch(`/api/posts/${this.params.slug}`).then(r => r.json())
  );

  catch(err: Error) {
    this.fallback = <ErrorView error={err} />;
  }

  render() {
    if (!this.match) return null;
    return <article>{this.post.body}</article>;
  }
}
```

`fallback` and `catch` come from Component. No router-specific loading/error API.

## Renderer agnosticism

Router core (`matchPattern`, `Router` class behavior) has zero JSX in it. The JSX-emitting parts (`Route.render`, `Link.render`) live in a tiny adapter shim that imports from the host renderer adapter.

Initial: ship a React entry that imports from `@expressive/react`. Same source ported to Preact/Solid later when those adapters mature. Mirror mvc's existing `packages/{react,preact,solid}` split if multi-renderer ships from day one, or start single-renderer and split later.

## Package layout (in mvc)

```
packages/router/
  src/
    index.ts          # public exports
    matcher.ts        # matchPattern + helpers, pure, no JSX
    router.ts         # Router Component
    route.ts          # Route base + helpers
    link.ts           # Link Component
    hooks.ts          # useRouter / useParams / useSearchParams
    redirect.ts       # redirect / notFound sentinels
    matcher.test.ts
    router.test.tsx
    route.test.tsx
    link.test.tsx
  package.json
  tsconfig.json
  vitest.config.ts    # if needed beyond root
```

Match mvc's existing package conventions (pnpm workspace entry, root tsconfig extension, `tsc --noEmit && vitest run --coverage`, 100% coverage target). Tests use the shared `vitest` re-export and custom matchers (`toHaveUpdated`).

## Testing

Vitest + jsdom (same as mvc react package). Coverage target 100% per mvc policy.

Cases to cover:
- Matcher: literal, params, catch-all, multi-segment, trailing-slash normalization, no-match, empty path, root pattern.
- Router: initial path, navigate push, navigate replace, popstate, search query reactivity.
- Route: match reactivity (mount, then `navigate` causes correct routes to render), params reactive, nested base composition.
- Layout route: prefix matches, doesn't render when out of prefix, children render through.
- Link: pushes history, prevents default, respects modifier keys, respects middle-click.
- Suspense: route with `set(async ...)` shows fallback then content.
- Error: route `catch()` shows fallback, retries on resolve.
- 404: not-found route renders when no sibling matches.
- StrictMode: double-mount produces single Router instance, listeners cleaned up.

Each test should fail without the relevant implementation - per mvc policy, don't write tests that pass for the wrong reason.

## Implementation order

1. **Matcher** - pure function, fully tested in isolation. No Component involvement.
2. **Router** - location state, popstate listener, navigate. Test in isolation with jsdom.
3. **Route base** - pattern, match, params, parent composition. Test with `<Router><TestRoute /></Router>`.
4. **Layout route** - prefix match + children. Test nesting.
5. **Link** - click handling + modifier keys.
6. **Hooks** - thin wrappers, smoke tests only.
7. **Suspense + error integration tests** - prove `fallback` / `catch` work as routing primitives without router code adding anything.
8. **404 coordination** - decide between sibling-claim vs downstream-collection. Implement chosen approach. Test.
9. **redirect / notFound sentinels** - last, once everything else is stable.

Each step ships green tests before the next begins.

## Out of scope (explicit)

- SSR / streaming / `renderToPipeableStream` integration.
- Data loaders (`loader()` / `action()` style APIs).
- File-based routing codegen (lives in `expressive-dev`).
- Server-side route definitions.
- Scroll restoration (add later if needed - probably one Component subclass).
- View transitions API.
- Route-level metadata / `<head>` management (separate concern; may live in expressive-ui).

## Open questions

1. **404 coordination strategy.** Sibling-claim flag vs `get(Route, true)` resolver. Lean toward the latter.
2. **Multi-renderer split timing.** Start router as react-only and split later, or mirror mvc's react/preact/solid layout from day one? Probably start react-only; the core (matcher + classes) is renderer-agnostic anyway and can be extracted on demand.
3. **`Link` style API.** Just `className`, or also `activeClassName` via a `NavLink` subclass? Defer to v1.1.
4. **Hash routing / memory routing.** Not in v1. Could be alternate `Router` subclasses later.
5. **Programmatic navigation outside Components.** Currently requires `Router.get()` from a Component context. Should there be a module-level `navigate()` that finds the active Router? Probably no - keep router instance-scoped.

## Long-term home

When `expressive-ui` is established, `packages/router/` lifts directly out of mvc with no changes. Its only mvc dependency is `@expressive/state` (and its renderer adapters), which it would depend on from expressive-ui as a published package anyway.

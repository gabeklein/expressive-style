---
name: expressive-style
description: Work on the Expressive JSX monorepo safely and idiomatically. Use when modifying, debugging, reviewing, or extending the Expressive JSX Babel plugin, Babel preset, CSS generation, macros, build-tool integrations, TypeScript language service plugin, ESLint plugin, tests, or docs for this repository.
---

# Expressive JSX

Expressive JSX is a build-time CSS-in-JS solution for React that repurposes JavaScript labeled statements into styling scopes. Styles are extracted into CSS at build time with zero runtime overhead.

## Workflow

Start by reading repository context before editing:

- Read `AGENTS.md` for current contributor guidance.
- Read `references/authoring-syntax.md` when writing or reviewing Expressive JSX component code.
- Read `references/install-bootstrap.md` when setting up Expressive JSX in an app, bootstrapping this repo, or installing this skill.
- Read `references/architecture.md` when the task touches transformation behavior, contexts, macros, CSS output, value processing, class names, JSX underscore attributes, or build-tool integrations.
- Read `references/testing.md` before changing behavior or snapshots.
- Use `rg`/`rg --files` to find the owning package and local tests before changing behavior.

Keep edits close to the package that owns the behavior. Shared transformation changes usually start in `packages/babel-plugin-jsx` or `packages/babel-preset`; integration behavior belongs in the matching build-tool package.

## Package Map

- `packages/babel-plugin-jsx`: core JSX parser, label handling, context creation, JSX visitor, underscore attribute application.
- `packages/babel-preset`: Babel preset composition, CSS extraction/generation, macro system, class-name generation.
- `packages/css`: CSS property/value helpers and focused CSS unit tests.
- `packages/vite-plugin`, `packages/webpack-plugin`, `packages/rollup-plugin-jsx`, `packages/parcel-transformer-jsx`, `packages/nextjs-plugin`, `packages/bun-plugin`: build-tool integrations.
- `packages/typescript-plugin-jsx`: TypeScript language service support for `.jsx` authoring.
- `packages/eslint-plugin`: lint rules for Expressive JSX syntax.

## Implementation Rules

- Treat Expressive JSX syntax as valid JavaScript repurposed at build time; avoid inventing a runtime DSL.
- Preserve zero-runtime behavior: extracted CSS and generated class names should carry styling work.
- Remember that Expressive style extraction targets `.jsx`, not `.tsx`.
- Preserve label ordering semantics; later definitions can override earlier ones.
- Keep self-styling top-level declarations attached to the component's implicit `this` context.
- Preserve underscore attributes as compile-time style applicators; they should be removed from emitted JSX after class names are applied.
- Be conservative with prop/destructuring injection and fragment wrapping because these affect user component output.

## Testing

Run focused tests first, then broaden when touching shared behavior:

```bash
pnpm test -- packages/babel-plugin-jsx/src/tests/<name>.test.ts
pnpm test -- packages/babel-preset/src/tests/<name>.test.ts
pnpm test -- packages/css/src/<name>.test.ts
pnpm test
```

Tests usually call `parser(...)` and assert both `output.code` and `output.css` inline snapshots. Update snapshots only after checking the transformed JSX and generated CSS match the intended behavior.

## Reference Files

- `references/authoring-syntax.md`: JSX authoring syntax, value processing, macros, automatic behavior, gotchas.
- `references/install-bootstrap.md`: consumer integration setup, monorepo bootstrap commands, skill install notes.
- `references/architecture.md`: transformation pipeline and internals.
- `references/testing.md`: test layout, parser fixture pattern, snapshot workflow.

# Expressive JSX — Agent Context

This file is for AI agents contributing to **this codebase** (the Expressive JSX build toolchain). The canonical agent documentation lives in [skills/SKILL.md](skills/SKILL.md) and linked files under [skills/references/](skills/references/).

---

## Project Overview

**Expressive JSX** is a build-time CSS-in-JS solution that repurposes JavaScript labeled statements into a styling system. Styles are extracted to separate stylesheets at build time with zero runtime overhead.

**Core Philosophy:**
- Styling lives with component logic, no wrapper components
- Build-time transformation, zero runtime
- Repurpose existing JS syntax (labels, if statements) — no new DSL

---

## Monorepo Structure

```
packages/
├── babel-plugin-jsx/       # Core JSX parser & label transformer
├── babel-preset/          # CSS generation & macro system
├── vite-plugin/           # Vite integration (wraps babel-preset)
├── nextjs-plugin/         # Next.js integration
├── webpack-plugin/        # Webpack integration
├── rollup-plugin-jsx/     # Rollup integration
├── parcel-transformer/    # Parcel integration
├── typescript-plugin-jsx/ # TypeScript language service plugin
└── eslint-plugin/         # ESLint rules for Expressive JSX
```

---

## Transformation Pipeline

1. Build tool (Vite/Webpack/etc) → Babel preset → Babel plugin
2. Babel plugin parses labeled statements and creates **Contexts**
3. Macros expand shorthand properties into full CSS
4. CSS plugin generates class names and extracts CSS
5. JSX elements receive generated `className` attributes

---

## Internal Architecture

### Contexts

A **Context** is created for each:
- Component function (top-level context)
- Labeled block (`label: { ... }`)
- If statement with test condition

Contexts form a hierarchy managing:
- `context.props` — CSS property definitions
- `context.children` — child contexts
- `context.also` — conditional contexts
- `context.define` — label definitions

**Source:** [packages/babel-plugin-jsx/src/context.ts](packages/babel-plugin-jsx/src/context.ts)

### Label Handling

Labels are processed in `handleLabel()` in [packages/babel-plugin-jsx/src/label.ts](packages/babel-plugin-jsx/src/label.ts). This is where macros are dispatched and contexts are created.

**Self-Styling:** Styles defined before any labels in a component function form a "this" context automatically applied to the outermost returned element.

### Macros

Macros are functions that transform shorthand syntax into CSS property objects. They live in [packages/babel-preset/src/macros/](packages/babel-preset/src/macros/). All built-in macros are user-overridable via Babel config.

**Macro signature:**
```javascript
export function macroName(...args) {
  return { cssProperty: value };
}
```

### Value Processing

- `appendUnit.ts` — integers → `px`, decimals → `em`, zero → `"0"`
- CamelCase identifiers → kebab-case strings (`notAllowed` → `"not-allowed"`)
- `0xRRGGBB` → `#RRGGBB`, with alpha → `rgba(...)` via `chroma-js`
- Special keywords: `fill` → `100%`, `round` → `999px`
- `$varName` → `var(--var-name)` (CSS custom properties)

### Class Name Generation

Pattern: `{name}_{hash}` — see [packages/babel-preset/src/cssPlugin/uniqueIdentifier.ts](packages/babel-preset/src/cssPlugin/uniqueIdentifier.ts)

### Underscore Attributes

`<div _label />` → looks up `label` context → applies className → removes `_label` from output.

**Source:** [packages/babel-plugin-jsx/src/index.ts](packages/babel-plugin-jsx/src/index.ts) (JSX visitor, ~lines 95–126)

### Vite Integration

Virtual CSS modules via `\0virtual:css:*`. CSS injected as `import "__EXPRESSIVE_CSS__"`.

**Source:** [packages/vite-plugin/src/index.ts](packages/vite-plugin/src/index.ts)

---

## Key Source Files

| File | Purpose |
|------|---------|
| `packages/babel-plugin-jsx/src/index.ts` | Entry point, JSX visitor |
| `packages/babel-plugin-jsx/src/label.ts` | Label handling, context creation |
| `packages/babel-plugin-jsx/src/context.ts` | Context class definition |
| `packages/babel-preset/src/index.ts` | Preset entry, plugin composition |
| `packages/babel-preset/src/macros/` | All macro implementations |
| `packages/vite-plugin/src/index.ts` | Vite integration, virtual modules |

---

## Dependencies

- `@babel/core`, `@babel/traverse`, `@babel/types` — AST transformation
- `chroma-js` — color processing (hex with alpha)
- `easing-coordinates` — easing functions (animations)

---

## Testing

Tests live in `packages/*/src/tests/*.test.ts`.

Key files: `basic.test.ts`, `styles.test.ts`, `pseudo.test.ts`, `values.test.ts`, `macro.test.ts`

**Pattern:**
```typescript
const output = await parser(`
  const Component = () => { /* input */ }
`);
expect(output.code).toMatchInlineSnapshot(`...`);
expect(output.css).toMatchInlineSnapshot(`...`);
```

---

## Contributor Gotchas

- **No TSX support** — the plugin does not process `.tsx` files, only `.jsx`
- **Label order matters** — processed in order, later definitions can override
- **Top-level styles** — attach to the "this" context (named after the component), not a label
- **Props injection** — the plugin can inject `props` destructuring automatically when needed
- **Fragment wrapping** — styled components returning `<>...</>` are auto-wrapped in a `<div>`

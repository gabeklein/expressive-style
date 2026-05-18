# Expressive JSX Architecture

## Transformation Pipeline

1. A build-tool integration invokes the Babel preset.
2. The preset composes the JSX Babel plugin with CSS extraction/generation.
3. The Babel plugin parses labeled statements and creates contexts.
4. Macros expand shorthand declarations into CSS property objects.
5. CSS generation creates class names and extracts stylesheet output.
6. JSX elements receive generated `className` values and compile-time underscore attributes are removed.

Core philosophy:

- Styling lives with component logic, without wrapper components.
- Build-time transformation does the styling work; runtime output is plain JSX plus classes.
- Existing JavaScript syntax is reused instead of introducing a new parser-level DSL.

## Monorepo Structure

```text
packages/
├── babel-plugin-jsx/       # Core JSX parser and label transformer
├── babel-preset/           # CSS generation and macro system
├── css/                    # CSS helper package
├── vite-plugin/            # Vite integration
├── nextjs-plugin/          # Next.js integration
├── webpack-plugin/         # Webpack integration
├── rollup-plugin-jsx/      # Rollup integration
├── parcel-transformer-jsx/ # Parcel integration
├── typescript-plugin-jsx/  # TypeScript language service plugin
└── eslint-plugin/          # ESLint rules
```

## Contexts

A context represents a styling scope. Contexts are created for component functions, labeled blocks, and conditional branches.

Important fields:

- `context.props`: CSS declarations for the scope.
- `context.children`: nested child contexts.
- `context.also`: conditional contexts that may apply alongside the current scope.
- `context.define`: label definitions available for underscore attribute lookup.

Primary source files:

- `packages/babel-plugin-jsx/src/context.ts`
- `packages/babel-plugin-jsx/src/label.ts`
- `packages/babel-plugin-jsx/src/index.ts`

## Label Handling

`handleLabel()` in `packages/babel-plugin-jsx/src/label.ts` dispatches macros and creates contexts. Styles written before any explicit labels in a component form the implicit self-styling context applied to the outermost returned element.

Labeled blocks create reusable scopes:

```jsx
button: {
  padding: 8, 16;
}
```

Underscore JSX attributes apply these scopes and are removed from output:

```jsx
<button _button />
```

Label order matters. Later definitions can override earlier ones, and nested labels participate in the context hierarchy.

## Conditionals

JavaScript `if` statements create conditional contexts. Runtime boolean tests generally become conditional class-name expressions; string tests represent CSS selectors and pseudo-selectors.

Examples:

```jsx
if (disabled) {
  opacity: 0.4;
}

if (':hover') {
  opacity: 1;
}
```

Nested conditionals must compose correctly across runtime tests and selector conditions.

## Macros

Built-in macros live in `packages/babel-preset/src/macros/`. Each macro returns a CSS property object and can be overridden by user Babel config.

Macro shape:

```js
export function macroName(...args) {
  return { cssProperty: value };
}
```

When adding or changing a macro, update focused tests around shorthand expansion and value processing.

## CSS Output

Class names follow the `{name}_{hash}` pattern from `packages/babel-preset/src/cssPlugin/uniqueIdentifier.ts`.

CSS generation should preserve deterministic output and stable ordering. If a behavior change alters class names, selectors, or declaration order, update tests only after checking the new output is intentional.

## Build Integrations

Build-tool packages should stay thin and delegate transformation semantics to the shared Babel preset/plugin.

Vite-specific behavior uses virtual CSS modules and injects `__EXPRESSIVE_CSS__`; see `packages/vite-plugin/src/index.ts`.

When changing integration behavior, test or inspect the relevant package entrypoint and avoid duplicating core transformation logic inside wrappers.

## Key Source Files

| File | Purpose |
| --- | --- |
| `packages/babel-plugin-jsx/src/index.ts` | Entry point and JSX visitor |
| `packages/babel-plugin-jsx/src/label.ts` | Label handling and context creation |
| `packages/babel-plugin-jsx/src/context.ts` | Context class definition |
| `packages/babel-preset/src/index.ts` | Preset entry and plugin composition |
| `packages/babel-preset/src/macros/` | Built-in macro implementations |
| `packages/babel-preset/src/cssPlugin/uniqueIdentifier.ts` | Class-name generation |
| `packages/vite-plugin/src/index.ts` | Vite integration and virtual modules |

## Dependencies

- `@babel/core`, `@babel/traverse`, `@babel/types`: AST transformation.
- `chroma-js`: color processing for alpha hex forms.
- `easing-coordinates`: easing functions for animation-related behavior.

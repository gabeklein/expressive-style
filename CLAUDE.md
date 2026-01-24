# Expressive JSX - Context for Claude

This document contains key insights about the Expressive JSX project to help future AI sessions understand the architecture and make better contributions.

## Project Overview

**Expressive JSX** is a build-time CSS-in-JS solution that extends JSX with inline styling using JavaScript labels. It transforms labeled statements into CSS classes and extracts them to separate stylesheets—no runtime overhead.

**Core Philosophy:**
- Styling should live with component logic
- No wrapper components (unlike styled-components)
- Build-time transformation (zero runtime)
- Natural JavaScript syntax (no template literals)
- Type-safe by default

## Architecture

### Monorepo Structure

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

### Transformation Pipeline

**High-level flow:**
1. Build tool (Vite/Webpack/etc) → Babel preset → Babel plugin
2. Babel plugin parses labeled statements and creates "contexts"
3. Macros expand shorthand properties into full CSS
4. CSS plugin generates class names and extracts CSS
5. JSX elements receive generated className attributes

**Example transformation:**

```jsx
// INPUT
const Button = ({ disabled }) => {
  background: $accent;
  padding: 10, 20;

  if (disabled) {
    opacity: 0.4;
  }

  return <button>Click</button>;
}

// STEP 1: Babel plugin identifies labels
// Creates contexts: Component context + disabled conditional context

// STEP 2: Macros expand shorthands
// padding: 10, 20 → padding: "10px 20px"

// STEP 3: CSS plugin generates classes
// .Button_xyz { background: var(--accent); padding: 10px 20px; }
// .disabled_abc { opacity: 0.4; }

// OUTPUT
const Button = ({ disabled }) => (
  <button className={classNames('Button_xyz', disabled && 'disabled_abc')}>
    Click
  </button>
);
```

## Key Concepts

### 1. Contexts

A **Context** is created for each:
- Component function (top-level context)
- Labeled block (`label: { ... }`)
- If statement with test condition

Contexts form a hierarchy and manage:
- CSS property definitions (`context.props`)
- Child contexts (`context.children`)
- Conditional contexts (`context.also`)
- Label definitions (`context.define`)

**Source:** `packages/babel-plugin-jsx/src/context.ts`

### 2. Labels

Labels create named style blocks:

```jsx
inner: {
  color: 'red';
}
```

Labels can:
- Define nested contexts
- Be referenced with underscore attributes: `<div _inner />`
- Nest infinitely: `outer: { inner: { deep: { ... } } }`
- Apply to element tags: `div: { color: 'red' }`

**Special label: `this`**
- Auto-created for component functions
- References the component's root styles
- `<this>` renders root element with component className

**Source:** `packages/babel-plugin-jsx/src/label.ts`

### 3. Macros

Macros are functions that transform shorthand syntax into standard CSS properties.

**Built-in macros** (in `packages/babel-preset/src/macros/`):

| Macro | Purpose | Example |
|-------|---------|---------|
| `absolute/fixed/relative` | Positioning shortcuts | `absolute: fill` → all edges 0 |
| `size` | Width + height | `size: 100` → 100px × 100px |
| `radius` | Border radius | `radius: 'round'` → 999px |
| `margin/padding` | Multi-value spacing | `margin: 10, 20` → 10px 20px |
| `marginV/marginH` | Directional margins | `marginV: 20` → top & bottom |
| `shadow` | Box shadow | `shadow: 0xccc` → box-shadow |
| `border` | Border shorthand | `border: 0xddd, 2` → 2px solid |
| `flexAlign` | Flex layout | `flexAlign: 'center'` → center both axes |
| `gap/width/height/fontSize/...` | Scalar properties | Auto-unit values |

**Macro signature:**
```javascript
export function macroName(...args) {
  return {
    cssProperty: value,
    // can return multiple properties
  };
}
```

Macros are applied in `packages/babel-plugin-jsx/src/label.ts` → `handleLabel()` → macro queue processing.

### 4. Value Processing

**Auto-unit conversion** (in `appendUnit.ts`):
- Integers → `px`: `20` → `"20px"`
- Decimals → `em`: `1.5` → `"1.5em"`
- Zero → `"0"` (no unit)
- Strings with dots → add unit: `"1.2"` → `"1.2em"`

**Hex color processing:**
- `0xRRGGBB` → `#RRGGBB`
- `0xRRGGBBA` (with alpha) → `rgba(...)` using `chroma-js`

**Special keywords:**
- `fill` → `100%`
- `round` → `999px` (for border-radius)
- `borderBox` → `border-box`
- `currentcolor` / `currentColor` → CSS keyword

**CSS variable handling:**
- `$variableName` → `var(--variable-name)`
- CamelCase converted to kebab-case

### 5. Conditional Styling

**If statements create conditional contexts:**

```jsx
// Prop-based
if (disabled) {
  opacity: 0.4;
}

// Pseudo-selector (string literal test)
if (':hover') {
  background: 'blue';
}

// Class selector
if ('.active') {
  fontWeight: 'bold';
}
```

**How it works:**
- String literal test (`:hover`, `.active`) → creates CSS selector
- Expression test (`disabled`) → creates conditional className application
- Transforms to: `className={classNames('base', condition && 'conditional_xyz')}`

**Source:** `packages/babel-plugin-jsx/src/label.ts` → `createIfContext()`

### 6. Underscore Attributes

**Pattern:** `<div _labelName />`

**Purpose:** Apply labeled styles to elements

**How it works:**
1. Parser finds attributes starting with `_`
2. Strips underscore: `_inner` → looks up `inner` label
3. Applies corresponding className
4. Removes the `_` attribute from output

**Source:** `packages/babel-plugin-jsx/src/index.ts` → JSX visitor (lines 95-126)

### 7. Class Name Generation

**Pattern:** `{name}_{hash}`

**Where:**
- `name`: Component name, label name, or conditional identifier
- `hash`: Short hash from context path/test condition

**Uniqueness:**
- Component context: Uses component name + file hash
- Label context: Uses label name + parent context hash
- Conditional context: Uses prop name or hashed test expression

**Source:** `packages/babel-preset/src/cssPlugin/uniqueIdentifier.ts`

## Dependencies

**Core:**
- `@babel/core` - AST transformation
- `@babel/traverse` - AST traversal
- `@babel/types` - AST node types

**Utilities:**
- `chroma-js` - Color processing (hex with alpha)
- `easing-coordinates` - Easing functions (for animations)

**Build integrations:**
- Vite plugin uses virtual CSS modules (`\0virtual:css:*`)
- CSS is injected via import: `import "__EXPRESSIVE_CSS__"`

## Common Patterns from IFCP Codebase

### Self-Styling Pattern
```jsx
export const Component = (props) => {
  // Styles here apply to root
  background: white;
  padding: 20;

  return <div {...props} />;
};
```

### Nested Labels Pattern
```jsx
export const Container = () => {
  outer: {
    padding: 20;
  }

  inner: {
    background: 'white';
  }

  return (
    <div _outer>
      <div _inner>Content</div>
    </div>
  );
};
```

### Conditional Styling Pattern
```jsx
export const Button = ({ disabled, secondary }) => {
  background: $accent;
  color: 'white';

  if (disabled) {
    opacity: 0.4;
    cursor: 'not-allowed';
  }

  if (secondary) {
    background: $secondary;
    color: $accent;
  }

  if (':hover' && !disabled) {
    filter: 'brightness(1.1)';
  }

  return <button>Click</button>;
};
```

### Shorthand Usage Pattern
```jsx
export const Box = () => {
  // Position
  absolute: fill;

  // Size
  size: 100, 200;

  // Spacing
  padding: 10, 20;
  marginV: 15;

  // Border
  radius: 8;
  border: 0xddd;

  // Shadow
  shadow: 0xccc;

  return <div />;
};
```

### CSS Variable Pattern
```jsx
export const Themed = () => {
  background: $primaryBackground;
  color: $textPrimary;
  border: $border;

  if (':hover') {
    background: $primaryBackgroundHover;
  }

  return <div />;
};
```

## Testing

Tests are in `packages/*/src/tests/*.test.ts`

**Key test files:**
- `basic.test.ts` - Core transformation
- `styles.test.ts` - Label and nesting
- `pseudo.test.ts` - Pseudo-selectors
- `values.test.ts` - Value processing
- `macro.test.ts` - Macro expansion

**Test pattern:**
```typescript
const output = await parser(`
  const Component = () => {
    // input code
  }
`);

expect(output.code).toMatchInlineSnapshot(`...`);
expect(output.css).toMatchInlineSnapshot(`...`);
```

## Gotchas & Edge Cases

1. **Label order matters**: Labels are processed in order, later definitions can override
2. **camelCase → kebab-case**: All property names converted automatically
3. **Underscore attributes are removed**: `_inner` doesn't appear in final HTML
4. **`this` is special**: Can't be used as regular label name
5. **Comma syntax for multi-values**: `padding: 10, 20` not `padding: [10, 20]`
6. **Hex colors need `0x` prefix**: `0xff0000` not `#ff0000`
7. **Conditionals in if test**: String literals create selectors, expressions create conditional classes
8. **Props destructuring**: Plugin can inject props automatically when needed

## Future Improvements

**Potential areas:**
- Media query support (similar to if statements)
- Animation keyframes (inline `@keyframes`)
- Grid template shorthands
- More comprehensive TypeScript support
- Better error messages with source locations
- Performance optimizations for large codebases
- CSS extraction options (single file vs per-component)

## Documentation Priorities

**For README:**
- More before/after comparisons
- Common patterns cookbook
- Migration guide from styled-components/emotion
- Performance benchmarks vs alternatives

**For Website:**
- Interactive playground
- API reference for all macros
- TypeScript integration guide
- Framework-specific guides (Next.js, Remix, etc.)
- Advanced topics (custom macros, theming patterns)

## References

**Source files to understand:**
- `packages/babel-plugin-jsx/src/index.ts` - Entry point, JSX visitor
- `packages/babel-plugin-jsx/src/label.ts` - Label handling, context creation
- `packages/babel-plugin-jsx/src/context.ts` - Context class definition
- `packages/babel-preset/src/index.ts` - Preset entry, plugin composition
- `packages/babel-preset/src/macros/` - All macro implementations
- `packages/vite-plugin/src/index.ts` - Vite integration, virtual modules

**Example codebase:**
- `/Users/gabeklein/Synergy/IFCP/app/src/**/*.jsx` - Real-world usage examples

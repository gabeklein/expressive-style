# Expressive JSX - Context for Claude

This document contains key insights about the Expressive JSX project to help future AI sessions understand the architecture and make better contributions.

## Project Overview

**Expressive JSX** is a build-time CSS-in-JS solution that upcycles JavaScript syntax—specifically **labeled statements** (those rarely-used features from `for` loops)—into a powerful styling system. It transforms labeled statements into CSS classes and extracts them to separate stylesheets with zero runtime overhead.

**Core Philosophy:**
- Styling should live with component logic
- No wrapper components (unlike styled-components)
- Build-time transformation (zero runtime)
- Natural JavaScript syntax—repurposing existing language features, not inventing new ones
- No template literals, no custom DSL
- Type-safe by default

**The "Upcycled JavaScript" Approach:**
Instead of inventing new syntax, Expressive reinterprets existing JavaScript features that are rarely used:
- **Labels** (from `for`/`while` loops) → Style scopes
- **Bare identifiers** → CSS properties
- **If statements** → Conditional styles and pseudo-selectors

This means it's valid JavaScript that gets new meaning at build time.

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

### 2. Labels (Upcycled from JavaScript)

**What they are:** JavaScript labels are normally used with loop control flow:
```js
outer: for (let i = 0; i < 10; i++) {
  if (i === 5) break outer;
}
```

**In Expressive JSX**, labels are repurposed to create named style blocks:

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

**Self-Styling (Top-level styles):**
- Styles defined at the top of a component function (before any labels) automatically apply to the outermost returned element(s)
- This is called "self-styling" in the docs
- Internally represented by a `this` context (auto-created for component functions)
- Users don't write `this` label or `<this>` tag - it's automatically applied

**Source:** `packages/babel-plugin-jsx/src/label.ts`

### 3. Macros (User-Definable Shorthand System)

**IMPORTANT:** All macros are **user-definable**. Expressive ships with common built-in macros, but you have complete control to create custom macros for your design system.

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

**Creating custom macros:**
```javascript
// Define in babel preset config
export function elevation(level) {
  const shadows = {
    1: '0 1px 3px rgba(0,0,0,0.12)',
    2: '0 3px 6px rgba(0,0,0,0.16)',
    3: '0 10px 20px rgba(0,0,0,0.19)',
  };
  return { boxShadow: shadows[level] };
}

// Usage in components
const Card = () => {
  elevation: 2;  // → box-shadow: 0 3px 6px rgba(0,0,0,0.16)
  return <div />;
};
```

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

**CamelCase value identifiers:**
You can use bare camelCase identifiers as values, which are automatically converted to kebab-case strings:
```jsx
cursor: pointer;           // → cursor: "pointer"
cursor: notAllowed;        // → cursor: "not-allowed"
textDecoration: underline; // → text-decoration: "underline"
width: fill;               // → width: "100%" (special keyword)
borderRadius: round;       // → border-radius: "999px" (special keyword)
boxSizing: borderBox;      // → box-sizing: "border-box"
```

This provides cleaner syntax without quote marks for common CSS values.

**Hex color processing:**
- `0xRRGGBB` → `#RRGGBB`
- `0xRRGGBBA` (with alpha) → `rgba(...)` using `chroma-js`

**Special keywords:**
- `fill` → `100%`
- `round` → `999px` (for border-radius)
- `borderBox` → `border-box`
- `currentcolor` / `currentColor` → CSS keyword

**Multi-value properties (comma syntax):**
Use commas to specify multiple values for properties like padding, margin, etc.:
```jsx
padding: 10, 20;              // → padding: 10px 20px
margin: 5, 10, 15, 20;        // → margin: 5px 10px 15px 20px
size: 100, 200;               // → width: 100px; height: 200px
```

**Note:** Use `padding: 10, 20` NOT `padding: [10, 20]` (arrays are not supported for this syntax).

**CSS variable handling:**
- `$variableName` → `var(--variable-name)`
- CamelCase converted to kebab-case
- Can be defined and referenced: `$accent: 0x007bff;` creates a CSS custom property

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

1. **Labels are upcycled from JavaScript**: They're the same syntax as `for` loop labels—valid JavaScript repurposed at build time
2. **Label order matters**: Labels are processed in order, later definitions can override
3. **camelCase → kebab-case**: All property names AND camelCase value identifiers converted automatically
4. **Underscore attributes are removed**: `_inner` doesn't appear in final HTML—it's build-time only
5. **Top-level styles auto-apply**: Styles before any labels automatically apply to outermost returned elements ("self-styling")
6. **Comma syntax for multi-values**: `padding: 10, 20` not `padding: [10, 20]` (arrays not supported)
7. **Hex colors need `0x` prefix**: `0xff0000` not `#ff0000` (JavaScript number literal syntax)
8. **Conditionals in if test**: String literals (`:hover`, `.active`) create CSS selectors, expressions (`disabled`) create conditional classes
9. **Props destructuring**: Plugin can inject props automatically when needed
10. **All macros are customizable**: Built-in macros are just defaults—define your own in babel config

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
- ✅ Emphasize "upcycled JavaScript" framing
- ✅ Before/after comparisons with alternatives
- ✅ Glossary of terms
- Migration guide from styled-components/emotion
- Performance benchmarks vs alternatives

**For Website:**
- Interactive playground
- API reference for all macros
- Custom macro guide (how to build your own design system)
- TypeScript integration guide
- Framework-specific guides (Next.js, Remix, etc.)
- Advanced topics (theming patterns, media queries, animations)

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

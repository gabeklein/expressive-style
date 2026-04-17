# Expressive JSX — LLM Context for Projects Using This Library

> Include this file in your project's `.claude/` directory or reference it so LLMs understand how to write Expressive JSX code.

---

## What Is Expressive JSX?

A build-time CSS-in-JS system for React. You write styles directly inside component functions using JavaScript labeled statements — a rarely-used syntax feature repurposed for styling. Styles are extracted to real CSS at build time with zero runtime overhead.

**Important:** Expressive styles only work in `.jsx` files, not `.tsx`.

---

## Installation

### Vite
```bash
npm install @expressive/vite-plugin
```
```js
// vite.config.js
import jsx from '@expressive/vite-plugin';
import react from '@vitejs/plugin-react';

export default {
  plugins: [jsx(), react()]
};
```

### Webpack
```bash
npm install @expressive/webpack-plugin
```
```js
// webpack.config.js
const ExpressivePlugin = require('@expressive/webpack-plugin');
module.exports = { plugins: [new ExpressivePlugin()] };
```

### Next.js (Webpack only, not Turbopack - just a wrapper, install that if you want)
```bash
npm install @expressive/nextjs-plugin
npx next --webpack
```
```js
// next.config.js
const withExpressive = require('@expressive/nextjs-plugin');
module.exports = withExpressive({ /* next config */ });
```

### TypeScript IDE Support
```bash
npm install --save-dev @expressive/typescript-plugin-jsx
```
```json
// tsconfig.json
{ "compilerOptions": { "plugins": [{ "name": "@expressive/typescript-plugin-jsx" }] } }
```

---

## Core Syntax

### Self-Styling (Top-Level Styles)

Styles written at the top of a component function automatically apply to the outermost returned element:

```jsx
const Card = ({ children }) => {
  background: white;
  padding: 24;
  borderRadius: 8;

  return <div>{children}</div>;
};
```

Compiles to:
```jsx
// JS: <div className="Card_a3f">...</div>
// CSS: .Card_a3f { background: white; padding: 24px; border-radius: 8px; }
```

### Labels (Named Style Scopes)

Create reusable style blocks with labels. Apply them to elements using underscore attributes (`_name`):

```jsx
const Dashboard = () => {
  display: flex;
  gap: 20;

  card: {
    background: white;
    padding: 24;
    borderRadius: 12;

    title: {
      fontSize: 1.5;
      fontWeight: bold;
    }
  }

  return (
    <div>
      <div _card>
        <h2 _title>Revenue</h2>
      </div>
      <div _card>
        <h2 _title>Users</h2>
      </div>
    </div>
  );
};
```

Labels can nest. Multiple underscore attributes combine: `<div _card _highlighted />`.

The `_` attributes are removed from the final HTML output.

### Conditional Styles

**Value-based** — creates a conditional className:
```jsx
const Button = ({ disabled }) => {
  background: 0x007bff;

  if (disabled) {
    opacity: 0.4;
    cursor: notAllowed;
  }

  return <button>Click</button>;
};
```

**Pseudo-selectors** — use a string literal as the condition:
```jsx
if (':hover') {
  background: 0x0056b3;
}

if (':focus') {
  outline: '2px solid blue';
}
```

**Class selectors:**
```jsx
if ('.active') {
  fontWeight: bold;
}
```

**Parent selector (`&`):**
```jsx
if ('& > span') { color: red; }
if ('.wrapper &') { padding: 20; }
```

**Else branches:**
```jsx
if (active)
  color: 0x007bff;
else
  color: 0x666;
```

**Nested conditionals** compose:
```jsx
if (ready) {
  color: blue;
  if (':hover') {
    color: green;  // CSS: .ready_x:hover { color: green; }
  }
}
```

---

## Value Processing

### Numbers

| Input | Output | Rule |
|-------|--------|------|
| `20` | `20px` | Integers → px |
| `1.5` | `1.5em` | Decimals → em |
| `0` | `0` | No unit |

### Hex Colors

Use `0x` prefix (JavaScript number literals):
```jsx
color: 0xff0000;           // → #ff0000
background: 0x007bff;      // → #007bff
background: 0xfff8;        // → rgba(255,255,255,0.533) — with alpha
```

### CamelCase Identifiers as Values

Bare identifiers are converted to kebab-case strings automatically:
```jsx
cursor: pointer;           // → cursor: pointer
cursor: notAllowed;        // → cursor: not-allowed
textDecoration: underline; // → text-decoration: underline
boxSizing: borderBox;      // → box-sizing: border-box
```

### Special Keywords

| Keyword | Output |
|---------|--------|
| `fill` | `100%` |
| `round` | `999px` |

```jsx
width: fill;          // → width: 100%
borderRadius: round;  // → border-radius: 999px
```

### Multi-Value Properties (Comma Syntax)

Use commas to pass multiple values:
```jsx
padding: 10, 20;              // → padding: 10px 20px
margin: 5, 10, 15, 20;        // → margin: 5px 10px 15px 20px
```

Do **not** use arrays — `padding: [10, 20]` will not work.

### CSS Variables

`$` prefix references CSS custom properties. CamelCase converts to kebab-case:
```jsx
background: $primaryColor;    // → background: var(--primary-color)
color: $textPrimary;          // → color: var(--text-primary)
```

Define CSS variables:
```jsx
$accent: 0x007bff;            // → --accent: #007bff (on this element's class)
```

---

## Built-In Macros (Shorthands)

Macros expand shorthand labels into full CSS. All are customizable via Babel config.

### Position: `absolute` / `fixed` / `relative`

```jsx
absolute: fill;              // → position: absolute; top: 0; right: 0; bottom: 0; left: 0
absolute: fill, 10;          // → all edges 10px
absolute: fill, 10, 20;      // → vertical 10px, horizontal 20px
absolute: fill-top;           // → top + left + right = 0, no bottom
absolute: 10, 20, 30, 40;    // → top, right, bottom, left individually
```

### Size

```jsx
size: 100;                   // → width: 100px; height: 100px
size: 100, 200;              // → width: 100px; height: 200px
```

### Border

```jsx
border: 0xddd;               // → border: 1px solid #ddd
border: 0xddd, 2;            // → border: 2px solid #ddd
```

### Border Radius

```jsx
radius: 8;                   // → border-radius: 8px
radius: round;               // → border-radius: 999px
```

### Shadow

```jsx
shadow: 0xccc;               // → box-shadow: #ccc 0 0 10px
```

### Spacing

```jsx
margin: 10, 20;              // → margin: 10px 20px
padding: 10, 20;             // → padding: 10px 20px
marginV: 20;                 // → margin-top: 20px; margin-bottom: 20px
marginH: 20;                 // → margin-left: 20px; margin-right: 20px
```

### Flex Layout

```jsx
flexAlign: center;           // → display: flex; justify-content: center; align-items: center
```

### Transform

```jsx
transform: translateX(10), rotate(45), scale(2);
// → transform: translateX(10px) rotate(45deg) scale(2)
```

Auto-units: `translate*`/`perspective` → px, `rotate*`/`skew*` → deg, `scale*` → unitless.

---

## Custom Macros

Define your own shorthands in Babel preset configuration:

```js
// In your build config
{
  macros: [{
    elevation(level) {
      const shadows = {
        1: '0 1px 3px rgba(0,0,0,0.12)',
        2: '0 3px 6px rgba(0,0,0,0.16)',
        3: '0 10px 20px rgba(0,0,0,0.19)',
      };
      return { boxShadow: shadows[level] };
    }
  }]
}

// Usage:
const Card = () => {
  elevation: 2;  // → box-shadow: 0 3px 6px rgba(0,0,0,0.16)
  return <div />;
};
```

Macros are functions that return `{ cssProperty: value }` objects.

---

## Automatic Behaviors

### Props & className Forwarding

When a component has expressive styles, the plugin automatically forwards `className` from props onto the root element. This makes components composable - a parent can apply styles to a child component, and the generated className flows through without any manual wiring.

**How it works by param style:**
- Destructured params → `className` is added to the destructuring
- `props` identifier → `props.className` is appended to the root element
- No params → a `props` param is injected to access `className`

**Only applies when the component has styles.** A plain component with no expressive styles will not be modified.

```jsx
const Card = ({ children }) => {
  padding: 20;
  borderRadius: 8;
  background: white;

  return <div>{children}</div>;
};

// Parent applies styles to Card - they compose automatically
const Dashboard = () => {
  card: {
    marginBottom: 16;
    border: 0xeee;
  }

  return <Card _card>Content</Card>;
};
// Card's root div receives both its own className AND the parent's
```

If `className` is already declared in the component's params, the plugin assumes you're handling it yourself and won't inject forwarding.

### Fragment Wrapping

If a styled component returns a Fragment (`<>...</>`), it's automatically wrapped in a `<div>` to receive the className.

---

## Common Patterns

### Full Component Example

```jsx
export const Button = ({ disabled, variant }) => {
  padding: 8, 16;
  borderRadius: 6;
  background: $accent;
  color: white;
  cursor: pointer;
  border: 'none';

  if (disabled) {
    opacity: 0.4;
    cursor: notAllowed;
  }

  if (variant === 'secondary') {
    background: 'transparent';
    border: $accent, 1;
    color: $accent;
  }

  if (':hover' && !disabled) {
    filter: 'brightness(1.1)';
  }

  icon: {
    size: 16;
    marginRight: 8;
  }

  return (
    <button>
      <span _icon>{/* icon */}</span>
      Click Me
    </button>
  );
};
```

### Layout with Nested Labels

```jsx
export const Page = () => {
  display: flex;
  height: fill;

  sidebar: {
    width: 260;
    background: 0xf5f5f5;
    padding: 20;
  }

  main: {
    flex: 1;
    padding: 40;
    overflow: auto;
  }

  return (
    <div>
      <nav _sidebar>Navigation</nav>
      <section _main>Content</section>
    </div>
  );
};
```

### Theming with CSS Variables

```jsx
export const ThemeProvider = ({ children }) => {
  $accent: 0x007bff;
  $textPrimary: 0x333;
  $background: 0xffffff;
  $border: 0xeee;

  return <div>{children}</div>;
};
```

---

## Gotchas

1. **`.jsx` only** — does not work in `.tsx` files
2. **Use `0x` for hex colors** — not `#` (must be valid JS number literals)
3. **Commas for multi-values** — `padding: 10, 20` not `padding: [10, 20]`
4. **Integers → px, decimals → em** — `padding: 1` is `1px`, `padding: 1.0` is `1em`
5. **Label names can't match component name** — `const Foo = () => { Foo: { ... } }` will error
6. **Bare identifiers become kebab-case strings** — `notAllowed` → `"not-allowed"`, don't quote common values
7. **Top-level styles auto-apply** — no need to reference them; they attach to the root returned element
8. **`_` attributes are build-time only** — they don't appear in rendered HTML
9. **String if-tests create CSS selectors** — `if (':hover')` is not runtime logic
10. **Expression if-tests create conditional classes** — `if (disabled)` creates runtime className toggling

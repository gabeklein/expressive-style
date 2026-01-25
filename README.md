<br/>

<p align="center">
  <img height="90" src="website/repl/public/Logo.svg" alt="Expressive Logo"/>
  <h1 align="center">
    Expressive JSX
  </h1>
</p>

<h4 align="center">
  CSS-in-JS, but it's just JSX
</h4>

<p align="center">
  <a href="https://www.npmjs.com/package/@expressive/babel-preset"><img alt="NPM" src="https://badge.fury.io/js/%40expressive%2Fbabel-preset.svg"></a>
  <a href="https://join.slack.com/t/expressivejs/shared_invite/zt-s2j5cdhz-gffKn3bTATMbXf~iq4pvHg" alt="Join Slack">
    <img src="https://img.shields.io/badge/Slack-Come%20say%20hi!-blueviolet" />
  </a>
</p>

<p align="center">
  Write CSS directly in JSX component functions using labels and properties.<br/>
  Zero runtime overhead—styles are extracted to real stylesheets at build time.<br/>
  No wrapper components, no tagged templates, just natural JavaScript syntax.<br/>
</p>

<br/>

## Table of Contents

- [How It Works](#how-it-works-section)
- [Compare it to...](#problem-section)
- [Key Features](#features-section)
- [Installation](#install-section)
- [TypeScript Support](#typescript-section)
- [Feature Parity](#comparison-section)
- [Glossary](#glossary-section)

<br/>

## Quick Look

Here's what Expressive JSX looks like in practice:

```jsx
export const Card = ({ featured, children }) => {
  // These are called labels, legal JavaScript usually for loops
  // They can be repurposed to create styles and scopes
  background: white;
  padding: 24;
  radius: 12;
  shadow: 0xeee;

  // Conditional styling based on props and/or state
  if (featured) {
    border: 0x007bff, 2;
  }

  // Labeled blocks create reusable scopes
  header: {
    fontSize: 1.5;
    fontWeight: bold;
    marginBottom: 16;
  }

  button: {
    padding: 8, 16;
    radius: 6;
    background: 0x007bff;
    color: white;

    // Pseudo-selectors as string conditionals
    if (':hover') {
      background: 0x0056b3;
    }

    // scopes can be nested to apply to children or the same
    left: {
      // $variables stand-in for CSS variables
      background: $buttonLight;
    }
  }

  return (
    <div>
      <h2 _header>{children}</h2>
      {/* Apply same style to multiple elements with attributes */}
      <button _button _left>Learn More</button>
      <button _button>Share</button>
    </div>
  );
};
```

**Compiles to JSX with class names:**
```jsx
export const Card = ({ featured, children }) => {
  return (
    <div className={`Card_a3f ${featured ? 'featured_x9k' : ''}`}>
      <h2 className="header_b2c">{children}</h2>
      <button className="button_d4e left_f1g">Learn More</button>
      <button className="button_d4e">Share</button>
    </div>
  );
};
```

**And corresponding CSS:**
```css
.Card_a3f { background: white; padding: 24px; border-radius: 12px; box-shadow: #eee 0 0 10px; }
.featured_x9k { border: 2px solid #007bff; }
.header_b2c { font-size: 1.5em; font-weight: bold; margin-bottom: 16px; }
.button_d4e { padding: 8px 16px; border-radius: 6px; background: #007bff; color: white; }
.button_d4e:hover { background: #0056b3; }
```

Styles live directly in your component logic with zero runtime overhead. Underscore attributes (`_header`, `_button`) apply labeled styles, conditionals use native `if` statements, and it's all valid upcycled JavaScript!

<br/>

<h2 id="how-it-works-section">How It Works</h2>

Expressive JSX reinterprets existing JavaScript syntax to extract CSS intent:

- **JavaScript labels** (you know, those things from `for` loops?) become style scopes
  > You may have seen a `LabeledStatement` before, to look like this in practice:
  ```js
  function example() {
    top: for (let i = 0; i < 10; i++) {
      if (i === 5) break top;
    }
  }
  ```
- **Bare Identifiers** inside components become CSS properties
- **Underscore attributes** (`_label`) on JSX elements apply those styles
- At build time, a Babel plugin extracts this as metadata to generate stylesheets
- Components render with generated `className` - zero runtime needed!

It's not a custom DSL or new syntax. It's taking JavaScript features that exist but are rarely used, and giving them new meaning at build time.

<br/>
<h1 id="problem-section">Compare that to...</h1>

**Tailwind** requires memorizing utility classes and encourages class repetition:
```jsx
const Button = ({ primary, children }) => (
  <button className={`rounded-lg px-6 py-3 transition-all hover:brightness-110 ${
    primary ? 'bg-blue-600' : 'bg-gray-600'
  }`}>
    {children}
  </button>
);
```

**CSS Modules** require context switching between files:
```jsx
import styles from './Button.module.css';

const Button = ({ primary, children }) => (
  <button className={`${styles.button} ${primary ? styles.primary : ''}`}>
    {children}
  </button>
);
```

**Styled-components** add runtime overhead and wrapper components:
```jsx
const Button = styled.button`
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  border-radius: 8px;
  padding: 0.7rem 1.4rem;
`;
```

Expressive eliminates these drawbacks: no runtime, no separate files, no memorization, no wrapper components.

<br/>
<h1 id="features-section">Key Features</h1>

### Self-Styling Components

<table>
<tr>
<td width="50%">

**Expressive**
```jsx
const Card = ({ children }) => {
  background: white;
  borderRadius: 10;
  padding: 30;

  return <div>{children}</div>;
};
```

</td>
<td width="50%">

**CSS Modules**
```jsx
import styles from './Card.module.css';

const Card = ({ children }) => (
  <div className={styles.card}>
    {children}
  </div>
);
```
```css
.card {
  background: white;
  border-radius: 10px;
  padding: 30px;
}
```

</td>
</tr>
</table>

### Conditional Styles with `if` Statements

<table>
<tr>
<td width="50%">

**Expressive**
```jsx
const Button = ({ disabled }) => {
  cursor: pointer;

  if (disabled) {
    opacity: 0.4;
    cursor: notAllowed;
  }

  return <button>Click me</button>;
};
```

</td>
<td width="50%">

**CSS Modules**
```jsx
import styles from './Button.module.css';

const Button = ({ disabled }) => (
  <button
    className={classNames(
      styles.button,
      disabled && styles.disabled
    )}
  >
    Click me
  </button>
);
```
```css
.button { cursor: pointer; }
.disabled { opacity: 0.4; cursor: not-allowed; }
```

</td>
</tr>
</table>

**Note:** You can use camelCase identifiers as values (like `pointer` and `notAllowed`), which are automatically converted to kebab-case (`pointer` → `"pointer"`, `notAllowed` → `"not-allowed"`).

### Pseudo-Selectors as String Conditionals

```jsx
export const Link = (props) => {
  color: '#666';
  textDecoration: 'none';

  if (':hover') {
    color: '#007bff';
    textDecoration: 'underline';
  }

  if ('.active') {
    fontWeight: 'bold';
  }

  return <a {...props} />;
};
```

### Nested Selectors with Labels

Define styles once and reuse them infinitely. This avoids Tailwind's repetitive class strings:

<table>
<tr>
<td width="50%">

**Expressive**
```jsx
const Dashboard = () => {
  display: flex;
  gap: 20;

  card: {
    background: white;
    padding: 24;
    radius: 12;
    shadow: 0xeee;

    label: {
      fontSize: 0.875;
      color: 0x666;
      textTransform: uppercase;
    }

    value: {
      fontSize: 2;
      fontWeight: bold;
    }
  }

  return (
    <div>
      <div _card>
        <div _label>Revenue</div>
        <div _value>$45,231</div>
      </div>
      <div _card>
        <div _label>Users</div>
        <div _value>1,429</div>
      </div>
    </div>
  );
};
```

</td>
<td width="50%">

**Tailwind** (repetitive classes)
```jsx
const Dashboard = () => (
  <div className="flex gap-5">
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="text-sm text-gray-600 uppercase">
        Revenue
      </div>
      <div className="text-3xl font-bold">
        $45,231
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="text-sm text-gray-600 uppercase">
        Users
      </div>
      <div className="text-3xl font-bold">
        1,429
      </div>
    </div>
  </div>
);
```

</td>
</tr>
</table>

Reference labels with underscore attributes (`_inner`) to apply styles. This creates semantic, reusable style "slots" without the verbosity of Tailwind's repeated utility classes.

### Property Shorthands (Macros)

Expressive ships with common macros that expand CSS patterns. **All macros are user-definable** so you can customize or create your own:

```jsx
export const Box = () => {
  absolute: fill;              // → position: absolute; top: 0; right: 0; bottom: 0; left: 0;
  size: 100;                   // → width: 100px; height: 100px;
  radius: 'round';             // → border-radius: 999px;
  margin: 10, 20;              // → margin: 10px 20px;
  marginV: 20;                 // → margin-top: 20px; margin-bottom: 20px;
  shadow: 0xccc;               // → box-shadow: #ccc 0 0 10px;
  border: 0xddd, 2;            // → border: 2px solid #ddd;
  flexAlign: 'center';         // → display: flex; justify-content: center; align-items: center;

  return <div />;
};
```

Define custom macros in your Babel preset configuration; they're just functions which return a CSS property object.

```js
// Custom macro example
export function elevation(level) {
  const shadows = {
    1: '0 1px 3px rgba(0,0,0,0.12)',
    2: '0 3px 6px rgba(0,0,0,0.16)',
    3: '0 10px 20px rgba(0,0,0,0.19)',
  };
  return { boxShadow: shadows[level] };
}

// Usage in component
const Card = () => {
  elevation: 2;  // → box-shadow: 0 3px 6px rgba(0,0,0,0.16)
  return <div />;
};
```

### Smart Value Handling

Numbers and hex colors are automatically processed:

```jsx
const Component = () => {
  fontSize: 1.2;          // → font-size: 1.2em  (decimals → em)
  padding: 20;            // → padding: 20px     (integers → px)
  color: 0x007bff;        // → color: #007bff    (hex numbers)
  background: 0xfff8;     // → background: rgba(255, 255, 255, 0.533)  (hex with alpha)
  width: fill;            // → width: 100%       (keyword, camelCase → kebab-case)
  borderRadius: round;    // → border-radius: 999px (camelCase identifier)

  return <div />;
};
```

### CSS Variables

Use `$` prefix for theme variables (compiles to `var(--kebab-case)`):

```jsx
const Button = () => {
  // Define a CSS variable downstream
  $accent: 0x007bff;

  background: $accent;
  color: $textPrimary;

  if (':hover') {
    background: $accentHover;
  }

  return <button>Click</button>;
};
```

Compiles to CSS custom properties:
```css
.Button_xyz {
  --accent: #007bff;
  background: var(--accent);
  color: var(--text-primary);
}
```

<br/>
<h1 id="install-section">Installation</h1>

Choose your build tool and follow the installation steps below.

### Vite

```bash
npm install @expressive/vite-plugin
```

```js
// vite.config.js
import jsx from '@expressive/vite-plugin';
import react from '@vitejs/plugin-react';

export default {
  plugins: [
    jsx(),
    react()
  ]
};
```

### Next.js

```bash
npm install @expressive/nextjs-plugin
```

```js
// next.config.js
const withExpressive = require('@expressive/nextjs-plugin');

module.exports = withExpressive({
  // your Next.js config
});
```

### Webpack

```bash
npm install @expressive/webpack-plugin
```

```js
// webpack.config.js
const ExpressivePlugin = require('@expressive/webpack-plugin');

module.exports = {
  plugins: [
    new ExpressivePlugin()
  ]
};
```

<br/>
<h2 id="typescript-section">TypeScript Support</h2>

Install the TypeScript plugin for IDE autocomplete:

```bash
npm install --save-dev @expressive/typescript-plugin-jsx
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "plugins": [
      { "name": "@expressive/typescript-plugin-jsx" }
    ]
  }
}
```

### Other Build Tools

- **Babel**: `@expressive/babel-preset`
- **Parcel**: `@expressive/parcel-transformer-jsx`
- **Rollup**: `@expressive/rollup-plugin-jsx`

<br/>
<h1 id="comparison-section">Feature Parity</h1>

| Feature | Expressive | Tailwind | Styled Components | Emotion | CSS Modules | Inline Styles |
|---------|-----------|----------|-------------------|---------|-------------|---------------|
| **Learning curve** | Low | Medium | Medium | Medium | Low | None |
| **No runtime** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Pseudo-selectors** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Dynamic styles** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| **No wrapper components** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Type safety** | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ | ✅ |
| **Collocated styles** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **WYSIWYG (no memorization)** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Reusable style definitions** | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ |
| **Build-time extraction** | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ❌ |
| **Portable (no context switching)** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |


<br/>
<h1 id="learn-more-section">Learn More</h1>

- [Documentation](https://expressive.dev) (coming soon)
- [Examples](./examples)
- [GitHub](https://github.com/gabeklein/expressive-dsl)

<br/>
<h1 id="glossary-section">Glossary</h1>

Quick reference guide to Expressive JSX concepts and terminology.

### Self-Styling
Styles defined at the top of a component function (before any labels) that automatically apply to the outermost returned element(s). No need to reference them explicitly—they just work.

```jsx
const Card = () => {
  // These styles apply to the root <div>
  padding: 20;
  background: 'white';

  return <div>Content</div>;
};
```

### Labels
Named blocks that create scoped style contexts. Labels are referenced using underscore attributes (`_labelName`) on JSX elements.

```jsx
const Component = () => {
  header: {
    fontSize: 24;
    fontWeight: 'bold';
  }

  return <div _header>Title</div>;
};
```

### Underscore Attributes
The syntax used to apply labeled styles to elements: `<div _labelName />`. The underscore prefix tells Expressive to apply that label's styles. The attribute is removed in the final output.

### Macros
Functions that expand shorthand syntax into full CSS properties. **All macros are library or user-defined**—you have complete control to create your own design system. Expressive ships with common macros like `absolute`, `size`, `radius`, `margin`, `padding`, `shadow`, `border`, and `flexAlign`, but you can define custom ones in your Babel configuration.

```jsx
// Macro input
size: 100, 200;
radius: round;
absolute: fill;

// Expands to CSS
width: 100px;
height: 200px;
border-radius: 999px;
position: absolute;
top: 0; right: 0; bottom: 0; left: 0;
```

To create your own macro, define a function that returns CSS property objects:

```js
// In babel preset config
export function customMacro(arg) {
  return { customProperty: processedValue };
}
```

### Contexts
Internal structures that represent different scopes where styles can be defined:
- **Component context**: The top-level function scope
- **Label context**: Created by `labelName: { ... }`
- **Conditional context**: Created by `if (condition) { ... }`

### Conditional Styling
Using `if` statements to apply styles based on props or create CSS selectors:

```jsx
// Prop-based conditional
if (disabled) {
  opacity: 0.4;
}

// Pseudo-selector
if (':hover') {
  background: 'blue';
}

// Class selector
if ('.active') {
  fontWeight: 'bold';
}
```

### Auto-Unit Conversion
Automatic conversion of numeric values to CSS units:
- Integers → `px`: `20` becomes `"20px"`
- Decimals → `em`: `1.5` becomes `"1.5em"`
- Zero → `"0"` (no unit needed)

### CamelCase Value Identifiers
You can use camelCase identifiers as values, which are automatically converted to kebab-case strings:

```jsx
cursor: pointer;           // → cursor: "pointer"
cursor: notAllowed;        // → cursor: "not-allowed"
textDecoration: underline; // → text-decoration: "underline"
width: fill;               // → width: "100%" (special keyword)
borderRadius: round;       // → border-radius: "999px" (special keyword)
```

This provides cleaner syntax without quote marks for common CSS values.

### Hex Colors
Numeric hex color notation using `0x` prefix instead of `#`:

```jsx
color: 0xff0000;        // → color: #ff0000
background: 0xfff8;     // → background: rgba(255, 255, 255, 0.533) (with alpha)
```

### CSS Variables
Using `$` prefix to reference CSS custom properties. CamelCase is automatically converted to kebab-case:

```jsx
background: $primaryColor;     // → background: var(--primary-color)
border: $accentBorder;         // → border: var(--accent-border)
```

### Multi-Value Properties
Using comma syntax for properties that accept multiple values:

```jsx
padding: 10, 20;              // → padding: 10px 20px
margin: 5, 10, 15, 20;        // → margin: 5px 10px 15px 20px
```

### Build-Time Transformation
The entire process happens during the build—no runtime JavaScript is needed for styling. The Babel plugin transforms labeled statements into CSS, extracts them to separate files, and replaces them with className attributes.

### Virtual CSS Modules
In Vite, CSS is injected via virtual modules (prefixed with `\0virtual:css:*`) that are automatically imported into your components. This enables hot module replacement (HMR) during development.

<br/>
<br/>

## License

MIT

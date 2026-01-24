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
- [Compare that to...](#problem-section)
- [Key Features](#features-section)
- [Installation](#install-section)
- [Comparison with Alternatives](#comparison-section)
- [TypeScript Support](#typescript-section)
- [Glossary](#glossary-section)

<br/>

## Quick Look

Here's what Expressive JSX looks like in practice:

```jsx
export const Card = ({ featured, children }) => {
  // Self-styling - these properties apply to the root element
  background: white;
  padding: 24;
  radius: 12;
  shadow: 0xeee;

  // Conditional styling based on props and/or state
  if (featured) {
    border: 0x007bff, 2;
  }

  // Labeled blocks create reusable style scopes
  header: {
    fontSize: 1.5;
    fontWeight: 'bold';
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

    left: {
      // $variables stand-in for CSS variables
      background: $buttonLight;
    }
  }

  return (
    <div>
      <h2 _header>{children}</h2>
      {/* Apply the same styles to multiple elements with underscore attributes */}
      <button _button _left>Learn More</button>
      <button _button>Share</button>
    </div>
  );
};
```

**Compiles to real CSS at build time:**
```css
.Card_a3f { background: white; padding: 24px; border-radius: 12px; box-shadow: #eee 0 0 10px; }
.featured_x9k { border: 2px solid #007bff; }
.header_b2c { font-size: 1.5em; font-weight: bold; margin-bottom: 16px; }
.button_d4e { padding: 8px 16px; border-radius: 6px; background: #007bff; color: white; }
.button_d4e:hover { background: #0056b3; }
```

**Key points:**
- Styles live directly in your component logic
- No wrapper components, no separate CSS files
- Underscore attributes (`_header`, `_button`) apply labeled styles—reuse them infinitely
- Conditionals use native `if` statements
- Zero runtime overhead—everything extracts to CSS
- It's all perfectly-valid JS, no custom syntax or DSL.

<br/>

<h2 id="how-it-works-section">How It Works</h2>

Expressive JSX reinterprets existing JavaScript syntax to extract CSS intent:

- **JavaScript labels** (you know, those things from `for` loops?) become style scopes
- **Bare property assignments** inside components become CSS properties
- **Underscore attributes** (`_label`) on JSX elements apply those styles
- At build time, a Babel plugin extracts this metadata and generates context-appropriate stylesheets
- Components render with generated `className` attributes—zero runtime overhead

It's not a custom DSL or new syntax. It's taking JavaScript features that exist but are rarely used, and giving them new purpose at build time.

<br/>
<h1 id="problem-section">Compare that to...</h1>

Modern React components mix styling approaches, creating friction. Each approach has significant drawbacks:

<br />

**Tailwind** forces you to memorize abstractions and creates redundant markup:
```jsx
const Button = ({ primary, children }) => (
  <button className={`rounded-lg px-6 py-3 transition-all hover:brightness-110 ${
    primary ? 'bg-blue-600' : 'bg-gray-600'
  }`}>
    {children}
  </button>
);

// Every similar button repeats the same classes
const SecondaryButton = ({ secondary, children }) => (
  <button className={`rounded-lg px-6 py-3 transition-all hover:brightness-110 ${
    secondary ? 'bg-purple-600' : 'bg-gray-600'
  }`}>
    {children}
  </button>
);
```

<br />

**CSS Modules** require context switching between files:
```jsx
import styles from './Button.module.css';

const Button = ({ primary, children }) => (
  <button className={`${styles.button} ${primary ? styles.primary : ''}`}>
    {children}
  </button>
);
```
```css
/* Button.module.css */
.button {
  border-radius: 8px;
  padding: 0.7rem 1.4rem;
}
.button:hover {
  filter: brightness(1.1);
}
.primary {
  background: #007bff;
}
```

<br />

**Styled-components** add runtime overhead and wrapper components:
```jsx
const Button = styled.button`
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  border-radius: 8px;
  padding: 0.7rem 1.4rem;

  &:hover {
    filter: brightness(1.1);
  }
`;
```

<br />

**Problems with traditional approaches:**
- Styled-components add runtime overhead and wrapper components
- CSS Modules require context switching between files
- Tailwind requires memorizing utility class names (not WYSIWYG)
- Tailwind encourages copy-pasting redundant class strings
- Inline styles don't support pseudo-selectors or media queries
- All approaches separate styling logic from component logic

<br/>
<h1 id="features-section">Key Features</h1>

### Self-Styling Components

Style the component itself before the return statement:

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
/* Card.module.css */
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

Clean, readable conditionals vs className manipulation:

<table>
<tr>
<td width="50%">

### **Expressive**
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
<td width="50%" rowspan="2">

### **CSS Modules**
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
/* Button.module.css */
.button {
  cursor: pointer;
}
.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

</td>
</tr>
<tr>
<td width="50%">

### **Tailwind**
```jsx
const Button = ({ disabled }) => (
  <button className={
    disabled
      ? 'cursor-not-allowed opacity-40'
      : 'cursor-pointer'
  }>
    Click me
  </button>
);
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

Create scoped child styles using labeled blocks. This solves Tailwind's redundancy problem:

<table>
<tr>
<td width="50%">

**Expressive**
```jsx
const Dashboard = ({ stats }) => {
  display: flex;
  gap: 20;
  padding: 20;

  // Define card styles once
  card: {
    background: white;
    padding: 24;
    radius: 12;
    shadow: 0xeee;
    flexGrow: 1;

    // Nesting selectors keeps things clear
    // Only _label and _value inside of _card get these styles
    label: {
      fontSize: 0.875;
      color: 0x666;
      textTransform: uppercase;
    }

    value: {
      fontSize: 2;
      fontWeight: bold;
      marginTop: 8;
    }
  }

  return (
    <div>
      {/* Reuse label styles across multiple cards */}
      <div _card>
        <div _label>Revenue</div>
        <div _value>$45,231</div>
      </div>

      <div _card>
        <div _label>Users</div>
        <div _value>1,429</div>
      </div>

      <div _card>
        <div _label>Orders</div>
        <div _value>234</div>
      </div>
    </div>
  );
};
```

</td>
<td width="50%">

**Tailwind** (repetitive classes)
```jsx
const Dashboard = ({ stats }) => (
  <div className="flex gap-5 p-5">
    {/* Same classes repeated for each card */}
    <div className="bg-white p-6 rounded-xl shadow-sm flex-grow">
      <div className="text-sm text-gray-600 uppercase">
        Revenue
      </div>
      <div className="text-3xl font-bold mt-2">
        $45,231
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-sm flex-grow">
      <div className="text-sm text-gray-600 uppercase">
        Users
      </div>
      <div className="text-3xl font-bold mt-2">
        1,429
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-sm flex-grow">
      <div className="text-sm text-gray-600 uppercase">
        Orders
      </div>
      <div className="text-3xl font-bold mt-2">
        234
      </div>
    </div>
  </div>
);
```

</td>
</tr>
</table>

**Note:** Reference labels with underscore attributes (`_inner`) to apply styles. This creates semantic, reusable style "slots" without the verbosity of Tailwind's repeated utility classes.

### Property Shorthands (Macros)

**All macros are library or user-defined**—including the built-in ones. You have full agency to create your own design system.

Expressive ships with common macros that expand CSS patterns:

```jsx
export const Box = () => {
  // Positioning
  absolute: fill;              // → position: absolute; top: 0; right: 0; bottom: 0; left: 0;
  absolute: 'top-left';        // → position: absolute; top: 0; left: 0;

  // Sizing
  size: 100;                   // → width: 100px; height: 100px;
  size: 50, 100;               // → width: 50px; height: 100px;

  // Border radius
  radius: 8;                   // → border-radius: 8px;
  radius: 'round';             // → border-radius: 999px;

  // Margins & Padding (multi-value)
  margin: 10, 20;              // → margin: 10px 20px;
  padding: 5, 10, 15, 20;      // → padding: 5px 10px 15px 20px;

  // Directional shortcuts
  marginV: 20;                 // → margin-top: 20px; margin-bottom: 20px;
  paddingH: 15;                // → padding-left: 15px; padding-right: 15px;

  // Shadows
  shadow: 0xccc;               // → box-shadow: #ccc 0 0 10px;
  shadow: 0x000, 10, 5, 2;     // → box-shadow: #000 10px 5px 2px;

  // Borders
  border: 0xddd;               // → border: 1px solid #ddd;
  border: 0xddd, 2;            // → border: 2px solid #ddd;

  // Flex alignment
  flexAlign: 'center';         // → display: flex; justify-content: center; align-items: center;
  flexAlign: 'center', 'down'; // → display: flex; justify-content: center; flex-direction: column;

  return <div />;
};
```

**Want your own macros?** Define them in your Babel preset configuration. Macros are just functions that return CSS property objects:

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

### React Native Support (Coming Soon)

Expressive will soon support React Native, making cross-platform styling simpler:

```jsx
// Works on both Web and Native
const Button = ({ primary }) => {
  paddingH: 20;
  paddingV: 10;
  borderRadius: 8;

  if (primary) {
    backgroundColor: 0x007bff;
  }

  return <Pressable>
    <Text>Click me</Text>
  </Pressable>;
};
```

**Advantages for React Native:**
- No StyleSheet.create boilerplate
- Conditional styles without array spreading
- Shared style definitions between platforms
- Type-safe styling without manual TypeScript definitions

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

Use `$` prefix for theme variables:

```jsx
const Button = () => {
  background: $accent;
  border: $border;
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
  background: var(--accent);
  border: var(--border);
  color: var(--text-primary);
}
```

### Multi-level Nesting

Labels can nest indefinitely for complex component structures:

```jsx
export const Table = ({ children }) => {
  outer: {
    radius: 8;
    border: 0xeee;
    overflow: 'hidden';
  }

  inner: {
    height: 'fill';
    overflow: 'auto';
  }

  table: {
    borderCollapse: 'collapse';
    minWidth: 'fill';
  }

  return (
    <div _outer>
      <div _inner>
        <table>{children}</table>
      </div>
    </div>
  );
};
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
<h1 id="comparison-section">Comparison with Alternatives</h1>

| Feature | Expressive | Tailwind | Styled Components | Emotion | CSS Modules | Inline Styles |
|---------|-----------|----------|-------------------|---------|-------------|---------------|
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
| **Learning curve** | Low | Medium | Medium | Medium | Low | None |

### Why Expressive vs Tailwind?

While Tailwind is popular, it has key limitations:

1. **Memorization required**: You must learn utility class names (`px-4`, `rounded-lg`, `bg-blue-500`) instead of writing standard CSS
2. **Class repetition**: Similar elements require copy-pasting the same class strings
3. **Not portable**: Moving a component means moving its class list, which isn't self-contained
4. **Harder to read**: `className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"` vs readable CSS properties

**Expressive gives you Tailwind's colocation without the abstractions:**

<table>
<tr>
<td width="50%">

**Expressive** (WYSIWYG)
```jsx
const Card = () => {
  display: flex;
  alignItems: center;
  justifyContent: spaceBetween;
  padding: 16;
  background: white;
  borderRadius: 8;
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)';

  return <div>Content</div>;
};
```

</td>
<td width="50%">

**Tailwind** (memorization)
```jsx
const Card = () => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
    Content
  </div>
);
```

</td>
</tr>
</table>

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

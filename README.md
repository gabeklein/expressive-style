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
<h1 id="problem-section">The Problem</h1>

Modern React components mix styling approaches, creating friction:

```jsx
// Styled-components: wrapper components everywhere
const Button = styled.button`
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  border-radius: 8px;
  padding: 0.7rem 1.4rem;

  &:hover {
    filter: brightness(1.1);
  }
`;

// Or CSS Modules: external files, generated class names
import styles from './Button.module.css';

const Button = ({ primary, children }) => (
  <button className={`${styles.button} ${primary ? styles.primary : ''}`}>
    {children}
  </button>
);
```

**Problems:**
- Styled-components add runtime overhead and wrapper components
- CSS Modules require context switching between files
- Inline styles don't support pseudo-selectors or media queries
- All approaches separate styling logic from component logic

<br/>
<h1 id="solution-section">The Expressive Way</h1>

Write CSS directly in your component function body using JavaScript labels:

```jsx
export const Button = ({ primary, children }) => {
  background: primary ? '#007bff' : '#6c757d';
  borderRadius: 8;
  padding: 0.7, 1.4;

  if (':hover') {
    filter: 'brightness(1.1)';
  }

  return <button>{children}</button>;
};
```

**Compiles to:**
```jsx
export const Button = ({ primary, children }) => (
  <button className={classNames('Button_a3f', primary && 'primary_x9k')}>
    {children}
  </button>
);
```

**Generates CSS:**
```css
.Button_a3f {
  border-radius: 8px;
  padding: 0.7rem 1.4rem;
}
.primary_x9k {
  background: #007bff;
}
.Button_a3f:hover {
  filter: brightness(1.1);
}
```

<br/>
<h1 id="features-section">Key Features</h1>

### 1. Self-Styling Components

Style the component itself before the return statement:

<table>
<tr>
<td>

**Traditional**
```jsx
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
<td>

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
</tr>
</table>

### 2. Conditional Styles with `if` Statements

<table>
<tr>
<td>

**Traditional**
```jsx
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

</td>
<td>

**Expressive**
```jsx
const Button = ({ disabled }) => {
  cursor: 'pointer';

  if (disabled) {
    opacity: 0.4;
    cursor: 'not-allowed';
  }

  return <button>Click me</button>;
};
```

</td>
</tr>
</table>

### 3. Pseudo-Selectors as String Conditionals

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

### 4. Nested Selectors with Labels

Create scoped child styles using labeled blocks:

<table>
<tr>
<td>

**Traditional**
```jsx
const Modal = ({ children }) => (
  <div className={styles.modal}>
    <div className={styles.inner}>
      {children}
    </div>
  </div>
);
```
```css
.modal {
  background: rgba(0,0,0,0.5);
  position: fixed;
}
.inner {
  background: white;
  padding: 30px;
  border-radius: 10px;
}
```

</td>
<td>

**Expressive**
```jsx
const Modal = ({ children }) => {
  background: 0x0008;
  position: 'fixed';

  inner: {
    background: 'white';
    padding: 30;
    radius: 10;
  }

  return (
    <div>
      <div _inner>
        {children}
      </div>
    </div>
  );
};
```

</td>
</tr>
</table>

**Note:** Reference labels with underscore attributes (`_inner`) to apply styles.

### 5. Property Shorthands (Macros)

Expressive includes built-in macros that expand common CSS patterns:

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

### 6. Smart Value Handling

Numbers and hex colors are automatically processed:

```jsx
const Component = () => {
  fontSize: 1.2;          // → font-size: 1.2em  (decimals → em)
  padding: 20;            // → padding: 20px     (integers → px)
  color: 0x007bff;        // → color: #007bff    (hex numbers)
  background: 0xfff8;     // → background: rgba(255, 255, 255, 0.533)  (hex with alpha)
  width: 'fill';          // → width: 100%       (keyword)
  borderRadius: 'round';  // → border-radius: 999px

  return <div />;
};
```

### 7. CSS Variables

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

### 8. Multi-level Nesting

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

<br/>

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

### Other Build Tools

- **Babel**: `@expressive/babel-preset`
- **Parcel**: `@expressive/parcel-transformer-jsx`
- **Rollup**: `@expressive/rollup-plugin-jsx`

<br/>
<h1 id="comparison-section">Comparison with Alternatives</h1>

| Feature | Expressive | Styled Components | Emotion | CSS Modules | Inline Styles |
|---------|-----------|-------------------|---------|-------------|---------------|
| **No runtime** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Pseudo-selectors** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Dynamic styles** | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| **No wrapper components** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Type safety** | ✅ | ⚠️ | ⚠️ | ❌ | ✅ |
| **Collocated styles** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Build-time extraction** | ✅ | ⚠️ | ⚠️ | ✅ | ❌ |
| **Learning curve** | Low | Medium | Medium | Low | None |

<br/>
<h1 id="how-it-works-section">How It Works</h1>

1. **Parse**: Babel plugin detects labeled statements in JSX files
2. **Transform**: Labels become CSS class definitions, styles are extracted
3. **Extract**: CSS is written to virtual modules or separate files
4. **Apply**: Component renders with generated class names

```jsx
// Input
const Button = () => {
  color: 'white';
  background: $accent;

  return <button>Click</button>;
};

// Output (simplified)
const Button = (props) => (
  <button className={classNames(props.className, 'Button_a3f')}>
    Click
  </button>
);

// CSS
.Button_a3f {
  color: white;
  background: var(--accent);
}
```

<br/>
<h1 id="example-section">Real-World Example</h1>

Here's a complete modal component from a production app:

```jsx
export const Modal = ({ className, children }) => {
  FullScreen: {
    position: 'fixed';
    top: 0;
    left: 0;
    width: '100vw';
    height: '100vh';
    background: 0xfff3;
    display: 'flex';
    justifyContent: 'center';
    alignItems: 'center';
    zIndex: 1000;
  }

  inner: {
    padding: 30, 50, 50;
    maxHeight: 'calc(100vh - 150px)';
    animation: 'fadeInUp 0.3s ease-out forwards';
    background: 'white';
    shadow: 0xccc;
    borderRadius: 10;
    position: 'relative';
    overflow: 'hidden';
    overflowY: 'auto';
  }

  return (
    <div _inner className={className}>
      {children}
    </div>
  );
}
```

**Clean, readable, and fully featured.**

<br/>
<h1 id="typescript-section">TypeScript Support</h1>

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

<br/>
<h1 id="learn-more-section">Learn More</h1>

- [Documentation](https://expressive.dev) (coming soon)
- [Examples](./examples)
- [GitHub](https://github.com/gabeklein/expressive-dsl)

<br/>
<h1 id="glossary-section">Glossary</h1>

Quick reference guide to Expressive JSX concepts and terminology.

<br/>

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

<br/>

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

<br/>

### Underscore Attributes
The syntax used to apply labeled styles to elements: `<div _labelName />`. The underscore prefix tells Expressive to apply that label's styles. The attribute is removed in the final output.

<br/>

### Macros
Built-in functions that expand shorthand syntax into full CSS properties. Examples include `absolute`, `size`, `radius`, `margin`, `padding`, `shadow`, `border`, and `flexAlign`.

```jsx
// Macro input
size: 100, 200;
radius: 'round';
absolute: fill;

// Expands to CSS
width: 100px;
height: 200px;
border-radius: 999px;
position: absolute;
top: 0; right: 0; bottom: 0; left: 0;
```

<br/>

### Contexts
Internal structures that represent different scopes where styles can be defined:
- **Component context**: The top-level function scope
- **Label context**: Created by `labelName: { ... }`
- **Conditional context**: Created by `if (condition) { ... }`

<br/>

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

<br/>

### Auto-Unit Conversion
Automatic conversion of numeric values to CSS units:
- Integers → `px`: `20` becomes `"20px"`
- Decimals → `em`: `1.5` becomes `"1.5em"`
- Zero → `"0"` (no unit needed)

<br/>

### Hex Colors
Numeric hex color notation using `0x` prefix instead of `#`:

```jsx
color: 0xff0000;        // → color: #ff0000
background: 0xfff8;     // → background: rgba(255, 255, 255, 0.533) (with alpha)
```

<br/>

### CSS Variables
Using `$` prefix to reference CSS custom properties. CamelCase is automatically converted to kebab-case:

```jsx
background: $primaryColor;     // → background: var(--primary-color)
border: $accentBorder;         // → border: var(--accent-border)
```

<br/>

### Multi-Value Properties
Using comma syntax for properties that accept multiple values:

```jsx
padding: 10, 20;              // → padding: 10px 20px
margin: 5, 10, 15, 20;        // → margin: 5px 10px 15px 20px
```

<br/>

### Build-Time Transformation
The entire process happens during the build—no runtime JavaScript is needed for styling. The Babel plugin transforms labeled statements into CSS, extracts them to separate files, and replaces them with className attributes.

<br/>

### Virtual CSS Modules
In Vite, CSS is injected via virtual modules (prefixed with `\0virtual:css:*`) that are automatically imported into your components. This enables hot module replacement (HMR) during development.

<br/>
<br/>

## License

MIT

# Authoring Syntax

Use this reference when writing Expressive JSX in consumer components or reviewing generated examples.

## Core Rules

- Expressive styles only work in `.jsx` files.
- Styles are valid JavaScript labels and expressions interpreted at build time.
- Top-level style declarations in a component apply to the outermost returned element.
- Named labeled blocks create reusable scopes.
- JSX attributes prefixed with `_` apply named scopes and are removed from output.

## Self-Styling

Styles written at the top level of a component function automatically apply to the root returned element.

```jsx
const Card = ({ children }) => {
  background: white;
  padding: 24;
  borderRadius: 8;

  return <div>{children}</div>;
};
```

Expected output shape:

```jsx
// JSX: <div className="Card_a3f">...</div>
// CSS: .Card_a3f { background: white; padding: 24px; border-radius: 8px; }
```

## Named Scopes

Use labels to define reusable style scopes. Apply them with underscore attributes.

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

Multiple scopes can be combined:

```jsx
<div _card _highlighted />
```

## Conditional Styles

Runtime expression tests create conditional classes:

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

String literal tests create CSS selectors:

```jsx
if (':hover') {
  background: 0x0056b3;
}

if (':focus') {
  outline: '2px solid blue';
}

if ('.active') {
  fontWeight: bold;
}

if ('& > span') {
  color: red;
}

if ('.wrapper &') {
  padding: 20;
}
```

Else branches are supported:

```jsx
if (active)
  color: 0x007bff;
else
  color: 0x666;
```

Nested conditionals compose:

```jsx
if (ready) {
  color: blue;

  if (':hover') {
    color: green;
  }
}
```

## Value Processing

Numbers:

| Input | Output | Rule |
| --- | --- | --- |
| `20` | `20px` | Integers become px |
| `1.5` | `1.5em` | Decimals become em |
| `0` | `0` | Zero has no unit |

Hex colors:

```jsx
color: 0xff0000;
background: 0x007bff;
background: 0xfff8;
```

Bare identifiers become kebab-case strings:

```jsx
cursor: pointer;
cursor: notAllowed;
textDecoration: underline;
boxSizing: borderBox;
```

Special keywords:

| Keyword | Output |
| --- | --- |
| `fill` | `100%` |
| `round` | `999px` |

CSS variables:

```jsx
background: $primaryColor;
color: $textPrimary;

$accent: 0x007bff;
```

Multi-value properties use comma syntax:

```jsx
padding: 10, 20;
margin: 5, 10, 15, 20;
```

Do not use arrays for CSS multi-values.

## Built-In Macros

Position:

```jsx
absolute: fill;
absolute: fill, 10;
absolute: fill, 10, 20;
absolute: fill-top;
absolute: 10, 20, 30, 40;
```

Size:

```jsx
size: 100;
size: 100, 200;
```

Border:

```jsx
border: 0xddd;
border: 0xddd, 2;
```

Radius:

```jsx
radius: 8;
radius: round;
```

Shadow:

```jsx
shadow: 0xccc;
```

Spacing:

```jsx
margin: 10, 20;
padding: 10, 20;
marginV: 20;
marginH: 20;
```

Flex:

```jsx
flexAlign: center;
```

Transform:

```jsx
transform: translateX(10), rotate(45), scale(2);
```

Transform units are inferred: `translate*` and `perspective` use px, `rotate*` and `skew*` use deg, and `scale*` stays unitless.

## Custom Macros

Macros are configured through the Babel preset and return CSS property objects.

```js
{
  macros: [{
    elevation(level) {
      const shadows = {
        1: '0 1px 3px rgba(0,0,0,0.12)',
        2: '0 3px 6px rgba(0,0,0,0.16)',
        3: '0 10px 20px rgba(0,0,0,0.19)'
      };

      return { boxShadow: shadows[level] };
    }
  }]
}
```

Usage:

```jsx
const Card = () => {
  elevation: 2;
  return <div />;
};
```

## Automatic Behaviors

When a component has Expressive styles, the plugin automatically forwards `className` from props onto the root element so parent scopes can compose with child component styles.

Parameter behavior:

- Destructured params: `className` is added to the destructuring.
- `props` identifier: `props.className` is appended to the root element.
- No params: a `props` param can be injected to access `className`.

Plain components with no Expressive styles are not modified.

If a styled component returns a fragment, it is wrapped in a `div` so the generated class can be attached.

## Common Patterns

Button:

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
      <span _icon />
      Click Me
    </button>
  );
};
```

Layout:

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

Theme variables:

```jsx
export const ThemeProvider = ({ children }) => {
  $accent: 0x007bff;
  $textPrimary: 0x333;
  $background: 0xffffff;
  $border: 0xeee;

  return <div>{children}</div>;
};
```

## Gotchas

1. `.jsx` only: do not assume `.tsx` is transformed.
2. Use `0x` for hex colors, not `#`, because the syntax must be valid JavaScript.
3. Use commas for multi-values: `padding: 10, 20`, not `padding: [10, 20]`.
4. Integers become px and decimals become em: `padding: 1` is `1px`; `padding: 1.0` is `1em`.
5. Label names cannot match the component name.
6. Bare identifiers become kebab-case strings; common CSS identifiers do not need quotes.
7. Top-level styles auto-apply to the root element.
8. `_` attributes are build-time only and do not appear in rendered HTML.
9. String `if` tests create CSS selectors.
10. Expression `if` tests create runtime conditional classes.

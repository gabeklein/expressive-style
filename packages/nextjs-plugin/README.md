# @expressive/nextjs-plugin-style

Next.js plugin for [Expressive JSX](https://github.com/gabeklein/expressive-dsl) - write CSS directly in your JSX components.

## Installation

```bash
npm install @expressive/nextjs-plugin-style
```

## Usage

```javascript
// next.config.js
const withExpressive = require('@expressive/nextjs-plugin-style');

module.exports = withExpressive({
  // Your Next.js config here
  reactStrictMode: true,
  // ... other Next.js options
});
```

### With Custom Options

You can pass Expressive JSX options as the first argument:

```javascript
const withExpressive = require('@expressive/nextjs-plugin-style');

module.exports = withExpressive({
  // Expressive options
  macros: [require('./my-custom-macros')],
})({
  // Next.js config
  reactStrictMode: true,
});
```

### With Other Next.js Plugins

Compose with other Next.js plugins:

```javascript
const withExpressive = require('@expressive/nextjs-plugin-style');
const withBundleAnalyzer = require('@next/bundle-analyzer');

module.exports = withExpressive(
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  })({
    // Next.js config
  })
);
```

## Requirements

- Next.js 13 or later
- Currently supports Webpack builds only (Turbopack not yet supported)

## Turbopack Support

Turbopack is not yet supported because:
- Turbopack is still experimental in Next.js
- The plugin API is unstable and subject to change
- Most production Next.js apps use Webpack (the stable default)

If you try to use Expressive JSX with Turbopack enabled, you'll see a warning message. To use Expressive JSX:

```bash
# Start dev server without Turbopack
next dev

# Or remove from config:
// next.config.js
module.exports = {
  experimental: {
    // turbo: {...}  // Comment this out
  }
};
```

## How It Works

This plugin wraps `@expressive/webpack-plugin-style` and integrates it into Next.js's webpack configuration. It automatically:

1. Processes `.jsx` files in your Next.js app
2. Transforms Expressive JSX syntax to standard React + CSS
3. Extracts CSS and injects it into your app
4. Supports Hot Module Replacement (HMR)

## Learn More

- [Expressive JSX Documentation](https://github.com/gabeklein/expressive-dsl)
- [Examples](https://github.com/gabeklein/expressive-dsl/tree/main/examples)
- [API Reference](https://github.com/gabeklein/expressive-dsl/blob/main/packages/babel-preset/README.md)

## License

MIT

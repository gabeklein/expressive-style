# Testing

Tests live primarily in `packages/*/src/tests/*.test.ts`, with package-specific tests near their implementation.

Common files:

- `basic.test.ts`
- `styles.test.ts`
- `pseudo.test.ts`
- `values.test.ts`
- `macro.test.ts`

## Parser Snapshot Pattern

Most transformation tests call `parser(...)` and assert both transformed JSX and generated CSS.

```ts
const output = await parser(`
  const Component = () => {
    background: white;
    return <div />;
  };
`);

expect(output.code).toMatchInlineSnapshot(`...`);
expect(output.css).toMatchInlineSnapshot(`...`);
```

When updating snapshots, inspect both outputs. A JSX-only change can still imply a CSS regression, and a CSS-only change can reveal ordering, selector, or class-name issues.

## Commands

Run all tests:

```bash
pnpm test
```

Run focused files where supported by Vitest:

```bash
pnpm test -- packages/babel-plugin-jsx/src/tests/basic.test.ts
pnpm test -- packages/babel-preset/src/tests/macro.test.ts
pnpm test -- packages/css/src/color.test.ts
```

Build all packages:

```bash
pnpm build
```

## Test Strategy

- For parser or label changes, cover JSX output and CSS output.
- For value processing, include integer, decimal, zero, identifier, color, and CSS variable cases when relevant.
- For conditionals, test runtime conditions separately from string selector conditions.
- For build-tool integrations, keep tests focused on integration behavior and avoid re-testing shared Babel semantics.
- For TypeScript language service changes, verify completions/diagnostics around `.jsx` authoring behavior.

## Snapshot Guardrails

- Do not update snapshots mechanically.
- Check class-name stability, selector nesting, CSS declaration order, and emitted `className` expressions.
- Preserve underscore attribute removal from emitted JSX.
- Preserve `className` forwarding behavior for styled components.

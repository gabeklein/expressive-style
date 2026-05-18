# Install And Bootstrap

## Consumer App Installation

Expressive JSX only transforms `.jsx` files. Do not expect `.tsx` files to be processed unless the package behavior has changed and tests/docs have been updated.

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

module.exports = {
  plugins: [new ExpressivePlugin()]
};
```

### Next.js

Next.js support targets Webpack mode, not Turbopack.

```bash
npm install @expressive/nextjs-plugin
npx next --webpack
```

```js
// next.config.js
const withExpressive = require('@expressive/nextjs-plugin');

module.exports = withExpressive({
  // next config
});
```

### TypeScript IDE Support

```bash
npm install --save-dev @expressive/typescript-plugin-jsx
```

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "@expressive/typescript-plugin-jsx" }]
  }
}
```

## Repository Bootstrap

Install dependencies from the monorepo root:

```bash
pnpm install
```

Build all packages:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Run the REPL/docs app:

```bash
pnpm repl
```

## Skill Installation

Install the Expressive JSX skill from a local checkout:

```bash
./skills.sh
```

Install only this skill:

```bash
./skills.sh --skill expressive-jsx
```

List available skills:

```bash
./skills.sh --list
```

Install into an explicit Codex skills directory:

```bash
./skills.sh --dest ~/.codex/skills
```

When installed, restart Codex so the skill list is reloaded.

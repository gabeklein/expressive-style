# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.4.0](https://github.com/gabeklein/expressive-dsl/compare/v0.3.2...v0.4.0) (2026-03-11)


### Bug Fixes

* add .vscode/settings.json and .claude/settings.local.json to .gitignore ([bd150c7](https://github.com/gabeklein/expressive-dsl/commit/bd150c7db9eaaccc715e9e5495c8fb317c5b2839))
* add @types/react to devDependencies for type definitions ([bf786eb](https://github.com/gabeklein/expressive-dsl/commit/bf786eb5b289b7bc282f2e0826b4eec59a537c69))
* add logging and strip query from load ([211b3b6](https://github.com/gabeklein/expressive-dsl/commit/211b3b6c9043dee0644ced82288cd444f2ed0bcd))
* add missing class on element nested within pseudo selector ([c58ffa8](https://github.com/gabeklein/expressive-dsl/commit/c58ffa8553b28053f6d87ab85f980cc3f3b8ba0c))
* correct import paths in App and Interface components ([479c33c](https://github.com/gabeklein/expressive-dsl/commit/479c33cbfa4d699848e8f85f748331f1aaeda824))
* correct return flow in getName function to prevent unreachable code ([9322f70](https://github.com/gabeklein/expressive-dsl/commit/9322f706c93eff621dfd8835a60f00845f3cd7ad))
* correct return statements in SiteLogo and Thing components ([a5001a1](https://github.com/gabeklein/expressive-dsl/commit/a5001a12e0152dddb03e06f5ace4635f9d8512ee))
* correct template literal handling in parseExpression function ([e70f0aa](https://github.com/gabeklein/expressive-dsl/commit/e70f0aaf14f8c6a66217310d36ed8d7acf23905d))
* corrected css sort order ([72df66f](https://github.com/gabeklein/expressive-dsl/commit/72df66f853e2f963715ba8008f564456bd3505df))
* **dependencies:** add @docs/repl as a workspace dependency ([092e3c5](https://github.com/gabeklein/expressive-dsl/commit/092e3c592ccdeabe4cf87c09c834fd6510c9e57b))
* disable webpack caching configuration in next.js plugin for testing and debug ([7b17205](https://github.com/gabeklein/expressive-dsl/commit/7b17205cb7052246529b85c6dac90d2315dd608c))
* expose Extension for infered types ([f55ebdf](https://github.com/gabeklein/expressive-dsl/commit/f55ebdf687b36b6cd090803c7311bb5f2d46652a))
* HMR support for SSR and SSG ([e477914](https://github.com/gabeklein/expressive-dsl/commit/e477914a8b571dbca707ffa3c10daf03dc8d8e69))
* implement CacheEntry to fix HMR for dynamic elements ([89c7e2e](https://github.com/gabeklein/expressive-dsl/commit/89c7e2e91af84bce2df03a9301d05e6390cd781a))
* improve handling of stale compilations in ExpressiveJSXPlugin ([b48cde3](https://github.com/gabeklein/expressive-dsl/commit/b48cde326bdc4d4afb79049c4b6a9803fc10c7fd))
* improve target detection logic and ensure css module registration ([1f7496b](https://github.com/gabeklein/expressive-dsl/commit/1f7496b631af3b6adcaaaa01e7bdfd234dcc4f09))
* improve VirtualFiles plugin resolution logic and enhance source mapping ([a723828](https://github.com/gabeklein/expressive-dsl/commit/a72382862a2ef186985ae1318f7906a9c2d7b691))
* improved editors using updated expressive/state ([6b02068](https://github.com/gabeklein/expressive-dsl/commit/6b02068710b66d8a0430d5e6b5b3616d4d15b50e))
* improved webpack-plugin handling of modules ([b701f34](https://github.com/gabeklein/expressive-dsl/commit/b701f34fdd1e25122a8f60cca90174d1baa94f16))
* **logo:** adjust SiteLogo dimensions and update Svg font size ([586d346](https://github.com/gabeklein/expressive-dsl/commit/586d346de4e69803aa0356eb64b4cc945bdb70e1))
* optimized classNamesHelper ([9be3b1d](https://github.com/gabeklein/expressive-dsl/commit/9be3b1da31465df3a36002de49b3340b40ba87ba))
* **playground:** replace lazy loading with dynamic import for Repl component ([42db528](https://github.com/gabeklein/expressive-dsl/commit/42db528e8a5c735dd9fc0dda9a42c764205d1e39))
* prevent empty css modules in plugin ([2b2bdf0](https://github.com/gabeklein/expressive-dsl/commit/2b2bdf05731ab1166cd04088ebf5bed8ef57e30b))
* Remove test for binding when asserting if JSX component ([4d81f64](https://github.com/gabeklein/expressive-dsl/commit/4d81f64ac5f1c436f0ae64ac89c2b190b23de00a))
* remove unused babel-preset dependency and adjust imports in nextjs-plugin ([0b8802f](https://github.com/gabeklein/expressive-dsl/commit/0b8802f196a771db8656101a7c879452f47f0df0))
* rename nextjs local import for expressive plugin ([10573d0](https://github.com/gabeklein/expressive-dsl/commit/10573d0e3c8ecb49bbeb35714895ade0ffe0cfec))
* reorder CSS class definitions in expected test output ([ccea2f6](https://github.com/gabeklein/expressive-dsl/commit/ccea2f66653fe01c19b58602da4d5648517f2e2b))
* **repl:** create and use runtime-insensitive components for editors ([d7583be](https://github.com/gabeklein/expressive-dsl/commit/d7583beb77dc2ef5180b4849aac6c1b16c3c6d02))
* **repl:** remove jsxImportSource from tsconfig and vite configuration ([f17a188](https://github.com/gabeklein/expressive-dsl/commit/f17a18851c84e5111f54f44be8acb35f24cf60fb))
* resolve bad content routes ([c4f4089](https://github.com/gabeklein/expressive-dsl/commit/c4f4089bf20bf1c2c313c621105002475d8aa582))
* resolved if-statement not handling else in edge case ([830c365](https://github.com/gabeklein/expressive-dsl/commit/830c3653569580ef7702335075689d2f7e7d40a5))
* streamline CSS handling in ExpressiveJSXPlugin by simplifying conditional check ([7c4b158](https://github.com/gabeklein/expressive-dsl/commit/7c4b158480ba1a34fea7bb2aa6d6a02f937f8944))
* update @expressive/react and @expressive/state versions to ^0.74.1 ([577ba59](https://github.com/gabeklein/expressive-dsl/commit/577ba5993f35ffa96d27477a786f9e09e82fc2c7))
* update @expressive/react version to ^0.73.1 in package.json and pnpm-lock.yaml ([1147419](https://github.com/gabeklein/expressive-dsl/commit/114741938fb7485e1b76edd836d27f183b6fb5f4))
* update Card component CSS border-radius for consistency ([7c569e8](https://github.com/gabeklein/expressive-dsl/commit/7c569e83b550cf1ef21d0c4506406139cc25c7d7))
* update CSS cache handling logic in jsxPlugin ([4f513e8](https://github.com/gabeklein/expressive-dsl/commit/4f513e88660f2c5daa1334136e08299aeadb228b))
* update documentation for zero runtime overhead and clarify JavaScript usage ([deb91ea](https://github.com/gabeklein/expressive-dsl/commit/deb91ea3529ed0d0195508cd09b7e2d778ad27e1))
* update files.exclude settings to hide specific files and directories ([70ccb9e](https://github.com/gabeklein/expressive-dsl/commit/70ccb9e8c5f45135a09b2eb682a6d2dc6c85b176))
* update packages for consistency ([f825fa7](https://github.com/gabeklein/expressive-dsl/commit/f825fa7e6db6f5a26adb13a60734321bd90dc173))
* update snapshots ([afbe00c](https://github.com/gabeklein/expressive-dsl/commit/afbe00c1f3e142f983bb446b0e0fefa74dffd414))
* update tsconfigs ([c362aa3](https://github.com/gabeklein/expressive-dsl/commit/c362aa323ca425adc1c8a2c2afa2aa5d35216fae))
* update vite dev-dependancy in plugin ([74addc7](https://github.com/gabeklein/expressive-dsl/commit/74addc74610a49fa95499a32979d3089a56733b1))
* update vite version to 7.3.1 and adjust related dependencies in pnpm-lock.yaml ([ad656c1](https://github.com/gabeklein/expressive-dsl/commit/ad656c19116116a81d81ff520d11045fcdf3ad2e))
* updated editor and repl to use new mvc ([be3cdcd](https://github.com/gabeklein/expressive-dsl/commit/be3cdcda9a3280f1508fa0a583c8c5c66285d3dd))
* **website:** disable next caching and react strict mode in webpack configuration ([d15428c](https://github.com/gabeklein/expressive-dsl/commit/d15428cd844e64af3c1f2e802fc4a731d7236f46))


* fix(babel-preset)!: removed runtime dependancy of babel/core - support for babel/standalone ([cf9090e](https://github.com/gabeklein/expressive-dsl/commit/cf9090eabf559e347988ffb5a4cab44ccfc427cd))


### Features

* add @expressive/nextjs-plugin for Next.js integration with Expressive JSX ([4611148](https://github.com/gabeklein/expressive-dsl/commit/461114867c73670743ad6621a2fd704abf0f9452))
* add debugging configuration for Next.js Plugin with NODE_OPTIONS ([3715c46](https://github.com/gabeklein/expressive-dsl/commit/3715c46554e31fec793e440c5102c84897de9588))
* add error handling tests and integrate parser with error reporting ([65b7f45](https://github.com/gabeklein/expressive-dsl/commit/65b7f45e3c357e8acb2fd03f38fce2d10f1558ba))
* add logging utility for enhanced diagnostic messages ([051eea7](https://github.com/gabeklein/expressive-dsl/commit/051eea795a7541ce0e2cd10fe9151d3036a5888f))
* add playground route to docs and import repl ([8c10101](https://github.com/gabeklein/expressive-dsl/commit/8c10101c43f769ec510c6094aee1c09c22227c50))
* add SSR and SSG pages for testing with basic layout and styling ([084f5d6](https://github.com/gabeklein/expressive-dsl/commit/084f5d6de56680c89a45a6a0b5b997764acda08a))
* add support for css module mode in vite plugin ([da13c26](https://github.com/gabeklein/expressive-dsl/commit/da13c26c553fffb5971ee8806cb06e916d4634bf))
* add Timer component to display uptime in Home page ([75f1a80](https://github.com/gabeklein/expressive-dsl/commit/75f1a8045832bcb649739c557fb55b4f5a393024))
* add TypeScript plugin for JSX support and update dependencies ([b4ed71b](https://github.com/gabeklein/expressive-dsl/commit/b4ed71bc1f023ca25e642e317cf3038a25828ae5))
* add validation to prevent label name conflicts with component names ([8a0bc14](https://github.com/gabeklein/expressive-dsl/commit/8a0bc14a5bdc77b6855c19737af285d7502b8db4))
* comment out useMDXComponents in mdx page ([4da7ac0](https://github.com/gabeklein/expressive-dsl/commit/4da7ac068e66d5e8e9116dcaa80964e71b5cd07c))
* generated css classnames preserved by next modules ([f9ce45a](https://github.com/gabeklein/expressive-dsl/commit/f9ce45a0199cc783e753c0ccf9dd1c8f58bc9b0f))
* implement DocsLayout and update layout structure for improved documentation presentation ([3a89591](https://github.com/gabeklein/expressive-dsl/commit/3a8959199c64db8d6e4b4c883fa45132e1454e15))
* **playground:** add Window component and integrate into Playground ([736f088](https://github.com/gabeklein/expressive-dsl/commit/736f088fab29023f1bab6d6ffcf389512707563f))
* refactor Logo component in docs modules ([122b5fd](https://github.com/gabeklein/expressive-dsl/commit/122b5fd069f40007b4d4a34f37840acc04435b1b))
* rename type declaration for chroma-js module ([156b4d3](https://github.com/gabeklein/expressive-dsl/commit/156b4d3a4e737975bf5722843df57220220c0313))


### BREAKING CHANGES

* Preset now replies on consuming compiler





## [0.3.2](https://github.com/gabeklein/expressive-dsl/compare/v0.3.1...v0.3.2) (2025-08-09)


### Bug Fixes

* update tests to accomodate changes ([b585b3a](https://github.com/gabeklein/expressive-dsl/commit/b585b3a499539b7232c9c77f55eccf969f24db98))


* fix!: skip forwarding className if already consumed ([e5f45ee](https://github.com/gabeklein/expressive-dsl/commit/e5f45ee0b36c9a0da9ad25e9d48decd1d0ffdd32))


### BREAKING CHANGES

* removes implicit className





## [0.3.1](https://github.com/gabeklein/expressive-dsl/compare/v0.3.0...v0.3.1) (2025-08-06)


### Bug Fixes

* implement isReturnedByComponent function to check JSXElement/JSXFragment return status ([3649938](https://github.com/gabeklein/expressive-dsl/commit/3649938ee50597d988468b8c49c984d69d7b4953))





# [0.3.0](https://github.com/gabeklein/expressive-dsl/compare/v0.2.17...v0.3.0) (2025-08-06)


### Bug Fixes

* add conventional commits flag to lerna publish script ([036ff8d](https://github.com/gabeklein/expressive-dsl/commit/036ff8da03884ed6edeaf5f6d3472c15fa222cb8))


* feat!: improved implicit this ([fd110c0](https://github.com/gabeklein/expressive-dsl/commit/fd110c062e71cbae46d7fa6c128b307df54e529c))
* feat!: simplify this forwarding ([189b886](https://github.com/gabeklein/expressive-dsl/commit/189b886c13056fec2ca98ddfe0b66f7b5d31f840))


### BREAKING CHANGES

* All returned elements now forward className
* No longer fowarding all props in this, only className

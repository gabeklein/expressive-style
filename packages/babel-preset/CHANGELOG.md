# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.4.0](https://github.com/gabeklein/expressive-dsl/compare/v0.3.2...v0.4.0) (2026-03-11)


### Bug Fixes

* add missing class on element nested within pseudo selector ([c58ffa8](https://github.com/gabeklein/expressive-dsl/commit/c58ffa8553b28053f6d87ab85f980cc3f3b8ba0c))
* correct template literal handling in parseExpression function ([e70f0aa](https://github.com/gabeklein/expressive-dsl/commit/e70f0aaf14f8c6a66217310d36ed8d7acf23905d))
* corrected css sort order ([72df66f](https://github.com/gabeklein/expressive-dsl/commit/72df66f853e2f963715ba8008f564456bd3505df))
* optimized classNamesHelper ([9be3b1d](https://github.com/gabeklein/expressive-dsl/commit/9be3b1da31465df3a36002de49b3340b40ba87ba))
* prevent empty css modules in plugin ([2b2bdf0](https://github.com/gabeklein/expressive-dsl/commit/2b2bdf05731ab1166cd04088ebf5bed8ef57e30b))
* Remove test for binding when asserting if JSX component ([4d81f64](https://github.com/gabeklein/expressive-dsl/commit/4d81f64ac5f1c436f0ae64ac89c2b190b23de00a))
* reorder CSS class definitions in expected test output ([ccea2f6](https://github.com/gabeklein/expressive-dsl/commit/ccea2f66653fe01c19b58602da4d5648517f2e2b))
* resolved if-statement not handling else in edge case ([830c365](https://github.com/gabeklein/expressive-dsl/commit/830c3653569580ef7702335075689d2f7e7d40a5))
* update @expressive/react version to ^0.73.1 in package.json and pnpm-lock.yaml ([1147419](https://github.com/gabeklein/expressive-dsl/commit/114741938fb7485e1b76edd836d27f183b6fb5f4))


* fix(babel-preset)!: removed runtime dependancy of babel/core - support for babel/standalone ([cf9090e](https://github.com/gabeklein/expressive-dsl/commit/cf9090eabf559e347988ffb5a4cab44ccfc427cd))


### Features

* add validation to prevent label name conflicts with component names ([8a0bc14](https://github.com/gabeklein/expressive-dsl/commit/8a0bc14a5bdc77b6855c19737af285d7502b8db4))
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

**Note:** Version bump only for package @expressive/babel-preset





# [0.3.0](https://github.com/gabeklein/expressive-dsl/compare/v0.2.17...v0.3.0) (2025-08-06)


* feat!: improved implicit this ([fd110c0](https://github.com/gabeklein/expressive-dsl/commit/fd110c062e71cbae46d7fa6c128b307df54e529c))
* feat!: simplify this forwarding ([189b886](https://github.com/gabeklein/expressive-dsl/commit/189b886c13056fec2ca98ddfe0b66f7b5d31f840))


### BREAKING CHANGES

* All returned elements now forward className
* No longer fowarding all props in this, only className

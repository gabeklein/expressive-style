# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

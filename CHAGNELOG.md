# Change Log

## 2.0.0 (2026/11/24)

- **Breaking:** Require markdown-it v15 (add `markdown-it ^15.0.0` as a peer dependency; type definitions now use markdown-it's bundled types, so `@types/markdown-it` is no longer needed)
- Escape file names so they are always rendered as plain text
- Restore `token.info` even if the default renderer or `highlight` throws
- Skip HTML parsing for code blocks without a file name (faster rendering; their output is now exactly markdown-it's)
- Update node-html-parser from v7 to v9
- Migrate to pnpm 12
- Add Node.js 26 to CI
- Update dev packages version
- Update README: fix usage example, document syntax and markdown-it requirement
- Exclude development files from the npm package

## 1.1.0 (2026/02/28)

- Migrate from npm to pnpm
- Drop highlight.js v10 support
- Rename default branch from master to main
- Update Node.js versions in CI: drop Node.js 18 (EOL), add Node.js 24
- Migrate ESLint configuration to flat config format
- Split CI workflow: separate publish workflow

## 1.0.6 (2024/11/10)

- Update dev packages version

## 1.0.5 (2023/06/18)

- Update 3rd libs version

## 1.0.4 (2023/12/24)

- Fix missing dist in npm package

## 1.0.3 (2023/12/24)

- Add npmignore

## 1.0.2 (2023/12/23)

- Migrated implementation to typescript (#31)

## 0.2.0 (2023/06/17)

- Update dev dependencies version (#9, #10, #12, #13)
- Update dependencies version (#11)
- Add dependabot (#7, #8)
- Add type support (#1) [@KyleSmith0905](https://github.com/KyleSmith0905)
- Add CI (#5, #6)
- Fix npm audit (#4)
- Change to use const instead of var in samples (#2) [@KyleSmith0905](https://github.com/KyleSmith0905)
- Fix typos in README.md (#3) [@KyleSmith0905](https://github.com/KyleSmith0905)

## 0.1.0 (2020/10/16)

- First release

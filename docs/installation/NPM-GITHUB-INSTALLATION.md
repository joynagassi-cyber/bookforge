# Installation: npm / GitHub

BookForge is distributed as a normal npm CLI package. npm exposes executables declared in `package.json#bin`, which is what makes `npx bookforge ...` work.

## Published package

```bash
npx bookforge@latest init
```

## Directly from GitHub

Once the repository is public and contains the root `package.json`:

```bash
npx github:OWNER/BOOKFORGE init
```

or install locally:

```bash
npm install github:OWNER/BOOKFORGE
npx bookforge init
```

## Reproducible use

Pin a release/tag/commit for CI and teams rather than relying on `latest`.

## Initialization

```bash
npx bookforge init --template book --host auto --graph none
```

This creates only project-local state. The framework source remains in the package cache/node_modules.

# CollegeFinder AI

College discovery and recommendation app built with Next.js, MongoDB, and NextAuth.

## Local Setup

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Configure local environment variables for the services you use; never commit `.env` files or credentials.

## Validation

Run the same static checks used by the local pre-commit hook:

```bash
npm run check
```

`npm run check` runs ESLint and TypeScript without emitting build artifacts. GitHub Actions also runs a production build for pull requests and pushes to `main`.

## Commits

Husky installs local hooks after `npm ci`. Commits must follow Conventional Commits, for example:

```text
feat: add college comparison filters
fix: handle missing profile preferences
```

The commit hook runs lint and typecheck before creating the commit, and CI runs lint, typecheck, and build before changes are integrated.

# CollegeFinder AI

CollegeFinder AI helps students explore engineering colleges, estimate admission options from cutoff data, and organize colleges they are considering. It is a Next.js App Router application built with TypeScript, MongoDB/Mongoose, and NextAuth.

## Features

- Browse and search colleges, then inspect college details, branches, fees, placements, and cutoff records.
- Estimate Safe, Moderate, and Ambitious options from rank, category, home state, and gender preference.
- Create an account with email and password, or enable Google sign-in with OAuth credentials.
- Save college options, compare colleges, and keep exam preferences in a student profile.
- Ask admission questions in chat. When an OpenAI API key is configured, chat responses use retrieved college data as context.

Recommendations are estimates based on the latest cutoff year in the available data. They are not admission guarantees. The bundled dataset is sample data, and prediction currently does not filter cutoffs by exam, so verify results against the relevant official counselling and cutoff sources.

## Requirements

- Node.js 20.9 or newer (CI uses Node.js 24)
- npm
- MongoDB for persistent local data; a local in-memory MongoDB fallback is available

## Run Locally

```bash
npm ci
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The app can start without configuring external services. For persistent data, set `MONGODB_URI` in a local `.env.local` file. On an empty database, the app seeds its bundled JSON data automatically.


```

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | No for local startup | MongoDB connection string. Without a usable URI, the app attempts to start `mongodb-memory-server`; data in that database is temporary. |
| `NEXTAUTH_SECRET` | Recommended locally; required for production auth | Secret used by NextAuth. Use a strong, private value. |
| `GOOGLE_CLIENT_ID` | No | Enables Google sign-in when set to a real client ID. Configure it together with `GOOGLE_CLIENT_SECRET`. |
| `GOOGLE_CLIENT_SECRET` | No | Secret paired with the Google OAuth client ID. |
| `OPENAI_API_KEY` | No | Enables OpenAI-backed chat responses. Without it, chat is unavailable/configuration-limited. |

Keep credentials in `.env.local` or your deployment provider's secret store. Environment files are ignored by Git; never commit real secrets.

## Application Areas

| Route | Description |
| --- | --- |
| `/` | Home and entry point |
| `/colleges` | College discovery and search |
| `/colleges/[id]` | College details |
| `/predict` | Rank-based college and branch estimates |
| `/saved` | Saved colleges |
| `/compare` | College comparison |
| `/onboarding` | Student exam and admission preferences |
| `/dashboard` | Student dashboard |
| `/chat` | Admission Q&A chat |
| `/login`, `/signup` | Authentication |

The corresponding API handlers are under `/api`: `auth`, `chat`, `colleges`, `onboarding`, `predict`, `saved`, and `signup`.

## Data and Architecture

- `app/` contains the App Router pages and API handlers.
- `components/` contains shared interface components.
- `lib/` contains authentication, database, chat, prediction, validation, and utility logic.
- `models/` defines the Mongoose data models.
- `data/` contains the bundled JSON college, branch, cutoff, fee, and placement data used to seed an empty database.
- `scripts/` contains seed and manual API/database exercise scripts.

The API and server-rendered parts of the app use MongoDB through Mongoose. The in-memory database fallback is useful for local exploration, but it is ephemeral and may need to download a MongoDB binary the first time it runs. For persistent or shared environments, configure a dedicated MongoDB deployment. Do not point the manual database/API scripts at production data; they can create or modify records.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run check` | Run lint and typecheck |

There is no automated `npm test` suite yet. The TypeScript scripts under `scripts/` are manual exercises, not safe tests for a shared database.

## Commit and CI Workflow

Husky installs the local hooks during `npm ci`. Before a commit, the pre-commit hook runs `npm run check`; the commit-message hook enforces [Conventional Commits](https://www.conventionalcommits.org/). Examples:

```text
feat: add college comparison filters
fix: handle missing profile preferences
docs: clarify local database setup
```

GitHub Actions runs lint, typecheck, and a production build for pull requests and pushes to `main`. CI uses a build-only `NEXTAUTH_SECRET`; it does not require production OAuth, OpenAI, or MongoDB credentials.

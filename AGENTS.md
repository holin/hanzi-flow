# Repository Guidelines

Welcome to the Hanzi Flow contributor guide. This document outlines the standards and procedures for working within this repository.

## Project Structure & Module Organization

- `/`: Root directory containing configuration files (`vite.config.ts`, `tsconfig.json`, `tailwind.config.js`).
- `/components`: React components (e.g., `HanziPlayer.tsx` for stroke visualization).
- `/services`: Core logic and API interactions (`strokeService.ts` for Hanzi data, `geminiService.ts` for AI integration).
- `/public`: Static assets including fonts and essential Hanzi stroke data in JSON format.
- `/dist`: Compiled production build.
- `App.tsx` & `index.tsx`: Application entry points.
- `types.ts`: Centralized TypeScript interface definitions.

## Build, Test, and Development Commands

- `npm install`: Installs project dependencies.
- `npm run dev`: Starts the Vite development server locally.
- `npm run build`: Generates a production-ready build in the `dist/` folder.
- `npm run preview`: Previews the production build locally.

## Coding Style & Naming Conventions

- **Language**: TypeScript is required for all logic. Use functional components with React 19 hooks.
- **Indentation**: 2 spaces.
- **Naming**:
  - Components: `PascalCase` (e.g., `HanziPlayer.tsx`).
  - Services/Hooks/Variables: `camelCase` (e.g., `strokeService.ts`).
  - CSS: Tailwind CSS utility classes are preferred over custom CSS.
- **Formatting**: Adhere to standard Prettier/ESLint defaults (implicit in Vite/React ecosystem).

## Testing Guidelines

- The project currently does not have a formal testing suite.
- Contributors should verify changes manually by running `npm run dev` and testing across different Chinese characters.
- Ensure that the Gemini API integration handles network errors gracefully.

## Commit & Pull Request Guidelines

- **Commits**: Use descriptive, imperative-style commit messages (e.g., "Add stroke animation toggle" or "Fix Gemini service timeout").
- **PRs**: Include a clear description of the change and screenshots for UI modifications. Ensure the build passes (`npm run build`) before submission.

## Architecture Overview

Hanzi Flow uses `hanzi-writer` for SVG stroke animations and Google Gemini (`@google/genai`) to provide cultural and linguistic context for characters. Data flows from `services/` into UI components via standard React props and state.

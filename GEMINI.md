# GEMINI.md: Hanzi Flow Project

## Project Overview

**Hanzi Flow** is an interactive web application designed to help users learn and practice the stroke order of Chinese characters. Users can input a character to see an animated demonstration of how it's written, listen to its pronunciation, and test their own writing skills in a quiz mode.

The application is a Progressive Web App (PWA), allowing users to install it on their devices for a native-like experience.

### Core Technologies

*   **Frontend Framework:** React with TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Character Animation:** The `hanzi-writer` library is the core component for rendering and animating the character strokes.
*   **Speech Synthesis:** The application uses the browser's native `SpeechSynthesis` API and provides a hook for a potential Android native TTS engine to pronounce the characters.
*   **Gemini API:** The project includes the `@google/genai` dependency, suggesting that it may incorporate features powered by the Gemini API, although the current core functionality relies on local data.

### Architecture

*   **`App.tsx`**: The main application component that manages the overall UI, user input, search history, and PWA installation logic.
*   **`components/HanziPlayer.tsx`**: The central interactive component that wraps the `hanzi-writer` library. It handles character animation, looping, a writing quiz mode, and audio playback.
*   **`services/strokeService.ts`**: This service is responsible for fetching the character stroke data. It retrieves data from static JSON files located in `/public/data/` and implements a caching mechanism using `localStorage` to improve performance.
*   **`public/data/`**: This directory contains individual JSON files for each supported Chinese character, holding the necessary stroke path data for `hanzi-writer`.

## Building and Running the Project

### Prerequisites

*   Node.js and npm (or a compatible package manager).

### Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **(Optional) Set up Environment Variables:**
    The project is configured to use a Gemini API key. To enable any features that might use it, create a `.env` file in the project root and add your key:
    ```
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

### Key Commands

*   **Run the development server:**
    This command starts a local server, typically at `http://localhost:3000`.
    ```bash
    npm run dev
    ```

*   **Create a production build:**
    This command bundles the application for deployment into the `dist/` directory.
    ```bash
    npm run build
    ```

*   **Preview the production build:**
    This command serves the contents of the `dist/` directory locally to test the production version.
    ```bash
    npm run preview
    ```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for utility-first styling. Class names should adhere to Tailwind's conventions.
*   **State Management:** Application state is managed locally within React components using `useState` and `useEffect` hooks.
*   **Data Fetching:** Character data is loaded on-demand from static JSON files. The `strokeService.ts` provides a centralized and cached way to access this data.
*   **Code Structure:** Source code is organized into components (`/components`) and services (`/services`) to maintain a clear separation of concerns.
*   **PWA:** The application includes PWA features. The installation prompt is handled in `App.tsx` and can be tested in supported browsers.

# Aura - Premium Micro-journal PWA

A minimalist, offline-first micro-journaling application built with Vue 3, Tailwind CSS, and Firebase.

## Features

- **Soft UI Design**: Airy, card-based interface with smooth animations.
- **Interactive History**: Three-tabbed view (Log, Calendar, Stats) for a complete overview.
- **Real-time Search**: Quick filtering of history logs by content, mood, or date.
- **Collapsible Logs**: Clean, scannable history with toggleable detail views.
- **Journal Statistics**: Visualized health trends and emotional patterns (unlocked after 10 entries).
- **Gratitude Inspiration**: Integrated library of 100+ localized suggestions to help you get started.
- **Micro-Reflection**: Log moods, gratitude, and health metrics.
- **Toast Notifications**: Modern, non-blocking feedback system.
- **Offline First**: Uses IndexedDB (Dexie) for local storage and syncs to Firestore when online.
- **Biometric Security**: Optional WebAuthn/PIN locking for history.
- **Gamification**: Streak counter and mood tracking.

## Setup

1. `npm install`
2. Configure `.env` with Firebase credentials.
3. `npm run dev`

## PWA Installation

- **Samsung S23 / Android**: Open in Chrome -> Tap "Install App" or "Add to Home Screen".

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

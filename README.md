# Blitz Defence

A browser-based wave defense game built with Node.js, Express, EJS, Socket.IO, SQLite, and the Canvas API.

The current design focuses on a clean start menu, centered “How to Play” panel, payment gate, settings modal, and in-game wave defense. The player/hero customization UI has been removed from the visible layout and the README now reflects that streamlined experience.

## Features

### Gameplay
- Wave-based combat against increasingly difficult enemies
- Boss encounters on later waves
- Tower placement and upgrades for defense planning
- Currency gain from enemy defeats and wave progress
- Shield-based survival system

### Enemies
- Basic enemies
- Tanks
- Sprinters
- Boss

### UI and systems
- Centered start menu instructions with a map selector button
- Payment overlay for game entry
- Settings modal for wave start mode, tooltips, and sound
- Admin panel for game price control
- SQLite-backed session and settings storage
- Formbar authentication integration

## Requirements
- Node.js 16 or newer
- npm
- Access to the Formbar authentication server
- Valid API key for the Formbar integration

## Setup

Create a `.env` file in the project root:

```env
PORT=3000
SESSION_SECRET=your_session_secret_key
AUTH_URL=http://localhost:420/oauth
THIS_URL=http://localhost:3000
API_KEY=your_formbar_api_key
```

Install dependencies:

```bash
npm install
```

Initialize the database:

```bash
node scripts/init-db.js
```

Start the app:

```bash
npm start
```

For development:

```bash
npm run dev
```

Then open the app in your browser on the configured port.

## How to play

- Choose your map then press the Start Game button
- Start waves using the green button in the bottom right or auto-start setting
- Press ESC to pause
- Place towers on valid ground, not on the track
- Survive until all waves are complete

## Current design notes

- The start menu now emphasizes a centered instructions layout
- The visible hero customization controls are commented out in the UI
- Player rendering and customization UI hooks are still present in code, but disabled from the active flow
- Settings are saved locally in the browser
- Payment is required before starting a new game session

## Project structure

- `app.js` — Express server, routes, auth, payment, sessions
- `game/` — Client-side game logic, rendering, enemies, towers, and wave handling
- `views/` — EJS templates for the game, login, and admin pages
- `db/` — SQLite database files and initialization SQL
- `scripts/` — Utility scripts such as database initialization
- `img/`, `music/`, `sfx/` — Game assets

## Scripts

- `npm start` — Start the server
- `npm run dev` — Start the server with nodemon

## Notes

- The repository is designed around Formbar classroom authentication and Digipogs payment flow.
- If you change the game design again, update the README feature list and controls section to match the active UI.


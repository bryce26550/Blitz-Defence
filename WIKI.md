# Blitz Defence Wiki

This wiki explains how the project is structured, how core systems work, and what to review before shipping changes.

## 1) How things are done

### Tech stack
- Backend: Node.js + Express (`app.js`)
- Frontend: EJS template + browser JavaScript in `game/`
- Real-time networking: Socket.IO
- Persistence: SQLite in `db/database.db` + sqlite session store

### Runtime flow
1. User authenticates through the configured OAuth provider (`/login` in `app.js`).
2. User reaches `/` and sees the game menu (`views/index.ejs`).
3. User pays the entry fee (`/payIn`) unless admin bypass is used.
4. Server creates an active game session (`/startGameSession`).
5. Client sends gameplay events (e.g., `WAVE_COMPLETE`) to `/recordGameEvent`.
6. Server validates session/rate limits and updates server-side progress.

### Core folders
- `app.js`: server routes, auth, payment, admin tools, anti-cheat/session logic
- `game/`: gameplay code (player, enemies, towers, maps, waves, main loop)
- `views/`: EJS pages (`index`, `login`, `admin`, `pay`)
- `db/`: sqlite data + schema files
- `scripts/`: utility scripts (e.g., DB init)

### Local setup workflow
1. Copy `.env_template` to `.env` and fill required keys.
2. Install dependencies: `npm install`
3. Initialize DB: `node scripts/init-db.js`
4. Start app: `npm start` (or `npm run dev`)

### Admin and pricing workflow
- Price is stored in `game_settings` table (`setting_name = game_price`).
- Admin users can open `/admin` and update entry price.
- Price changes are broadcast over game socket via `priceUpdate`.

---

## 2) Bugs/features to improve before end of year

These are current quality gaps worth prioritizing:

1. **Automated quality gates are missing**  
   No built-in lint/test scripts currently exist in `package.json`, which makes regressions easier to miss.

2. **Admin access is hardcoded to specific IDs**  
   `isAdmin` in `app.js` relies on fixed user IDs. This should move to config or role-based checks.

3. **Player customization backend exists but UI is disabled**  
   Customization routes and DB table are active, but related menu controls are commented out in `views/index.ejs`.

4. **Game session state is in-memory only**  
   `gameSessions` and rate limits are kept in memory, so restarts clear active sessions.

5. **Wave completion trust model can be stronger**  
   `WAVE_COMPLETE` accepts client-sent wave/time data with limited validation.

6. **Documentation and wording polish**  
   Some player-facing text still has spelling issues (e.g., "depleat"/"sheild" in the menu copy) and should be cleaned up during UX polish.

---

## 3) Required review before completion

Before marking major game changes complete, run this review checklist:

- [ ] Review with both project members
- [ ] Review with Smithers (project reviewer)
- [ ] Confirm gameplay flow still matches UI text and docs
- [ ] Confirm auth/payment/admin routes still work end-to-end
- [ ] Confirm DB init/setup steps are still accurate


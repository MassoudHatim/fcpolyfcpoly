# Team Picker - Football Team Builder

A static website for generating balanced football teams for 5v5 or 6v6 matches.

## Features

- Pre-configured player database with strength tiers
- Click-to-select player interface
- Automatic team balancing based on player strength
- Conflict resolution (prevents certain players from being on the same team)
- Works for 10 players (5v5) or 12 players (6v6)
- JSON Server integration for data persistence
- Team validation and history tracking
- Next Match Team section displaying validated teams
- Historique Matches section showing match history with dates

## Deployment to GitHub Pages

1. Push all files to a GitHub repository
2. Go to repository Settings → Pages
3. Select the branch (usually `main` or `master`)
4. Select the folder (usually `/ (root)`)
5. Click Save
6. Your site will be available at `https://[username].github.io/[repository-name]`

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling
- `script.js` - Team generation logic and player database
- `db.json` - JSON Server database file

## Architecture

This app uses a **hybrid storage approach**:
- **Primary Storage**: localStorage (works offline, no backend needed)
- **Optional Sync**: JSON Server API (for multi-device sync when backend is available)

The app works **standalone** without any backend, but can sync with a JSON Server when configured.

## Setup

### Option 1: Standalone Mode (No Backend Required) ✅

The app works out of the box using localStorage. No setup needed!

1. Open `index.html` in your browser
2. Start using the app - all data is saved locally

### Option 2: With JSON Server Backend (For Multi-Device Sync)

#### Local Development

1. **Install JSON Server**
   ```bash
   npm install -g json-server
   ```

2. **Start JSON Server**
   ```bash
   json-server --watch db.json --port 3000
   ```

3. **Configure API URL** in `config.js`:
   ```javascript
   const CONFIG = {
       API_URL: 'http://localhost:3000', // Your JSON Server URL
       ENABLE_API_SYNC: true
   };
   ```

#### Hosted Backend (Recommended for Production)

The app automatically detects if you're running locally and uses the appropriate API URL. For production, host your JSON Server on:

- **Render** (Free tier available)
- **Railway** (Free tier available)
- **Heroku** (Paid)
- **Any Node.js hosting service**

Then update `config.js` with your hosted URL:

```javascript
const CONFIG = {
    API_URL: 'https://your-app.onrender.com', // Your hosted URL
    ENABLE_API_SYNC: true
};
```

### Backend Hosting Guide

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed instructions on hosting JSON Server.

## Usage

1. Open `index.html` in a browser (no backend required!)
2. Click on player names to select/deselect them
3. Select exactly 10 or 12 players
4. Click "Generate Teams" to create balanced teams
5. Use "Reshuffle Teams" to regenerate with different combinations
6. Click "Validate Teams" to save the teams as the next match and add to history
7. View the "Next Match Team" section to see the validated team
8. View the "Historique Matches" section to see all past matches with dates

**Note**: Data is automatically saved to localStorage. If you've configured a backend, it will sync automatically.

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling
- `script.js` - Team generation logic and data service layer
- `config.js` - API configuration (set your backend URL here)
- `db.json` - JSON Server database file (for backend)
- `BACKEND_SETUP.md` - Guide for hosting the backend

## Password

The site is password protected. Default password: `fcpoly2024`


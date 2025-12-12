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

## Setup

### 1. Install JSON Server

```bash
npm install -g json-server
```

### 2. Start JSON Server

```bash
json-server --watch db.json --port 3000
```

The server will run on `http://localhost:3000`

### 3. Update API URL (if needed)

If your JSON Server runs on a different URL or port, update the `API_URL` constant in `script.js`:

```javascript
const API_URL = 'http://localhost:3000'; // Change this if needed
```

## Usage

1. Make sure JSON Server is running (see Setup above)
2. Open `index.html` in a browser
3. Click on player names to select/deselect them
4. Select exactly 10 or 12 players
5. Click "Generate Teams" to create balanced teams
6. Use "Reshuffle Teams" to regenerate with different combinations
7. Click "Validate Teams" to save the teams as the next match and add to history
8. View the "Next Match Team" section to see the validated team
9. View the "Historique Matches" section to see all past matches with dates

## Password

The site is password protected. Default password: `fcpoly2024`


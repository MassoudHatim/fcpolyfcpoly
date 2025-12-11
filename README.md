# Team Picker - Football Team Builder

A static website for generating balanced football teams for 5v5 or 6v6 matches.

## Features

- Pre-configured player database with strength tiers
- Click-to-select player interface
- Automatic team balancing based on player strength
- Conflict resolution (prevents certain players from being on the same team)
- Works for 10 players (5v5) or 12 players (6v6)

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

## Usage

1. Open `index.html` in a browser
2. Click on player names to select/deselect them
3. Select exactly 10 or 12 players
4. Click "Generate Teams" to create balanced teams
5. Use "Reshuffle Teams" to regenerate with different combinations


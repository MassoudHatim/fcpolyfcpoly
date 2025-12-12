# Backend Setup Guide

This guide explains how to host the JSON Server backend for multi-device synchronization.

## Quick Start: Render (Recommended - Free)

1. **Create a Render account** at https://render.com

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Build Command: `npm install -g json-server`
   - Start Command: `json-server --watch db.json --port $PORT --host 0.0.0.0`
   - Environment: `Node`

3. **Add db.json file** to your repository root

4. **Deploy** and copy your service URL (e.g., `https://your-app.onrender.com`)

5. **Update config.js**:
   ```javascript
   const CONFIG = {
       API_URL: 'https://your-app.onrender.com',
       ENABLE_API_SYNC: true
   };
   ```

## Railway (Alternative - Free)

1. **Create Railway account** at https://railway.app

2. **Create new project** from GitHub repo

3. **Add service**:
   - Use `npx json-server db.json` as start command
   - Set port to `$PORT`

4. **Deploy** and update `config.js` with Railway URL

## Local Development

For local development, JSON Server runs on `http://localhost:3000`:

```bash
# Install
npm install -g json-server

# Run
json-server --watch db.json --port 3000
```

The app automatically detects localhost and uses it when available.

## Standalone Mode (No Backend)

If you don't want to set up a backend, the app works perfectly with localStorage only:

- Set `API_URL: ''` in `config.js` (default)
- All data is stored in browser localStorage
- Works offline
- No server needed

## API Endpoints

The backend provides these endpoints:

- `GET /nextMatch/1` - Get next match team
- `PUT /nextMatch/1` - Update next match team
- `GET /historique` - Get match history
- `POST /historique` - Add new match to history

## CORS Configuration

If hosting on a different domain, ensure CORS is enabled:

```bash
json-server --watch db.json --port 3000 --host 0.0.0.0 --cors
```

Or add CORS headers in your hosting platform settings.


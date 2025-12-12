// Configuration for API URL
// Set this to your JSON Server URL or leave empty to use localStorage only
// Examples:
// - Local: 'http://localhost:3000'
// - Hosted: 'https://your-json-server.herokuapp.com'
// - Render: 'https://your-app.onrender.com'
// - Railway: 'https://your-app.railway.app'

const CONFIG = {
    // API URL - set to empty string '' to disable API and use localStorage only
    // Or set to your hosted JSON Server URL
    API_URL: '', // Default: empty = localStorage only
    
    // Enable API sync (only works if API_URL is set)
    ENABLE_API_SYNC: false,
    
    // Storage keys for localStorage
    STORAGE_KEYS: {
        NEXT_MATCH: 'fcpoly_next_match',
        HISTORIQUE: 'fcpoly_historique'
    }
};

// Auto-detect API URL from environment or use config
function getApiUrl() {
    // Check if running on localhost (development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return CONFIG.API_URL || 'http://localhost:3000';
    }
    
    // Use configured API URL or empty string (localStorage only)
    return CONFIG.API_URL || '';
}


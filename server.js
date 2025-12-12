// Simple JSON Server setup for hosting
// Usage: node server.js
// Or: npm start

const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Enable CORS for all routes
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

server.use(router);

server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
});


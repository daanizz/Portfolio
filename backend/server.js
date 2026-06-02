require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────────

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.PUBLIC_URL, process.env.ADMIN_URL].filter(Boolean)
        : true,
    credentials: true
}));

app.use(express.json({ limit: '5mb' }));

// ── API Routes ─────────────────────────────────────────────────────────────────

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/socials', require('./routes/socials'));
app.use('/api/categories', require('./routes/categories'));

// ── Health Check ───────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve Public Frontend (production) ─────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, '../frontend-public/dist');
    app.use(express.static(publicPath));

    // SPA fallback — serve index.html for non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(publicPath, 'index.html'));
        }
    });
}

// ── Error Handler ──────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`✦ Portfolio API running on http://localhost:${PORT}`);
});

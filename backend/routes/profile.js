const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/profile
 * Public — returns the single profile row
 */
router.get('/', async (req, res) => {
    const rs = await db.execute('SELECT * FROM profile WHERE id = 1');
    res.json(rs.rows[0]);
});

/**
 * PUT /api/profile
 * Protected — updates profile fields
 * Body: { name?, tagline?, bio?, email? }
 */
router.put('/', requireAuth, async (req, res) => {
    const { name, tagline, bio, email, avatar_url } = req.body;
    const currentRs = await db.execute('SELECT * FROM profile WHERE id = 1');
    const current = currentRs.rows[0];

    await db.execute({
        sql: `
            UPDATE profile SET
            name = ?,
            tagline = ?,
            bio = ?,
            email = ?,
            avatar_url = ?
            WHERE id = 1
        `,
        args: [
            name ?? current.name,
            tagline ?? current.tagline,
            bio ?? current.bio,
            email ?? current.email,
            avatar_url ?? current.avatar_url
        ]
    });

    const updated = await db.execute('SELECT * FROM profile WHERE id = 1');
    res.json(updated.rows[0]);
});

module.exports = router;

const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/profile
 * Public — returns the single profile row
 */
router.get('/', (req, res) => {
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    res.json(profile);
});

/**
 * PUT /api/profile
 * Protected — updates profile fields
 * Body: { name?, tagline?, bio?, email? }
 */
router.put('/', requireAuth, (req, res) => {
    const { name, tagline, bio, email, avatar_url } = req.body;
    const current = db.prepare('SELECT * FROM profile WHERE id = 1').get();

    db.prepare(`
    UPDATE profile SET
      name = ?,
      tagline = ?,
      bio = ?,
      email = ?,
      avatar_url = ?
    WHERE id = 1
  `).run(
        name ?? current.name,
        tagline ?? current.tagline,
        bio ?? current.bio,
        email ?? current.email,
        avatar_url ?? current.avatar_url
    );

    const updated = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    res.json(updated);
});

module.exports = router;

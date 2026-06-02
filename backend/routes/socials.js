const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/socials
 * Public — returns all social links
 */
router.get('/', (req, res) => {
    const socials = db.prepare('SELECT * FROM socials ORDER BY sort_order, id').all();
    res.json(socials);
});

/**
 * POST /api/socials
 * Protected — add a social link
 * Body: { platform: string, url: string }
 */
router.post('/', requireAuth, (req, res) => {
    const { platform, url } = req.body;

    if (!platform || !url) {
        return res.status(400).json({ error: 'Platform and URL are required' });
    }

    const result = db.prepare(
        'INSERT INTO socials (platform, url) VALUES (?, ?)'
    ).run(platform.trim(), url.trim());

    const social = db.prepare('SELECT * FROM socials WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(social);
});

/**
 * PUT /api/socials/:id
 * Protected — update a social link
 */
router.put('/:id', requireAuth, (req, res) => {
    const { platform, url } = req.body;
    const current = db.prepare('SELECT * FROM socials WHERE id = ?').get(req.params.id);

    if (!current) {
        return res.status(404).json({ error: 'Social link not found' });
    }

    db.prepare(
        'UPDATE socials SET platform = ?, url = ? WHERE id = ?'
    ).run(
        (platform || current.platform).trim(),
        (url || current.url).trim(),
        req.params.id
    );

    const updated = db.prepare('SELECT * FROM socials WHERE id = ?').get(req.params.id);
    res.json(updated);
});

/**
 * DELETE /api/socials/:id
 * Protected — remove a social link
 */
router.delete('/:id', requireAuth, (req, res) => {
    const result = db.prepare('DELETE FROM socials WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Social link not found' });
    }

    res.json({ success: true });
});

module.exports = router;

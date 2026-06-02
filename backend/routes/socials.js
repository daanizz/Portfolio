const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    const rs = await db.execute('SELECT * FROM socials ORDER BY sort_order, id');
    res.json(rs.rows);
});

router.post('/', requireAuth, async (req, res) => {
    const { platform, url } = req.body;

    if (!platform || !url) {
        return res.status(400).json({ error: 'Platform and URL are required' });
    }

    const result = await db.execute({
        sql: 'INSERT INTO socials (platform, url) VALUES (?, ?)',
        args: [platform.trim(), url.trim()]
    });

    const socialRs = await db.execute({
        sql: 'SELECT * FROM socials WHERE id = ?',
        args: [Number(result.lastInsertRowid)]
    });
    res.status(201).json(socialRs.rows[0]);
});

router.put('/:id', requireAuth, async (req, res) => {
    const { platform, url } = req.body;
    const currentRs = await db.execute({ sql: 'SELECT * FROM socials WHERE id = ?', args: [req.params.id] });
    const current = currentRs.rows[0];

    if (!current) {
        return res.status(404).json({ error: 'Social link not found' });
    }

    await db.execute({
        sql: 'UPDATE socials SET platform = ?, url = ? WHERE id = ?',
        args: [(platform || current.platform).trim(), (url || current.url).trim(), req.params.id]
    });

    const updated = await db.execute({ sql: 'SELECT * FROM socials WHERE id = ?', args: [req.params.id] });
    res.json(updated.rows[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
    const result = await db.execute({ sql: 'DELETE FROM socials WHERE id = ?', args: [req.params.id] });

    if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'Social link not found' });
    }

    res.json({ success: true });
});

module.exports = router;

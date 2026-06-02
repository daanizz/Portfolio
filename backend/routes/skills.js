const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    const rs = await db.execute('SELECT * FROM skills ORDER BY group_name, sort_order, id');
    res.json(rs.rows);
});

router.post('/', requireAuth, async (req, res) => {
    const { name, group_name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Skill name is required' });
    }

    const result = await db.execute({
        sql: 'INSERT INTO skills (name, group_name) VALUES (?, ?)',
        args: [name.trim(), (group_name || 'General').trim()]
    });

    const skillRs = await db.execute({
        sql: 'SELECT * FROM skills WHERE id = ?',
        args: [Number(result.lastInsertRowid)]
    });
    res.status(201).json(skillRs.rows[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
    const result = await db.execute({
        sql: 'DELETE FROM skills WHERE id = ?',
        args: [req.params.id]
    });

    if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({ success: true });
});

module.exports = router;

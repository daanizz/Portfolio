const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/skills
 * Public — returns all skills ordered by group then sort_order
 */
router.get('/', (req, res) => {
    const skills = db.prepare(
        'SELECT * FROM skills ORDER BY group_name, sort_order, id'
    ).all();
    res.json(skills);
});

/**
 * POST /api/skills
 * Protected — add a skill
 * Body: { name: string, group_name?: string }
 */
router.post('/', requireAuth, (req, res) => {
    const { name, group_name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Skill name is required' });
    }

    const result = db.prepare(
        'INSERT INTO skills (name, group_name) VALUES (?, ?)'
    ).run(name.trim(), (group_name || 'General').trim());

    const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(skill);
});

/**
 * DELETE /api/skills/:id
 * Protected — remove a skill
 */
router.delete('/:id', requireAuth, (req, res) => {
    const result = db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({ success: true });
});

module.exports = router;

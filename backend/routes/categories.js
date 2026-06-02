const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    const categoriesRs = await db.execute('SELECT * FROM categories ORDER BY sort_order, id');
    
    const result = await Promise.all(categoriesRs.rows.map(async (cat) => {
        const itemsRs = await db.execute({
            sql: 'SELECT * FROM category_items WHERE category_id = ? ORDER BY sort_order, id',
            args: [cat.id]
        });
        return { ...cat, items: itemsRs.rows };
    }));

    res.json(result);
});

router.post('/', requireAuth, async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Category name is required' });

    try {
        const result = await db.execute({
            sql: 'INSERT INTO categories (name) VALUES (?)',
            args: [name.trim()]
        });
        const categoryRs = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [Number(result.lastInsertRowid)] });
        res.status(201).json({ ...categoryRs.rows[0], items: [] });
    } catch (err) {
        if (err.message.includes('UNIQUE') || err.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'Category already exists' });
        }
        throw err;
    }
});

router.put('/:id', requireAuth, async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Category name is required' });

    const result = await db.execute({
        sql: 'UPDATE categories SET name = ? WHERE id = ?',
        args: [name.trim(), req.params.id]
    });

    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Category not found' });

    const updatedRs = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [req.params.id] });
    res.json(updatedRs.rows[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
    const result = await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [req.params.id] });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
});

router.get('/:id/items', async (req, res) => {
    const categoryRs = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [req.params.id] });
    if (!categoryRs.rows[0]) return res.status(404).json({ error: 'Category not found' });

    const itemsRs = await db.execute({
        sql: 'SELECT * FROM category_items WHERE category_id = ? ORDER BY sort_order, id',
        args: [req.params.id]
    });
    res.json(itemsRs.rows);
});

router.post('/:id/items', requireAuth, async (req, res) => {
    const categoryRs = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [req.params.id] });
    if (!categoryRs.rows[0]) return res.status(404).json({ error: 'Category not found' });

    const { title, description, image_url, link, date, body, sort_order } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Item title is required' });

    const result = await db.execute({
        sql: `INSERT INTO category_items (category_id, title, description, image_url, link, date, body, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            req.params.id, title.trim(), (description || '').trim(), (image_url || '').trim(),
            (link || '').trim(), (date || '').trim(), (body || '').trim(), parseInt(sort_order) || 0
        ]
    });

    const itemRs = await db.execute({ sql: 'SELECT * FROM category_items WHERE id = ?', args: [Number(result.lastInsertRowid)] });
    res.status(201).json(itemRs.rows[0]);
});

router.put('/:id/items/:itemId', requireAuth, async (req, res) => {
    const currentRs = await db.execute({
        sql: 'SELECT * FROM category_items WHERE id = ? AND category_id = ?',
        args: [req.params.itemId, req.params.id]
    });
    const current = currentRs.rows[0];
    if (!current) return res.status(404).json({ error: 'Item not found' });

    const { title, description, image_url, link, date, body, sort_order } = req.body;

    await db.execute({
        sql: `UPDATE category_items SET title = ?, description = ?, image_url = ?, link = ?, date = ?, body = ?, sort_order = ?
              WHERE id = ?`,
        args: [
            (title ?? current.title).trim(), (description ?? current.description).trim(),
            (image_url ?? current.image_url).trim(), (link ?? current.link).trim(),
            (date ?? current.date).trim(), (body ?? current.body).trim(),
            sort_order !== undefined ? parseInt(sort_order) : current.sort_order,
            req.params.itemId
        ]
    });

    const updatedRs = await db.execute({ sql: 'SELECT * FROM category_items WHERE id = ?', args: [req.params.itemId] });
    res.json(updatedRs.rows[0]);
});

router.delete('/:id/items/:itemId', requireAuth, async (req, res) => {
    const result = await db.execute({
        sql: 'DELETE FROM category_items WHERE id = ? AND category_id = ?',
        args: [req.params.itemId, req.params.id]
    });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true });
});

module.exports = router;

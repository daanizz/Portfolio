const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

// ── Categories ─────────────────────────────────────────────────────────────────

/**
 * GET /api/categories
 * Public — returns all categories with their items
 */
router.get('/', (req, res) => {
    const categories = db.prepare(
        'SELECT * FROM categories ORDER BY sort_order, id'
    ).all();

    const getItems = db.prepare(
        'SELECT * FROM category_items WHERE category_id = ? ORDER BY sort_order, id'
    );

    const result = categories.map(cat => ({
        ...cat,
        items: getItems.all(cat.id)
    }));

    res.json(result);
});

/**
 * POST /api/categories
 * Protected — create a new category
 * Body: { name: string }
 */
router.post('/', requireAuth, (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    try {
        const result = db.prepare(
            'INSERT INTO categories (name) VALUES (?)'
        ).run(name.trim());

        const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ ...category, items: [] });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Category already exists' });
        }
        throw err;
    }
});

/**
 * PUT /api/categories/:id
 * Protected — rename a category
 * Body: { name: string }
 */
router.put('/:id', requireAuth, (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    const result = db.prepare(
        'UPDATE categories SET name = ? WHERE id = ?'
    ).run(name.trim(), req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json(updated);
});

/**
 * DELETE /api/categories/:id
 * Protected — delete a category and all its items (cascade)
 */
router.delete('/:id', requireAuth, (req, res) => {
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true });
});

// ── Category Items ─────────────────────────────────────────────────────────────

/**
 * GET /api/categories/:id/items
 * Public — returns all items in a category
 */
router.get('/:id/items', (req, res) => {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);

    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const items = db.prepare(
        'SELECT * FROM category_items WHERE category_id = ? ORDER BY sort_order, id'
    ).all(req.params.id);

    res.json(items);
});

/**
 * POST /api/categories/:id/items
 * Protected — add an item to a category
 * Body: { title, description?, image_url?, link?, date?, body? }
 */
router.post('/:id/items', requireAuth, (req, res) => {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);

    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const { title, description, image_url, link, date, body, sort_order } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Item title is required' });
    }

    const result = db.prepare(`
    INSERT INTO category_items (category_id, title, description, image_url, link, date, body, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        req.params.id,
        title.trim(),
        (description || '').trim(),
        (image_url || '').trim(),
        (link || '').trim(),
        (date || '').trim(),
        (body || '').trim(),
        parseInt(sort_order) || 0
    );

    const item = db.prepare('SELECT * FROM category_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
});

/**
 * PUT /api/categories/:id/items/:itemId
 * Protected — update an item
 */
router.put('/:id/items/:itemId', requireAuth, (req, res) => {
    const current = db.prepare(
        'SELECT * FROM category_items WHERE id = ? AND category_id = ?'
    ).get(req.params.itemId, req.params.id);

    if (!current) {
        return res.status(404).json({ error: 'Item not found' });
    }

    const { title, description, image_url, link, date, body, sort_order } = req.body;

    db.prepare(`
    UPDATE category_items SET
      title = ?,
      description = ?,
      image_url = ?,
      link = ?,
      date = ?,
      body = ?,
      sort_order = ?
    WHERE id = ?
  `).run(
        (title ?? current.title).trim(),
        (description ?? current.description).trim(),
        (image_url ?? current.image_url).trim(),
        (link ?? current.link).trim(),
        (date ?? current.date).trim(),
        (body ?? current.body).trim(),
        sort_order !== undefined ? parseInt(sort_order) : current.sort_order,
        req.params.itemId
    );

    const updated = db.prepare('SELECT * FROM category_items WHERE id = ?').get(req.params.itemId);
    res.json(updated);
});

/**
 * DELETE /api/categories/:id/items/:itemId
 * Protected — remove an item
 */
router.delete('/:id/items/:itemId', requireAuth, (req, res) => {
    const result = db.prepare(
        'DELETE FROM category_items WHERE id = ? AND category_id = ?'
    ).run(req.params.itemId, req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ success: true });
});

module.exports = router;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CategoriesManager() {
    const { apiFetch } = useAuth();
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [activeCatId, setActiveCatId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Item form state
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemForm, setItemForm] = useState({
        title: '', description: '', image_url: '', link: '', date: '', body: '', sort_order: 0,
    });

    const fetchCategories = async () => {
        const res = await apiFetch('/api/categories');
        const data = await res.json();
        setCategories(data);
        setLoading(false);
        // Auto-select first category if nothing selected
        if (!activeCatId && data.length > 0) {
            setActiveCatId(data[0].id);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    // ── Category CRUD ─────────────────────────────────────────────────

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        const res = await apiFetch('/api/categories', {
            method: 'POST',
            body: JSON.stringify({ name: newCatName.trim() }),
        });

        if (res.ok) {
            const cat = await res.json();
            setNewCatName('');
            setActiveCatId(cat.id);
            fetchCategories();
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Delete this category and all its items?')) return;

        await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
        if (activeCatId === id) setActiveCatId(null);
        fetchCategories();
    };

    // ── Item CRUD ─────────────────────────────────────────────────────

    const openItemModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setItemForm({
                title: item.title,
                description: item.description || '',
                image_url: item.image_url || '',
                link: item.link || '',
                date: item.date || '',
                body: item.body || '',
                sort_order: item.sort_order || 0,
            });
        } else {
            setEditingItem(null);
            setItemForm({ title: '', description: '', image_url: '', link: '', date: '', body: '', sort_order: 0 });
        }
        setShowItemModal(true);
    };

    const handleSaveItem = async () => {
        if (!itemForm.title.trim()) return;

        if (editingItem) {
            await apiFetch(`/api/categories/${activeCatId}/items/${editingItem.id}`, {
                method: 'PUT',
                body: JSON.stringify(itemForm),
            });
        } else {
            await apiFetch(`/api/categories/${activeCatId}/items`, {
                method: 'POST',
                body: JSON.stringify(itemForm),
            });
        }

        setShowItemModal(false);
        fetchCategories();
    };

    const handleDeleteItem = async (itemId) => {
        await apiFetch(`/api/categories/${activeCatId}/items/${itemId}`, {
            method: 'DELETE',
        });
        fetchCategories();
    };

    // ── Derived data ──────────────────────────────────────────────────

    const activeCategory = categories.find((c) => c.id === activeCatId);
    const activeItems = activeCategory?.items || [];

    if (loading) return <div className="empty-state"><span className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <h1>Categories</h1>
                <p>Create dynamic categories (e.g. Projects, Certificates) and manage their items.</p>
            </div>

            {/* Add category */}
            <div className="card">
                <form onSubmit={handleAddCategory} className="inline-form">
                    <div className="form-group">
                        <label>New Category Name</label>
                        <input
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="e.g. Projects, Publications"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                        Create Category
                    </button>
                </form>
            </div>

            {categories.length === 0 ? (
                <div className="empty-state">
                    <p>No categories yet. Create your first one above.</p>
                </div>
            ) : (
                <>
                    {/* Category tabs */}
                    <div className="category-tabs">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`category-tab ${activeCatId === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCatId(cat.id)}
                            >
                                {cat.name} ({cat.items?.length || 0})
                            </button>
                        ))}
                    </div>

                    {/* Active category content */}
                    {activeCategory && (
                        <div className="card">
                            <div className="card-header">
                                <h3>{activeCategory.name}</h3>
                                <div className="item-actions">
                                    <button onClick={() => openItemModal()} className="btn btn-primary btn-sm">
                                        + Add Item
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(activeCategory.id)}
                                        className="btn btn-danger btn-sm"
                                    >
                                        Delete Category
                                    </button>
                                </div>
                            </div>

                            {activeItems.length === 0 ? (
                                <div className="empty-state">
                                    <p>No items in this category yet.</p>
                                </div>
                            ) : (
                                activeItems.map((item) => (
                                    <div key={item.id} className="item-row">
                                        <div className="item-info">
                                            <h4>{item.title}</h4>
                                            {item.description && <p>{item.description}</p>}
                                            <div className="item-meta">
                                                {item.date && <span>{item.date}</span>}
                                                {item.link && (
                                                    <>
                                                        {item.date && ' · '}
                                                        <a href={item.link} target="_blank" rel="noreferrer">{item.link}</a>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="item-actions">
                                            <button onClick={() => openItemModal(item)} className="btn btn-secondary btn-sm">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="btn btn-danger btn-sm">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2>

                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                value={itemForm.title}
                                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                                placeholder="Item title"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <input
                                value={itemForm.description}
                                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                placeholder="Short description"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    value={itemForm.date}
                                    onChange={(e) => setItemForm({ ...itemForm, date: e.target.value })}
                                    placeholder="e.g. 2024, Jan 2024"
                                />
                            </div>
                            <div className="form-group">
                                <label>Link</label>
                                <input
                                    value={itemForm.link}
                                    onChange={(e) => setItemForm({ ...itemForm, link: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Priority</label>
                                <input
                                    type="number"
                                    value={itemForm.sort_order}
                                    onChange={(e) => setItemForm({ ...itemForm, sort_order: e.target.value })}
                                    placeholder="0 is highest priority"
                                />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    value={itemForm.image_url}
                                    onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                                    placeholder="https://... (optional)"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Body (Markdown)</label>
                            <textarea
                                value={itemForm.body}
                                onChange={(e) => setItemForm({ ...itemForm, body: e.target.value })}
                                rows={6}
                                placeholder="Detailed content, supports markdown..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowItemModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleSaveItem} className="btn btn-primary">
                                {editingItem ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

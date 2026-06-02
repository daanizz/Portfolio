import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SocialsManager() {
    const { apiFetch } = useAuth();
    const [socials, setSocials] = useState([]);
    const [platform, setPlatform] = useState('');
    const [url, setUrl] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ platform: '', url: '' });
    const [loading, setLoading] = useState(true);

    const fetchSocials = async () => {
        const res = await apiFetch('/api/socials');
        const data = await res.json();
        setSocials(data);
        setLoading(false);
    };

    useEffect(() => { fetchSocials(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!platform.trim() || !url.trim()) return;

        await apiFetch('/api/socials', {
            method: 'POST',
            body: JSON.stringify({ platform: platform.trim(), url: url.trim() }),
        });

        setPlatform('');
        setUrl('');
        fetchSocials();
    };

    const handleUpdate = async (id) => {
        await apiFetch(`/api/socials/${id}`, {
            method: 'PUT',
            body: JSON.stringify(editForm),
        });
        setEditingId(null);
        fetchSocials();
    };

    const handleDelete = async (id) => {
        await apiFetch(`/api/socials/${id}`, { method: 'DELETE' });
        fetchSocials();
    };

    const startEdit = (social) => {
        setEditingId(social.id);
        setEditForm({ platform: social.platform, url: social.url });
    };

    if (loading) return <div className="empty-state"><span className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <h1>Social Links</h1>
                <p>Manage your social media links. They appear in the hero and footer.</p>
            </div>

            <div className="card">
                <form onSubmit={handleAdd} className="inline-form">
                    <div className="form-group">
                        <label>Platform</label>
                        <input
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            placeholder="e.g. GitHub, LinkedIn"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>URL</label>
                        <input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                        Add Link
                    </button>
                </form>
            </div>

            {socials.length === 0 ? (
                <div className="empty-state">
                    <p>No social links yet. Add your first link above.</p>
                </div>
            ) : (
                <div className="card">
                    {socials.map((social) => (
                        <div key={social.id} className="item-row">
                            {editingId === social.id ? (
                                <div className="inline-form" style={{ flex: 1 }}>
                                    <div className="form-group">
                                        <input
                                            value={editForm.platform}
                                            onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            value={editForm.url}
                                            onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                        />
                                    </div>
                                    <button onClick={() => handleUpdate(social.id)} className="btn btn-primary btn-sm">Save</button>
                                    <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                                </div>
                            ) : (
                                <>
                                    <div className="item-info">
                                        <h4>{social.platform}</h4>
                                        <p>{social.url}</p>
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={() => startEdit(social)} className="btn btn-secondary btn-sm">Edit</button>
                                        <button onClick={() => handleDelete(social.id)} className="btn btn-danger btn-sm">Delete</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

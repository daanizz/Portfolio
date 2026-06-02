import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileEditor() {
    const { apiFetch } = useAuth();
    const [form, setForm] = useState({ name: '', tagline: '', bio: '', email: '', avatar_url: '' });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/api/profile')
            .then((r) => r.json())
            .then((data) => {
                setForm({ name: data.name, tagline: data.tagline, bio: data.bio, email: data.email, avatar_url: data.avatar_url || '' });
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setStatus('');
        try {
            const res = await apiFetch('/api/profile', {
                method: 'PUT',
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setStatus('Profile updated successfully.');
            }
        } catch {
            setStatus('Failed to update profile.');
        }
    };

    if (loading) return <div className="empty-state"><span className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <h1>Profile</h1>
                <p>Manage your name, tagline, bio, and contact email.</p>
            </div>

            {status && (
                <div className={`alert ${status.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {status}
                </div>
            )}

            <div className="card">
                <div className="form-row">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Your Name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tagline</label>
                        <input
                            value={form.tagline}
                            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                            placeholder="Developer & Designer"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="hello@example.com"
                    />
                </div>

                <div className="form-group">
                    <label>Avatar URL (Optional)</label>
                    <input
                        type="url"
                        value={form.avatar_url}
                        onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                        placeholder="https://example.com/your-image.jpg"
                    />
                </div>

                <div className="form-group">
                    <label>Bio (supports Markdown)</label>
                    <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        rows={8}
                        placeholder="Write something about yourself..."
                    />
                </div>

                <button onClick={handleSave} className="btn btn-primary">
                    Save Profile
                </button>
            </div>
        </>
    );
}

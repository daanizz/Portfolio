import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SkillsManager() {
    const { apiFetch } = useAuth();
    const [skills, setSkills] = useState([]);
    const [name, setName] = useState('');
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchSkills = async () => {
        const res = await apiFetch('/api/skills');
        const data = await res.json();
        setSkills(data);
        setLoading(false);
    };

    useEffect(() => { fetchSkills(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        await apiFetch('/api/skills', {
            method: 'POST',
            body: JSON.stringify({ name: name.trim(), group_name: groupName.trim() || 'General' }),
        });

        setName('');
        setGroupName('');
        fetchSkills();
    };

    const handleDelete = async (id) => {
        await apiFetch(`/api/skills/${id}`, { method: 'DELETE' });
        fetchSkills();
    };

    // Group skills for display
    const grouped = skills.reduce((acc, skill) => {
        const g = skill.group_name || 'General';
        if (!acc[g]) acc[g] = [];
        acc[g].push(skill);
        return acc;
    }, {});

    if (loading) return <div className="empty-state"><span className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <h1>Skills</h1>
                <p>Add skills and optionally group them by category.</p>
            </div>

            <div className="card">
                <form onSubmit={handleAdd} className="inline-form">
                    <div className="form-group">
                        <label>Skill Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. React, Python"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Group (optional)</label>
                        <input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g. Frontend, Backend"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                        Add Skill
                    </button>
                </form>
            </div>

            {Object.keys(grouped).length === 0 ? (
                <div className="empty-state">
                    <p>No skills yet. Add your first skill above.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([group, items]) => (
                    <div key={group} className="card">
                        <div className="card-header">
                            <h3>{group}</h3>
                        </div>
                        <div className="tag-list">
                            {items.map((skill) => (
                                <span key={skill.id} className="tag">
                                    {skill.name}
                                    <button onClick={() => handleDelete(skill.id)} title="Remove">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </>
    );
}

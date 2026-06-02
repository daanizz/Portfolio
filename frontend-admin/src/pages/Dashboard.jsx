import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileEditor from '../components/ProfileEditor';
import SkillsManager from '../components/SkillsManager';
import SocialsManager from '../components/SocialsManager';
import CategoriesManager from '../components/CategoriesManager';

const NAV_ITEMS = [
    { id: 'profile', label: '✎ Profile' },
    { id: 'skills', label: '◆ Skills' },
    { id: 'socials', label: '↗ Socials' },
    { id: 'categories', label: '▦ Categories' },
];

export default function Dashboard() {
    const { logout } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderSection = () => {
        switch (activeSection) {
            case 'profile': return <ProfileEditor />;
            case 'skills': return <SkillsManager />;
            case 'socials': return <SocialsManager />;
            case 'categories': return <CategoriesManager />;
            default: return null;
        }
    };

    return (
        <>
            <button
                className="mobile-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
            >
                ☰
            </button>

            <div className="dashboard">
                <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-brand">
                        <span>Admin Panel</span>
                        <h2>Portfolio</h2>
                    </div>

                    <nav>
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setSidebarOpen(false);
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <button onClick={logout} className="btn btn-secondary btn-block btn-sm">
                            Sign Out
                        </button>
                    </div>
                </aside>

                <main className="main-content" onClick={() => setSidebarOpen(false)}>
                    {renderSection()}
                </main>
            </div>
        </>
    );
}

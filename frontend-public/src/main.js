/* ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  Public Portfolio — Dynamic Renderer                                       ║
 * ║  Fetches all data from API and renders sections with scroll animations     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝ */

const API = import.meta.env.VITE_API_URL || '';

// ── Simple Markdown → HTML (lightweight, no deps) ──────────────────────────────

function md(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        // Inline code
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
        // Line breaks → paragraphs
        .split(/\n\n+/)
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
}

// ── Social icon SVGs (simple, clean) ───────────────────────────────────────────

const SOCIAL_ICONS = {
    github: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
    linkedin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    twitter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    youtube: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
    dribbble: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.81zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-9.36c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702A10.04 10.04 0 0012 1.8c-.824 0-1.63.087-2.4.252zm10.335 3.483c-.218.29-1.91 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>`,
    email: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>`,
    website: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
};

function getSocialIcon(platform) {
    const key = platform.toLowerCase().replace(/\s+/g, '');
    return SOCIAL_ICONS[key] || SOCIAL_ICONS.website;
}

// ── Data Fetching ──────────────────────────────────────────────────────────────

async function fetchJSON(endpoint) {
    const res = await fetch(`${API}${endpoint}`);
    return res.json();
}

// ── Renderers ──────────────────────────────────────────────────────────────────

function renderHeroSocials(socials, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = socials
        .map(s => `<a href="${s.url}" target="_blank" rel="noreferrer" title="${s.platform}">${getSocialIcon(s.platform)} ${s.platform}</a>`)
        .join('');
}

function renderSkills(skills) {
    const container = document.getElementById('skills-content');

    // Group by group_name
    const groups = {};
    skills.forEach(s => {
        const g = s.group_name || 'General';
        if (!groups[g]) groups[g] = [];
        groups[g].push(s);
    });

    if (Object.keys(groups).length === 0) {
        container.innerHTML = '<p style="color:var(--text-dim)">No skills added yet.</p>';
        return;
    }

    container.innerHTML = Object.entries(groups)
        .map(([group, items]) => `
      <div class="skills-group reveal">
        <div class="skills-group__title">${group}</div>
        <div class="skills-tags reveal-stagger">
          ${items.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}
        </div>
      </div>
    `)
        .join('');
}

function renderCategories(categories) {
    const container = document.getElementById('categories-container');

    container.innerHTML = categories
        .filter(cat => cat.items && cat.items.length > 0)
        .map(cat => `
      <section class="category-section">
        <div class="section__grid">
          <div class="section__label reveal">${cat.name}</div>
          <div class="category-items reveal-stagger">
            ${cat.items.map(item => `
              <div class="category-card">
                ${item.image_url ? `<div class="category-card__image-wrapper"><img class="category-card__image" src="${item.image_url}" alt="${item.title}" loading="lazy" /></div>` : ''}
                ${item.date ? `<div class="category-card__date">${item.date}</div>` : ''}
                <h3 class="category-card__title">
                  ${item.link ? `<a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a>` : item.title}
                </h3>
                ${item.description ? `<p class="category-card__desc">${item.description}</p>` : ''}
                ${item.body ? `<div class="category-card__body">${md(item.body)}</div>` : ''}
                ${item.link ? `<a href="${item.link}" class="category-card__link" target="_blank" rel="noreferrer">View →</a>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `)
        .join('');
}

// ── Scroll Reveal Observer ─────────────────────────────────────────────────────

function initScrollReveal() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
        observer.observe(el);
    });
}

// ── Init ───────────────────────────────────────────────────────────────────────

async function init() {
    try {
        const [profile, skills, socials, categories] = await Promise.all([
            fetchJSON('/api/profile'),
            fetchJSON('/api/skills'),
            fetchJSON('/api/socials'),
            fetchJSON('/api/categories'),
        ]);

        // Hero
        document.getElementById('hero-name').textContent = profile.name;
        document.getElementById('hero-tagline').textContent = profile.tagline;
        document.title = `${profile.name} — Portfolio`;

        // Avatar
        const avatarEl = document.getElementById('hero-avatar');
        if (profile.avatar_url) {
            avatarEl.src = profile.avatar_url;
            avatarEl.style.display = 'block';
        }

        // Socials (hero + footer)
        renderHeroSocials(socials, 'hero-socials');
        document.getElementById('footer-socials').innerHTML = socials
            .map(s => `<a href="${s.url}" target="_blank" rel="noreferrer">${s.platform}</a>`)
            .join('');

        // About
        document.getElementById('about-content').innerHTML = md(profile.bio);

        // Skills
        renderSkills(skills);

        // Dynamic categories
        renderCategories(categories);

        // Contact
        document.getElementById('contact-email').textContent = profile.email;
        document.getElementById('contact-email').href = `mailto:${profile.email}`;

        // Footer
        document.getElementById('footer-name').textContent = profile.name;
        document.getElementById('footer-year').textContent = new Date().getFullYear();

        // Init scroll animations after content is rendered
        requestAnimationFrame(() => {
            initScrollReveal();
        });
    } catch (err) {
        console.error('Failed to load portfolio data:', err);
    }
}

init();
